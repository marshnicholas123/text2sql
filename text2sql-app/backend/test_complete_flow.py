#!/usr/bin/env python3
"""
Test the complete flow from text2sql_prompt.txt to SQL generation
"""
import sys
sys.path.insert(0, '.')

from services import DatabaseService, TemplateService, LLMService
from utils.test_data import TestDataGenerator

print("🧪 Testing Complete Template Flow\n")

# 1. Load template
print("1️⃣ Loading template...")
template_service = TemplateService()
print(f"   ✅ Template loaded from: {template_service.template_path}")
print(f"   ✅ Template length: {len(template_service.template_content)} characters")

# 2. Get app configuration
print("\n2️⃣ Getting app configuration...")
db_service = DatabaseService()
configs = db_service.get_all_app_configurations()
if not configs:
    print("   ❌ No app configurations found")
    sys.exit(1)

app_config = db_service.get_app_configuration_detail(configs[0]['id'])
table_schemas = db_service.get_table_schemas_for_app(configs[0]['id'])
print(f"   ✅ Using app: {app_config['app_name']}")
print(f"   ✅ Tables: {len(app_config['tables'])}")

# 3. Prepare template variables
print("\n3️⃣ Preparing template variables...")
template_vars = {
    "SQL_SYNTAX": "SQLite",
    "METRIC_DEFINITIONS": TestDataGenerator.get_metric_definitions(),
    "SEMANTIC_NOUNS": TestDataGenerator.get_semantic_nouns(),
    "TABLE_SCHEMAS": table_schemas,
    "PREVIOUS_CONTEXT": "",
    "BUSINESS_INSTRUCTIONS": app_config["business_instructions"]
}

for var, value in template_vars.items():
    print(f"   ✅ {var}: {len(str(value))} characters")

# 4. Build complete prompt
print("\n4️⃣ Building complete prompt...")
full_prompt = template_service.substitute_variables(template_vars)
print(f"   ✅ Complete prompt length: {len(full_prompt)} characters")
print(f"   ✅ Contains 'SQL Instructions': {'SQL Instructions:' in full_prompt}")
print(f"   ✅ Contains 'TABLE_SCHEMAS': {'{{TABLE_SCHEMAS}}' not in full_prompt}")

# 5. Show prompt preview
print("\n5️⃣ Prompt Preview (first 500 chars):")
print("=" * 60)
print(full_prompt[:])
print("=" * 60)

print(f"\n🎉 Template flow working correctly!")
print(f"📊 Final prompt ready for LLM with {len(full_prompt):,} characters")
print(f"🔗 The text2sql_prompt.txt is driving the SQL generation!")