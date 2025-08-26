#!/usr/bin/env python3
"""
Show the exact final prompt for "Show me total revenue for last month"
"""
import sys
sys.path.insert(0, '.')

from services import DatabaseService, TemplateService
from utils.test_data import TestDataGenerator

print("🔍 Final Prompt for: 'Show me total revenue for last month'\n")

# Get app configuration
db_service = DatabaseService()
configs = db_service.get_all_app_configurations()
app_config = db_service.get_app_configuration_detail(configs[0]['id'])
table_schemas = db_service.get_table_schemas_for_app(configs[0]['id'])

# Prepare template variables (same as API does)
template_vars = {
    "SQL_SYNTAX": "SQLite",
    "METRIC_DEFINITIONS": TestDataGenerator.get_metric_definitions(),
    "SEMANTIC_NOUNS": TestDataGenerator.get_semantic_nouns(),
    "TABLE_SCHEMAS": table_schemas,
    "PREVIOUS_CONTEXT": "",  # No previous context
    "BUSINESS_INSTRUCTIONS": app_config["business_instructions"]
}

# Build the complete prompt
template_service = TemplateService()
full_prompt = template_service.substitute_variables(template_vars)

print("=" * 80)
print("COMPLETE PROMPT THAT GETS SENT TO THE LLM:")
print("=" * 80)
print(full_prompt)
print("=" * 80)
print(f"\nPrompt Statistics:")
print(f"• Total length: {len(full_prompt):,} characters")
print(f"• Using app: {app_config['app_name']}")
print(f"• Tables included: {len(app_config['tables'])}")
print(f"• SQL syntax: SQLite")

print(f"\nUser Query: 'Show me total revenue for last month'")
print(f"↓")
print(f"This prompt + user query → LLM → Generated SQL")