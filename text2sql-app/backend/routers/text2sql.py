from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
import time
from datetime import datetime
from typing import List, Dict, Any

from models import (
    Text2SQLRequest,
    Text2SQLResponse,
    ConfigurationListResponse,
    ConfigurationDetailResponse,
    TestDataResponse,
    ErrorResponse
)

from services import DatabaseService, TemplateService, LLMService, LLMServiceError
from utils.test_data import TestDataGenerator

router = APIRouter()

# Service instances (could be injected as dependencies)
db_service = DatabaseService()
template_service = TemplateService()
llm_service = LLMService()

@router.post("/text2sql/query", response_model=Text2SQLResponse)
async def generate_sql_query(request: Text2SQLRequest):
    """
    Convert natural language query to SQL using configured app context
    """
    start_time = time.time()
    
    try:
        # Get app configuration details
        app_config = db_service.get_app_configuration_detail(request.app_configuration_id)
        if not app_config:
            raise HTTPException(
                status_code=404,
                detail=f"App configuration {request.app_configuration_id} not found"
            )
        
        # Get table schemas for the app
        table_schemas = db_service.get_table_schemas_for_app(request.app_configuration_id)
        
        # Prepare template variables
        template_vars = {
            "SQL_SYNTAX": request.sql_syntax.value,
            "METRIC_DEFINITIONS": TestDataGenerator.get_metric_definitions(),
            "SEMANTIC_NOUNS": TestDataGenerator.get_semantic_nouns(),
            "TABLE_SCHEMAS": table_schemas,
            "PREVIOUS_CONTEXT": TestDataGenerator.get_sample_previous_context() if request.include_previous_context else "",
            "BUSINESS_INSTRUCTIONS": app_config["business_instructions"]
        }
        
        # Build the complete prompt
        full_prompt = template_service.substitute_variables(template_vars)
        
        # Generate SQL using LLM
        response_text, llm_metadata = await llm_service.generate_sql(
            full_prompt,
            request.query,
            request.llm_provider.value
        )
        
        # Extract SQL and explanation from response
        generated_sql, explanation = llm_service.extract_sql_from_response(response_text)
        
        execution_time = (time.time() - start_time) * 1000
        
        return Text2SQLResponse(
            success=True,
            query=request.query,
            generated_sql=generated_sql,
            explanation=explanation,
            execution_time_ms=execution_time,
            llm_provider=request.llm_provider.value,
            sql_syntax=request.sql_syntax.value,
            metadata={
                "app_config_id": request.app_configuration_id,
                "app_name": app_config["app_name"],
                "table_count": len(app_config["tables"]),
                **llm_metadata
            }
        )
        
    except LLMServiceError as e:
        raise HTTPException(status_code=503, detail=f"LLM service error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

@router.get("/text2sql/configurations", response_model=ConfigurationListResponse)
async def list_app_configurations():
    """
    Get list of all available app configurations
    """
    try:
        configs = db_service.get_all_app_configurations()
        
        # Convert to response format
        config_summaries = []
        for config in configs:
            config_summaries.append({
                "id": config["id"],
                "app_name": config["app_name"],
                "business_instructions": config["business_instructions"],
                "table_count": config["table_count"],
                "field_count": config["field_count"],
                "created_at": datetime.fromtimestamp(config["created_at"] / 1000),
                "updated_at": datetime.fromtimestamp(config["updated_at"] / 1000)
            })
        
        return ConfigurationListResponse(
            success=True,
            data=config_summaries,
            count=len(config_summaries)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/text2sql/configurations/{app_id}", response_model=ConfigurationDetailResponse)
async def get_app_configuration_detail(app_id: int):
    """
    Get detailed information about a specific app configuration
    """
    try:
        config = db_service.get_app_configuration_detail(app_id)
        
        if not config:
            return ConfigurationDetailResponse(
                success=False,
                data=None,
                error=f"App configuration {app_id} not found"
            )
        
        # Convert to response format
        config_detail = {
            "id": config["id"],
            "app_name": config["app_name"],
            "business_instructions": config["business_instructions"],
            "tables": [
                {
                    "table_name": table["table_name"],
                    "table_description": table["table_description"],
                    "fields": table["fields"]
                }
                for table in config["tables"]
            ],
            "created_at": datetime.fromtimestamp(config["created_at"] / 1000),
            "updated_at": datetime.fromtimestamp(config["updated_at"] / 1000)
        }
        
        return ConfigurationDetailResponse(
            success=True,
            data=config_detail
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/text2sql/test-data", response_model=TestDataResponse)
async def get_test_data(sql_syntax: str = "SQLite"):
    """
    Get sample test data for all template variables
    """
    try:
        test_data = TestDataGenerator.get_all_test_data(sql_syntax)
        
        return TestDataResponse(
            success=True,
            sql_syntax=test_data["SQL_SYNTAX"],
            metric_definitions={
                "raw": test_data["METRIC_DEFINITIONS"],
                "description": "Business metrics and their calculation methods"
            },
            semantic_nouns=test_data["SEMANTIC_NOUNS"].split(", "),
            table_schemas=test_data["TABLE_SCHEMAS"],
            business_instructions=test_data["BUSINESS_INSTRUCTIONS"],
            sample_previous_context=test_data["PREVIOUS_CONTEXT"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating test data: {str(e)}")

@router.get("/text2sql/template/preview")
async def preview_template(
    app_id: int = None,
    sql_syntax: str = "SQLite",
    use_sample_data: bool = False
):
    """
    Preview the template with actual app data or sample data
    """
    try:
        if use_sample_data or app_id is None:
            # Use sample test data
            template_vars = TestDataGenerator.get_all_test_data(sql_syntax)
        else:
            # Use real app configuration data
            app_config = db_service.get_app_configuration_detail(app_id)
            if not app_config:
                raise HTTPException(
                    status_code=404,
                    detail=f"App configuration {app_id} not found"
                )
            
            table_schemas = db_service.get_table_schemas_for_app(app_id)
            
            template_vars = {
                "SQL_SYNTAX": sql_syntax,
                "METRIC_DEFINITIONS": TestDataGenerator.get_metric_definitions(),
                "SEMANTIC_NOUNS": TestDataGenerator.get_semantic_nouns(),
                "TABLE_SCHEMAS": table_schemas,
                "PREVIOUS_CONTEXT": TestDataGenerator.get_sample_previous_context(),
                "BUSINESS_INSTRUCTIONS": app_config["business_instructions"]
            }
        
        # Generate preview
        preview = template_service.substitute_variables(template_vars)
        
        return {
            "success": True,
            "preview": preview,
            "template_vars": {k: len(str(v)) for k, v in template_vars.items()},
            "template_length": len(preview),
            "app_id": app_id,
            "using_sample_data": use_sample_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating preview: {str(e)}")

@router.get("/text2sql/health")
async def health_check():
    """
    Health check for text2sql service and dependencies
    """
    try:
        health_status = {
            "service": "text2sql",
            "status": "healthy",
            "timestamp": datetime.now(),
            "components": {}
        }
        
        # Check database connectivity
        db_healthy = db_service.test_connection()
        health_status["components"]["database"] = {
            "status": "healthy" if db_healthy else "unhealthy",
            "message": "Connected to SQLite database" if db_healthy else "Database connection failed"
        }
        
        # Check template service
        try:
            template_validation = template_service.validate_template()
            health_status["components"]["template"] = {
                "status": "healthy" if template_validation["is_valid"] else "warning",
                "message": f"Template loaded with {len(template_validation['found_variables'])} variables",
                "details": template_validation
            }
        except Exception as e:
            health_status["components"]["template"] = {
                "status": "unhealthy",
                "message": f"Template service error: {str(e)}"
            }
        
        # Check LLM service
        llm_health = llm_service.health_check()
        health_status["components"]["llm"] = llm_health
        
        # Overall health status
        unhealthy_components = [
            comp for comp, status in health_status["components"].items()
            if status.get("status") == "unhealthy"
        ]
        
        if unhealthy_components:
            health_status["status"] = "unhealthy"
            health_status["message"] = f"Unhealthy components: {', '.join(unhealthy_components)}"
        
        return health_status
        
    except Exception as e:
        return {
            "service": "text2sql",
            "status": "unhealthy",
            "timestamp": datetime.now(),
            "error": str(e)
        }

@router.get("/text2sql/sample-queries")
async def get_sample_queries():
    """
    Get sample natural language queries for testing
    """
    try:
        queries = TestDataGenerator.get_sample_queries()
        
        return {
            "success": True,
            "queries": queries,
            "count": len(queries),
            "description": "Sample natural language queries for testing text-to-SQL conversion"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating sample queries: {str(e)}")