import os
from typing import Dict, Any, Optional, Tuple
import json
import time
from abc import ABC, abstractmethod

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

class LLMServiceError(Exception):
    """Custom exception for LLM service errors"""
    pass

class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers"""
    
    @abstractmethod
    async def generate_response(self, prompt: str, user_query: str) -> Tuple[str, Dict[str, Any]]:
        """Generate response from the LLM"""
        pass
    
    @abstractmethod
    def is_configured(self) -> bool:
        """Check if the provider is properly configured"""
        pass

class OpenAIProvider(BaseLLMProvider):
    """OpenAI API provider"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4"):
        if not OPENAI_AVAILABLE:
            raise ImportError("OpenAI package not installed. Run: pip install openai")
        
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model
        
        if self.api_key:
            openai.api_key = self.api_key
    
    def is_configured(self) -> bool:
        return self.api_key is not None
    
    async def generate_response(self, prompt: str, user_query: str) -> Tuple[str, Dict[str, Any]]:
        if not self.is_configured():
            raise LLMServiceError("OpenAI API key not configured")
        
        try:
            client = openai.OpenAI(api_key=self.api_key)
            
            messages = [
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_query}
            ]
            
            start_time = time.time()
            
            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.1,  # Low temperature for consistent SQL generation
                max_tokens=1500,
                top_p=0.95
            )
            
            end_time = time.time()
            execution_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            content = response.choices[0].message.content
            
            metadata = {
                "model": self.model,
                "tokens_used": response.usage.total_tokens if response.usage else 0,
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                "execution_time_ms": execution_time
            }
            
            return content, metadata
            
        except Exception as e:
            raise LLMServiceError(f"OpenAI API error: {str(e)}")

class AnthropicProvider(BaseLLMProvider):
    """Anthropic Claude API provider"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "claude-3-5-sonnet-20241022"):
        if not ANTHROPIC_AVAILABLE:
            raise ImportError("Anthropic package not installed. Run: pip install anthropic")
        
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.model = model
        
        if self.api_key:
            self.client = anthropic.Anthropic(api_key=self.api_key)
    
    def is_configured(self) -> bool:
        return self.api_key is not None
    
    async def generate_response(self, prompt: str, user_query: str) -> Tuple[str, Dict[str, Any]]:
        if not self.is_configured():
            raise LLMServiceError("Anthropic API key not configured")
        
        try:
            start_time = time.time()
            
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1500,
                temperature=0.1,
                system=prompt,
                messages=[
                    {"role": "user", "content": user_query}
                ]
            )
            
            end_time = time.time()
            execution_time = (end_time - start_time) * 1000  # Convert to milliseconds
            
            content = response.content[0].text
            
            metadata = {
                "model": self.model,
                "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
                "prompt_tokens": response.usage.input_tokens,
                "completion_tokens": response.usage.output_tokens,
                "execution_time_ms": execution_time
            }
            
            return content, metadata
            
        except Exception as e:
            raise LLMServiceError(f"Anthropic API error: {str(e)}")

class LLMService:
    """Main service for managing LLM providers"""
    
    def __init__(self):
        self.providers = {}
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize available LLM providers"""
        # Initialize OpenAI provider
        try:
            self.providers["openai"] = OpenAIProvider()
        except ImportError:
            pass
        
        # Initialize Anthropic provider
        try:
            self.providers["anthropic"] = AnthropicProvider()
        except ImportError:
            pass
    
    def get_available_providers(self) -> Dict[str, bool]:
        """Get list of available and configured providers"""
        return {
            provider_name: provider.is_configured()
            for provider_name, provider in self.providers.items()
        }
    
    def get_provider(self, provider_name: str) -> BaseLLMProvider:
        """Get specific provider instance"""
        if provider_name not in self.providers:
            raise LLMServiceError(f"Provider '{provider_name}' not available")
        
        provider = self.providers[provider_name]
        if not provider.is_configured():
            raise LLMServiceError(f"Provider '{provider_name}' not configured")
        
        return provider
    
    async def generate_sql(
        self,
        prompt: str,
        user_query: str,
        provider_name: str = "openai"
    ) -> Tuple[str, Dict[str, Any]]:
        """Generate SQL using specified provider"""
        provider = self.get_provider(provider_name)
        return await provider.generate_response(prompt, user_query)
    
    def extract_sql_from_response(self, response: str) -> Tuple[Optional[str], Optional[str]]:
        """Extract SQL query and explanation from LLM response"""
        # Try to find SQL query in the response
        sql_patterns = [
            r'SQLQuery:\s*(.+?)(?=\n\nSQLResult:|$)',
            r'```sql\n(.*?)```',
            r'<sql>(.*?)</sql>',
            r'SQL:\s*(.+?)(?=\n|$)'
        ]
        
        sql_query = None
        for pattern in sql_patterns:
            import re
            match = re.search(pattern, response, re.DOTALL | re.IGNORECASE)
            if match:
                sql_query = match.group(1).strip()
                break
        
        # Try to find explanation/answer
        explanation_patterns = [
            r'Answer:\s*(.+?)$',
            r'Explanation:\s*(.+?)(?=\n\n|$)',
            r'<answer>(.*?)</answer>'
        ]
        
        explanation = None
        for pattern in explanation_patterns:
            import re
            match = re.search(pattern, response, re.DOTALL | re.IGNORECASE)
            if match:
                explanation = match.group(1).strip()
                break
        
        return sql_query, explanation
    
    def health_check(self) -> Dict[str, Any]:
        """Health check for all providers"""
        health_status = {
            "service": "llm_service",
            "status": "healthy",
            "providers": {}
        }
        
        for provider_name, provider in self.providers.items():
            try:
                is_configured = provider.is_configured()
                health_status["providers"][provider_name] = {
                    "available": True,
                    "configured": is_configured,
                    "status": "ready" if is_configured else "not_configured"
                }
            except Exception as e:
                health_status["providers"][provider_name] = {
                    "available": False,
                    "configured": False,
                    "status": "error",
                    "error": str(e)
                }
        
        # Overall status
        any_configured = any(
            provider["configured"] 
            for provider in health_status["providers"].values()
        )
        
        if not any_configured:
            health_status["status"] = "unhealthy"
            health_status["message"] = "No LLM providers configured"
        
        return health_status