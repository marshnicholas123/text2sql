#!/usr/bin/env python3
"""
Basic functionality test for the Text2SQL backend service
"""
import os
import sys
import json
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test if all modules import correctly"""
    print("🧪 Testing module imports...")
    
    try:
        from models import Text2SQLRequest, Text2SQLResponse
        print("✅ Models imported successfully")
    except Exception as e:
        print(f"❌ Models import failed: {e}")
        return False
    
    try:
        from services import DatabaseService, TemplateService
        print("✅ Services imported successfully")
    except Exception as e:
        print(f"❌ Services import failed: {e}")
        return False
    
    try:
        from utils.test_data import TestDataGenerator
        print("✅ Test data generator imported successfully")
    except Exception as e:
        print(f"❌ Test data generator import failed: {e}")
        return False
    
    return True

def test_database_service():
    """Test database service functionality"""
    print("\n🗄️  Testing database service...")
    
    try:
        from services import DatabaseService
        
        # Test database path
        backend_dir = Path(__file__).parent
        project_root = backend_dir.parent
        db_path = project_root / "prisma" / "dev.db"
        
        if not db_path.exists():
            print(f"❌ Database not found at {db_path}")
            return False
        
        print(f"✅ Database found at {db_path}")
        
        # Test database service
        db_service = DatabaseService()
        
        # Test connection
        if db_service.test_connection():
            print("✅ Database connection successful")
        else:
            print("❌ Database connection failed")
            return False
        
        # Test fetching app configurations
        configs = db_service.get_all_app_configurations()
        print(f"✅ Found {len(configs)} app configurations")
        
        return True
        
    except Exception as e:
        print(f"❌ Database service test failed: {e}")
        return False

def test_template_service():
    """Test template service functionality"""
    print("\n📝 Testing template service...")
    
    try:
        from services import TemplateService
        
        # Test template path
        backend_dir = Path(__file__).parent
        project_root = backend_dir.parent.parent
        template_path = project_root / "text2sql_prompt.txt"
        
        if not template_path.exists():
            print(f"❌ Template not found at {template_path}")
            return False
        
        print(f"✅ Template found at {template_path}")
        
        # Test template service
        template_service = TemplateService()
        
        # Test template validation
        validation = template_service.validate_template()
        print(f"✅ Template validation: {validation['is_valid']}")
        print(f"   - Found variables: {validation['found_variables']}")
        
        # Test variable substitution
        test_vars = {
            "SQL_SYNTAX": "SQLite",
            "METRIC_DEFINITIONS": "Test metrics",
            "SEMANTIC_NOUNS": "test, nouns",
            "TABLE_SCHEMAS": "Test schemas",
            "PREVIOUS_CONTEXT": "Test context",
            "BUSINESS_INSTRUCTIONS": "Test instructions"
        }
        
        result = template_service.substitute_variables(test_vars)
        print(f"✅ Template substitution successful, length: {len(result)} characters")
        
        return True
        
    except Exception as e:
        print(f"❌ Template service test failed: {e}")
        return False

def test_data_generation():
    """Test test data generation"""
    print("\n🎲 Testing test data generation...")
    
    try:
        from utils.test_data import TestDataGenerator
        
        # Test individual data generators
        sql_options = TestDataGenerator.get_sql_syntax_options()
        print(f"✅ SQL syntax options: {len(sql_options)} available")
        
        metrics = TestDataGenerator.get_metric_definitions()
        print(f"✅ Metric definitions: {len(metrics)} characters")
        
        nouns = TestDataGenerator.get_semantic_nouns()
        print(f"✅ Semantic nouns: {len(nouns.split(', '))} terms")
        
        schemas = TestDataGenerator.get_sample_table_schemas()
        print(f"✅ Sample table schemas: {len(schemas)} characters")
        
        instructions = TestDataGenerator.get_sample_business_instructions()
        print(f"✅ Business instructions: {len(instructions)} characters")
        
        context = TestDataGenerator.get_sample_previous_context()
        print(f"✅ Previous context: {len(context)} characters")
        
        # Test complete data generation
        all_data = TestDataGenerator.get_all_test_data()
        print(f"✅ Complete test data: {len(all_data)} variables")
        
        # Test sample queries
        queries = TestDataGenerator.get_sample_queries()
        print(f"✅ Sample queries: {len(queries)} examples")
        
        return True
        
    except Exception as e:
        print(f"❌ Test data generation failed: {e}")
        return False

def test_pydantic_models():
    """Test Pydantic model validation"""
    print("\n🔍 Testing Pydantic models...")
    
    try:
        from models import Text2SQLRequest, Text2SQLResponse
        
        # Test request model validation
        valid_request = {
            "query": "Show me total revenue",
            "app_configuration_id": 1,
            "sql_syntax": "SQLite",
            "llm_provider": "openai"
        }
        
        request = Text2SQLRequest(**valid_request)
        print("✅ Request model validation successful")
        
        # Test response model
        valid_response = {
            "success": True,
            "query": "Show me total revenue",
            "generated_sql": "SELECT SUM(total) FROM orders",
            "explanation": "This query sums all orders"
        }
        
        response = Text2SQLResponse(**valid_response)
        print("✅ Response model validation successful")
        
        return True
        
    except Exception as e:
        print(f"❌ Pydantic model test failed: {e}")
        return False

def test_fastapi_app():
    """Test FastAPI application setup"""
    print("\n🚀 Testing FastAPI application...")
    
    try:
        from main import app
        print("✅ FastAPI app created successfully")
        
        # Check if routes are registered
        routes = [route.path for route in app.routes]
        expected_routes = ["/", "/health", "/api/v1/text2sql/query"]
        
        for expected in expected_routes:
            if any(expected in route for route in routes):
                print(f"✅ Route found: {expected}")
            else:
                print(f"❌ Route missing: {expected}")
        
        return True
        
    except Exception as e:
        print(f"❌ FastAPI app test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Starting Text2SQL Backend Functionality Tests\n")
    
    tests = [
        ("Module Imports", test_imports),
        ("Database Service", test_database_service),
        ("Template Service", test_template_service),
        ("Test Data Generation", test_data_generation),
        ("Pydantic Models", test_pydantic_models),
        ("FastAPI Application", test_fastapi_app)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        results[test_name] = test_func()
    
    # Print summary
    print("\n" + "="*50)
    print("🎯 TEST SUMMARY")
    print("="*50)
    
    passed = 0
    failed = 0
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nResults: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("\n🎉 All tests passed! Backend service is ready.")
    else:
        print(f"\n⚠️  {failed} tests failed. Please check the issues above.")
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)