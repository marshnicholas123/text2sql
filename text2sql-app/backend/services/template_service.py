import os
from pathlib import Path
from typing import Dict, Any, Optional
import re

class TemplateService:
    """Service for processing the text2sql prompt template"""
    
    def __init__(self, template_path: Optional[str] = None):
        if template_path is None:
            # Default path to the template file
            backend_dir = Path(__file__).parent.parent
            project_root = backend_dir.parent.parent
            self.template_path = project_root / "text2sql_prompt.txt"
        else:
            self.template_path = Path(template_path)
            
        if not self.template_path.exists():
            raise FileNotFoundError(f"Template file not found at {self.template_path}")
        
        # Load template content
        with open(self.template_path, 'r', encoding='utf-8') as f:
            self.template_content = f.read()
    
    def get_template_variables(self) -> list[str]:
        """Extract all template variables from the template"""
        # Find all variables in format {{VARIABLE_NAME}}
        pattern = r'\{\{(\w+)\}\}'
        variables = re.findall(pattern, self.template_content)
        return list(set(variables))  # Remove duplicates
    
    def substitute_variables(self, variables: Dict[str, str]) -> str:
        """Substitute template variables with provided values"""
        content = self.template_content
        
        for var_name, var_value in variables.items():
            placeholder = f"{{{{{var_name}}}}}"
            content = content.replace(placeholder, str(var_value))
        
        return content
    
    def build_prompt(
        self,
        sql_syntax: str = "SQLite",
        metric_definitions: str = "",
        semantic_nouns: str = "",
        table_schemas: str = "",
        previous_context: str = "",
        business_instructions: str = ""
    ) -> str:
        """Build complete prompt with all variables substituted"""
        
        variables = {
            "SQL_SYNTAX": sql_syntax,
            "METRIC_DEFINITIONS": metric_definitions,
            "SEMANTIC_NOUNS": semantic_nouns,
            "TABLE_SCHEMAS": table_schemas,
            "PREVIOUS_CONTEXT": previous_context,
            "BUSINESS_INSTRUCTIONS": business_instructions
        }
        
        return self.substitute_variables(variables)
    
    def validate_template(self) -> Dict[str, Any]:
        """Validate template structure and identify required variables"""
        variables = self.get_template_variables()
        
        expected_variables = [
            "SQL_SYNTAX",
            "METRIC_DEFINITIONS", 
            "SEMANTIC_NOUNS",
            "TABLE_SCHEMAS",
            "PREVIOUS_CONTEXT",
            "BUSINESS_INSTRUCTIONS"
        ]
        
        missing_variables = [var for var in expected_variables if var not in variables]
        extra_variables = [var for var in variables if var not in expected_variables]
        
        return {
            "is_valid": len(missing_variables) == 0,
            "found_variables": variables,
            "expected_variables": expected_variables,
            "missing_variables": missing_variables,
            "extra_variables": extra_variables,
            "template_length": len(self.template_content)
        }
    
    def get_raw_template(self) -> str:
        """Get the raw template content"""
        return self.template_content
    
    def preview_with_sample_data(self, sample_data: Dict[str, str]) -> str:
        """Generate a preview with sample data"""
        # Provide defaults for missing variables
        defaults = {
            "SQL_SYNTAX": "SQLite",
            "METRIC_DEFINITIONS": "No metric definitions provided",
            "SEMANTIC_NOUNS": "No semantic nouns provided",
            "TABLE_SCHEMAS": "No table schemas provided",
            "PREVIOUS_CONTEXT": "No previous context",
            "BUSINESS_INSTRUCTIONS": "No business instructions provided"
        }
        
        # Merge defaults with provided sample data
        variables = {**defaults, **sample_data}
        
        return self.substitute_variables(variables)
    
    def extract_sections(self) -> Dict[str, str]:
        """Extract different sections of the template for analysis"""
        content = self.template_content
        
        sections = {}
        
        # Find instruction sections
        instruction_pattern = r'SQL Instructions:\n(.*?)(?=\n\n|\nWhen you receive|$)'
        instruction_match = re.search(instruction_pattern, content, re.DOTALL)
        if instruction_match:
            sections["sql_instructions"] = instruction_match.group(1).strip()
        
        # Find format sections
        format_pattern = r'<output>(.*?)</output>'
        format_match = re.search(format_pattern, content, re.DOTALL)
        if format_match:
            sections["output_format"] = format_match.group(1).strip()
        
        # Find query planning section
        planning_pattern = r'<query_planning>(.*?)After your analysis'
        planning_match = re.search(planning_pattern, content, re.DOTALL)
        if planning_match:
            sections["query_planning"] = planning_match.group(1).strip()
        
        return sections