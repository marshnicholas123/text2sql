import os
import re
from typing import Dict, Any, Optional, Tuple
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
    
    def _clean_html_tags(self, text: str) -> str:
        """Remove HTML tags from text while preserving content"""
        if not text:
            return text
        
        # Remove HTML tags but keep the content
        clean_text = re.sub(r'<[^>]+>', '', text)
        
        # Clean up common HTML entities
        html_entities = {
            '&lt;': '<',
            '&gt;': '>',
            '&amp;': '&',
            '&quot;': '"',
            '&#x27;': "'",
            '&nbsp;': ' ',
            '&ldquo;': '"',
            '&rdquo;': '"',
            '&lsquo;': "'",
            '&rsquo;': "'",
            '&mdash;': '—',
            '&ndash;': '–'
        }
        
        for entity, replacement in html_entities.items():
            clean_text = clean_text.replace(entity, replacement)
        
        # Clean up extra whitespace that might result from removing tags
        clean_text = re.sub(r'\s+', ' ', clean_text.strip())
        
        return clean_text
    
    def _clean_response_content(self, content: str) -> str:
        """Clean and preprocess LLM response content"""
        if not content:
            return content
        
        # Remove HTML tags
        cleaned_content = self._clean_html_tags(content)
        
        # Additional cleaning for common issues
        # Remove excessive newlines
        cleaned_content = re.sub(r'\n{3,}', '\n\n', cleaned_content)
        
        # Clean up markdown-style formatting that might be interpreted as HTML
        cleaned_content = re.sub(r'\*\*(.*?)\*\*', r'\1', cleaned_content)  # Remove bold
        cleaned_content = re.sub(r'\*(.*?)\*', r'\1', cleaned_content)      # Remove italic
        
        return cleaned_content.strip()
    
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
        # First clean the response content
        cleaned_response = self._clean_response_content(response)
        
        # Enhanced SQL query extraction patterns
        sql_patterns = [
            # Standard markdown SQL blocks
            r'```sql\n(.*?)```',
            r'```SQL\n(.*?)```',
            
            # SQL blocks with labels
            r'SQLQuery:\s*(.+?)(?=\s*SQLResult:|Answer:|Explanation:|$)',
            r'SQL Query:\s*(.+?)(?=\s*SQLResult:|Answer:|Explanation:|$)',
            r'Query:\s*(.+?)(?=\s*SQLResult:|Answer:|Explanation:|$)',
            
            # XML-style tags
            r'<sql>(.*?)</sql>',
            r'<query>(.*?)</query>',
            
            # Simple SQL: prefix
            r'SQL:\s*(.+?)(?=\s*SQLResult:|Answer:|Explanation:|$)',
            
            # Fallback - SQL statements followed by semicolon and then other content
            r'((?:SELECT|INSERT|UPDATE|DELETE|WITH|CREATE|ALTER|DROP)\b.*?;)\s*(?:SQLResult:|Answer:|Explanation:|$)',
            
            # More specific fallback - SQL ending with semicolon
            r'((?:SELECT|INSERT|UPDATE|DELETE|WITH|CREATE|ALTER|DROP)\b[^;]*;)(?=\s*\w)',
            
            # Very basic fallback - any SQL statement
            r'((?:SELECT|INSERT|UPDATE|DELETE|WITH|CREATE|ALTER|DROP)\b.*?)(?=\s*SQLResult:|Answer:|Explanation:|$)'
        ]
        
        sql_query = None
        for pattern in sql_patterns:
            match = re.search(pattern, cleaned_response, re.DOTALL | re.IGNORECASE)
            if match:
                sql_query = match.group(1).strip()
                # Clean and refine the SQL query
                sql_query = self._clean_and_refine_sql(sql_query)
                if sql_query and len(sql_query) > 10:  # Basic validation
                    break
        
        # Enhanced explanation extraction
        explanation_patterns = [
            # Standard explanation patterns
            r'Answer:\s*(.+?)(?=\n\n|$)',
            r'Explanation:\s*(.+?)(?=\n\n|$)',
            r'<answer>(.*?)</answer>',
            r'<explanation>(.*?)</explanation>',
            
            # Look for explanatory text after SQL
            r'(?:SQLResult|SQL Result):\s*(.+?)(?=\n\n|$)'
        ]
        
        explanation = None
        for pattern in explanation_patterns:
            match = re.search(pattern, cleaned_response, re.DOTALL | re.IGNORECASE)
            if match:
                explanation = match.group(1).strip()
                # Clean the explanation thoroughly
                explanation = self._clean_html_tags(explanation)
                # Filter out non-explanatory content
                if explanation and not self._is_sql_statement(explanation):
                    break
        
        return sql_query, explanation
    
    def _clean_and_refine_sql(self, sql: str) -> str:
        """Clean and refine extracted SQL query"""
        if not sql:
            return sql
        
        # Remove HTML tags
        cleaned_sql = self._clean_html_tags(sql)
        
        # Remove common prefixes that might have been included
        prefixes_to_remove = [
            r'^SQL:\s*',
            r'^Query:\s*',
            r'^SQLQuery:\s*',
            r'^SQL Query:\s*',
            r'^Answer:\s*',
            r'^SQLResult:\s*',
            r'^SQL Result:\s*'
        ]
        
        for prefix in prefixes_to_remove:
            cleaned_sql = re.sub(prefix, '', cleaned_sql, flags=re.IGNORECASE)
        
        # More aggressive removal of trailing content
        # Look for semicolon followed by explanatory content
        semicolon_then_content = r';\s*(SQLResult:|SQL Result:|Answer:|Explanation:.*|The query.*|This query.*)$'
        cleaned_sql = re.sub(semicolon_then_content, ';', cleaned_sql, flags=re.DOTALL | re.IGNORECASE)
        
        # Remove any remaining trailing explanatory text
        separators = [
            r'\s*SQLResult:.*$',
            r'\s*SQL Result:.*$',
            r'\s*Answer:.*$',
            r'\s*Explanation:.*$',
            r'\n\nThis query.*$',
            r'\n\nThe query.*$',
            r'\s*\[Placeholder.*$'  # Remove placeholder text
        ]
        
        for separator in separators:
            cleaned_sql = re.sub(separator, '', cleaned_sql, flags=re.DOTALL | re.IGNORECASE)
        
        # If SQL doesn't end with semicolon but has one before trailing content, extract up to semicolon
        if ';' in cleaned_sql and not cleaned_sql.rstrip().endswith(';'):
            # Find the last complete SQL statement (ending with semicolon)
            semicolon_match = re.search(r'.*?;', cleaned_sql, re.DOTALL)
            if semicolon_match:
                cleaned_sql = semicolon_match.group(0)
        
        # Clean up whitespace
        cleaned_sql = re.sub(r'\n{3,}', '\n\n', cleaned_sql)
        cleaned_sql = cleaned_sql.strip()
        
        # Format the SQL for better readability
        formatted_sql = self._format_sql(cleaned_sql)
        
        return formatted_sql
    
    def _format_sql(self, sql: str) -> str:
        """Format SQL query for better readability"""
        if not sql:
            return sql
        
        # Remove extra whitespace and normalize
        sql = re.sub(r'\s+', ' ', sql.strip())
        
        # Simple approach: Add line breaks before major keywords
        # But be careful not to break keywords inside subqueries (parentheses)
        
        # First, let's identify parentheses positions to avoid breaking inside them
        paren_positions = []
        paren_depth = 0
        inside_parens = set()
        
        for i, char in enumerate(sql):
            if char == '(':
                paren_depth += 1
            elif char == ')':
                paren_depth -= 1
            
            if paren_depth > 0:
                inside_parens.add(i)
        
        # Keywords that should start on new lines
        keywords = ['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN']
        
        # Add line breaks before keywords (if not inside parentheses)
        for keyword in keywords:
            pattern = r'\b' + re.escape(keyword) + r'\b'
            matches = list(re.finditer(pattern, sql, re.IGNORECASE))
            
            # Process matches from right to left to avoid position shifts
            for match in reversed(matches):
                start_pos = match.start()
                
                # Check if this keyword is inside parentheses
                if not any(pos in inside_parens for pos in range(start_pos, match.end())):
                    # Check if there's content before this keyword
                    if start_pos > 0 and not sql[start_pos-1:start_pos] == '\n':
                        sql = sql[:start_pos] + '\n' + sql[start_pos:]
        
        # Split into lines for indentation
        lines = sql.split('\n')
        formatted_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Determine indentation
            if re.match(r'^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)', line, re.IGNORECASE):
                indent = 0
            elif re.match(r'^(FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT)', line, re.IGNORECASE):
                indent = 0  
            elif re.match(r'^(INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL JOIN|JOIN)', line, re.IGNORECASE):
                indent = 0
            else:
                indent = 0
            
            formatted_lines.append('  ' * indent + line)
        
        # Handle SELECT column formatting if the line is too long
        if formatted_lines and re.match(r'^SELECT', formatted_lines[0], re.IGNORECASE):
            select_line = formatted_lines[0]
            if len(select_line) > 80 and ',' in select_line:
                # Break up SELECT columns
                select_match = re.match(r'^(SELECT\s+)(.*?)(\s+FROM.*)$', select_line, re.IGNORECASE | re.DOTALL)
                if select_match:
                    select_keyword = select_match.group(1)
                    columns = select_match.group(2)
                    rest = select_match.group(3)
                    
                    # Split columns and format
                    column_list = [col.strip() for col in columns.split(',')]
                    formatted_columns = [select_keyword + column_list[0]]
                    
                    for col in column_list[1:]:
                        formatted_columns.append('     , ' + col)
                    
                    # Reconstruct the line
                    formatted_lines[0] = '\n'.join(formatted_columns) + rest
        
        result = '\n'.join(formatted_lines)
        return result.strip()
    
    def _is_sql_statement(self, text: str) -> bool:
        """Check if text appears to be a SQL statement rather than explanation"""
        if not text:
            return False
        
        sql_keywords = [
            'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
            'FROM', 'WHERE', 'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'WITH'
        ]
        
        # Check if text starts with SQL keywords or contains multiple SQL keywords
        text_upper = text.upper().strip()
        starts_with_sql = any(text_upper.startswith(keyword) for keyword in sql_keywords)
        keyword_count = sum(1 for keyword in sql_keywords if keyword in text_upper)
        
        return starts_with_sql or keyword_count >= 2
    
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