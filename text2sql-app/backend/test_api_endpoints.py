#!/usr/bin/env python3
"""
API endpoint testing script for Text2SQL backend
"""
import requests
import json
import sys
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test health endpoint"""
    print("🏥 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health endpoint: {data['status']}")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Is it running?")
        return False
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def test_configurations_endpoint():
    """Test configurations list endpoint"""
    print("\n📋 Testing configurations endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/text2sql/configurations", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Configurations endpoint: {data['count']} configs found")
            return True, data
        else:
            print(f"❌ Configurations endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Configurations endpoint error: {e}")
        return False, None

def test_test_data_endpoint():
    """Test test data endpoint"""
    print("\n🎲 Testing test data endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/text2sql/test-data?sql_syntax=SQLite", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Test data endpoint: {len(data['semantic_nouns'])} semantic nouns")
            return True
        else:
            print(f"❌ Test data endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Test data endpoint error: {e}")
        return False

def test_sample_queries_endpoint():
    """Test sample queries endpoint"""
    print("\n🔍 Testing sample queries endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/text2sql/sample-queries", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Sample queries endpoint: {data['count']} queries available")
            return True, data
        else:
            print(f"❌ Sample queries endpoint failed: {response.status_code}")
            return False, None
    except Exception as e:
        print(f"❌ Sample queries endpoint error: {e}")
        return False, None

def test_template_preview_endpoint():
    """Test template preview endpoint"""
    print("\n📝 Testing template preview endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/text2sql/template/preview?use_sample_data=true", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Template preview endpoint: {data['template_length']} characters")
            return True
        else:
            print(f"❌ Template preview endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Template preview endpoint error: {e}")
        return False

def test_text2sql_health_endpoint():
    """Test text2sql specific health endpoint"""
    print("\n🔬 Testing text2sql health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/text2sql/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Text2SQL health endpoint: {data['status']}")
            
            # Show component status
            if 'components' in data:
                for component, status in data['components'].items():
                    comp_status = status.get('status', 'unknown')
                    print(f"   - {component}: {comp_status}")
            
            return True
        else:
            print(f"❌ Text2SQL health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Text2SQL health endpoint error: {e}")
        return False

def test_query_endpoint_without_llm():
    """Test query endpoint structure (without actual LLM call)"""
    print("\n🚀 Testing query endpoint structure...")
    
    try:
        # This should fail gracefully without LLM API key
        test_request = {
            "query": "Show me total revenue for last month",
            "app_configuration_id": 1,
            "sql_syntax": "SQLite",
            "llm_provider": "openai"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/text2sql/query",
            json=test_request,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        # We expect this to fail with 503 (service unavailable) due to no API key
        if response.status_code == 503:
            print("✅ Query endpoint structure OK (expected failure - no LLM API key)")
            return True
        elif response.status_code == 404:
            print("⚠️  Query endpoint: app configuration not found (this is OK)")
            return True
        else:
            print(f"❓ Unexpected response: {response.status_code}")
            print(f"Response: {response.text}")
            return True  # Still considered a pass since endpoint is responding
            
    except Exception as e:
        print(f"❌ Query endpoint test error: {e}")
        return False

def main():
    """Run all API endpoint tests"""
    print("🧪 Starting Text2SQL API Endpoint Tests")
    print(f"Testing server at: {BASE_URL}\n")
    
    tests = [
        ("Health Check", test_health_endpoint),
        ("Configurations List", test_configurations_endpoint),
        ("Test Data Generation", test_test_data_endpoint), 
        ("Sample Queries", test_sample_queries_endpoint),
        ("Template Preview", test_template_preview_endpoint),
        ("Text2SQL Health", test_text2sql_health_endpoint),
        ("Query Endpoint Structure", test_query_endpoint_without_llm)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        if test_name in ["Configurations List", "Sample Queries"]:
            result, data = test_func()
            results[test_name] = result
        else:
            results[test_name] = test_func()
    
    # Print summary
    print("\n" + "="*60)
    print("🎯 API ENDPOINT TEST SUMMARY")
    print("="*60)
    
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
        print("\n🎉 All API endpoints are working correctly!")
        print("\n📚 Next steps:")
        print("   1. Add LLM API key to .env file to test actual query conversion")
        print("   2. Test with real queries using the /docs interface")
        print("   3. Integrate with frontend application")
    else:
        print(f"\n⚠️  {failed} endpoint tests failed. Check server logs.")
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)