from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from enum import Enum

class SQLSyntaxEnum(str, Enum):
    """Supported SQL syntax types"""
    SQLITE = "SQLite"
    POSTGRESQL = "PostgreSQL"
    MYSQL = "MySQL"
    MSSQL = "Microsoft SQL Server"

class LLMProviderEnum(str, Enum):
    """Supported LLM providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"

class Text2SQLRequest(BaseModel):
    """Request model for text-to-SQL conversion"""
    query: str = Field(
        ..., 
        description="Natural language query to convert to SQL",
        min_length=1,
        max_length=1000,
        example="Show me the total revenue for each product category last month"
    )
    app_configuration_id: int = Field(
        ...,
        description="ID of the app configuration to use for context",
        example=1
    )
    sql_syntax: SQLSyntaxEnum = Field(
        default=SQLSyntaxEnum.SQLITE,
        description="Target SQL syntax for the generated query"
    )
    include_previous_context: bool = Field(
        default=False,
        description="Whether to include previous conversation context"
    )
    llm_provider: LLMProviderEnum = Field(
        default=LLMProviderEnum.OPENAI,
        description="LLM provider to use for query generation"
    )

class ConversationContext(BaseModel):
    """Model for conversation history context"""
    user_query: str
    generated_sql: str
    timestamp: str
    
class ConfigurationTestRequest(BaseModel):
    """Request model for testing app configuration"""
    app_configuration_id: int = Field(
        ...,
        description="ID of the app configuration to test",
        example=1
    )
    sample_queries: List[str] = Field(
        default=[
            "Show me total sales",
            "List all customers",
            "What were last month's orders?"
        ],
        description="Sample queries to test with the configuration"
    )