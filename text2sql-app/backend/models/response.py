from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class Text2SQLResponse(BaseModel):
    """Response model for text-to-SQL conversion"""
    success: bool = Field(description="Whether the request was successful")
    query: str = Field(description="Original natural language query")
    generated_sql: Optional[str] = Field(
        default=None,
        description="Generated SQL query"
    )
    explanation: Optional[str] = Field(
        default=None,
        description="Explanation of the generated SQL"
    )
    execution_time_ms: Optional[float] = Field(
        default=None,
        description="Time taken to generate the SQL in milliseconds"
    )
    llm_provider: Optional[str] = Field(
        default=None,
        description="LLM provider used for generation"
    )
    sql_syntax: Optional[str] = Field(
        default=None,
        description="Target SQL syntax used"
    )
    error: Optional[str] = Field(
        default=None,
        description="Error message if request failed"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional metadata about the generation process"
    )

class AppConfigurationSummary(BaseModel):
    """Summary model for app configurations"""
    id: int
    app_name: str
    business_instructions: str
    table_count: int
    field_count: int
    created_at: datetime
    updated_at: datetime

class TableSchema(BaseModel):
    """Model for table schema information"""
    table_name: str
    table_description: str
    fields: List[Dict[str, Any]]

class AppConfigurationDetail(BaseModel):
    """Detailed model for app configuration"""
    id: int
    app_name: str
    business_instructions: str
    tables: List[TableSchema]
    created_at: datetime
    updated_at: datetime
    
class ConfigurationListResponse(BaseModel):
    """Response model for listing app configurations"""
    success: bool
    data: List[AppConfigurationSummary]
    count: int

class ConfigurationDetailResponse(BaseModel):
    """Response model for app configuration details"""
    success: bool
    data: Optional[AppConfigurationDetail]
    error: Optional[str] = None

class HealthCheckResponse(BaseModel):
    """Response model for health check"""
    status: str
    service: str
    timestamp: datetime
    version: str = "1.0.0"

class ErrorResponse(BaseModel):
    """Standard error response model"""
    success: bool = False
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

class TestDataResponse(BaseModel):
    """Response model for test data generation"""
    success: bool
    sql_syntax: str
    metric_definitions: Dict[str, str]
    semantic_nouns: List[str]
    table_schemas: str
    business_instructions: str
    sample_previous_context: str