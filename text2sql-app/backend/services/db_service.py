import sqlite3
import os
from typing import List, Dict, Any, Optional
from pathlib import Path
import json
from datetime import datetime

class DatabaseService:
    """Service for interacting with the SQLite database"""
    
    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            # Default path relative to the Prisma database
            backend_dir = Path(__file__).parent.parent
            project_root = backend_dir.parent
            self.db_path = project_root / "prisma" / "dev.db"
        else:
            self.db_path = Path(db_path)
            
        if not self.db_path.exists():
            raise FileNotFoundError(f"Database not found at {self.db_path}")
    
    def get_connection(self) -> sqlite3.Connection:
        """Get database connection with row factory for dict-like access"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn
    
    def get_all_app_configurations(self) -> List[Dict[str, Any]]:
        """Fetch all app configurations with table count"""
        with self.get_connection() as conn:
            query = """
            SELECT 
                ac.id,
                ac.app_name,
                ac.business_instructions,
                ac.createdAt,
                ac.updatedAt,
                COUNT(act.tableId) as table_count,
                COALESCE(field_counts.field_count, 0) as field_count
            FROM app_configurations ac
            LEFT JOIN app_configuration_tables act ON ac.id = act.appConfigurationId
            LEFT JOIN (
                SELECT 
                    act2.appConfigurationId,
                    SUM(field_count) as field_count
                FROM app_configuration_tables act2
                JOIN (
                    SELECT tableId, COUNT(*) as field_count
                    FROM fields
                    GROUP BY tableId
                ) fc ON act2.tableId = fc.tableId
                GROUP BY act2.appConfigurationId
            ) field_counts ON ac.id = field_counts.appConfigurationId
            GROUP BY ac.id, ac.app_name, ac.business_instructions, ac.createdAt, ac.updatedAt
            ORDER BY ac.createdAt DESC
            """
            
            cursor = conn.execute(query)
            rows = cursor.fetchall()
            
            return [
                {
                    "id": row["id"],
                    "app_name": row["app_name"],
                    "business_instructions": row["business_instructions"],
                    "table_count": row["table_count"] or 0,
                    "field_count": row["field_count"] or 0,
                    "created_at": row["createdAt"],
                    "updated_at": row["updatedAt"]
                }
                for row in rows
            ]
    
    def get_app_configuration_detail(self, app_id: int) -> Optional[Dict[str, Any]]:
        """Fetch detailed app configuration with tables and fields"""
        with self.get_connection() as conn:
            # Get app configuration
            app_query = """
            SELECT id, app_name, business_instructions, createdAt, updatedAt
            FROM app_configurations 
            WHERE id = ?
            """
            cursor = conn.execute(app_query, (app_id,))
            app_row = cursor.fetchone()
            
            if not app_row:
                return None
            
            # Get associated tables with fields
            tables_query = """
            SELECT 
                t.id as table_id,
                t.table_name,
                t.table_description,
                f.field_name,
                f.field_description,
                f.data_type,
                f.max_length,
                f.is_nullable,
                f.is_primary_key,
                f.is_unique,
                f.default_value
            FROM app_configuration_tables act
            JOIN tables t ON act.tableId = t.id
            LEFT JOIN fields f ON t.id = f.tableId
            WHERE act.appConfigurationId = ?
            ORDER BY t.table_name, f.field_name
            """
            
            cursor = conn.execute(tables_query, (app_id,))
            table_rows = cursor.fetchall()
            
            # Group fields by table
            tables_dict = {}
            for row in table_rows:
                table_id = row["table_id"]
                if table_id not in tables_dict:
                    tables_dict[table_id] = {
                        "table_name": row["table_name"],
                        "table_description": row["table_description"],
                        "fields": []
                    }
                
                if row["field_name"]:  # Only add if field exists
                    field_data = {
                        "field_name": row["field_name"],
                        "field_description": row["field_description"],
                        "data_type": row["data_type"],
                        "max_length": row["max_length"],
                        "is_nullable": bool(row["is_nullable"]),
                        "is_primary_key": bool(row["is_primary_key"]),
                        "is_unique": bool(row["is_unique"]),
                        "default_value": row["default_value"]
                    }
                    tables_dict[table_id]["fields"].append(field_data)
            
            return {
                "id": app_row["id"],
                "app_name": app_row["app_name"],
                "business_instructions": app_row["business_instructions"],
                "tables": list(tables_dict.values()),
                "created_at": app_row["createdAt"],
                "updated_at": app_row["updatedAt"]
            }
    
    def get_table_schemas_for_app(self, app_id: int) -> str:
        """Generate table schema string for app configuration"""
        config = self.get_app_configuration_detail(app_id)
        if not config:
            return ""
        
        schema_parts = []
        for table in config["tables"]:
            table_name = table["table_name"]
            table_desc = table["table_description"]
            
            schema_parts.append(f"Table: {table_name}")
            schema_parts.append(f"Description: {table_desc}")
            schema_parts.append("Fields:")
            
            for field in table["fields"]:
                field_line = f"  - {field['field_name']} ({field['data_type']}"
                if field['max_length']:
                    field_line += f"({field['max_length']})"
                
                constraints = []
                if field['is_primary_key']:
                    constraints.append("PRIMARY KEY")
                if field['is_unique']:
                    constraints.append("UNIQUE")
                if not field['is_nullable']:
                    constraints.append("NOT NULL")
                if field['default_value']:
                    constraints.append(f"DEFAULT {field['default_value']}")
                
                if constraints:
                    field_line += f", {', '.join(constraints)}"
                field_line += f"): {field['field_description']}"
                
                schema_parts.append(field_line)
            
            schema_parts.append("")  # Empty line between tables
        
        return "\n".join(schema_parts)
    
    def get_all_tables(self) -> List[Dict[str, Any]]:
        """Get all tables with their fields (for development/testing)"""
        with self.get_connection() as conn:
            query = """
            SELECT 
                t.id,
                t.table_name,
                t.table_description,
                t.createdAt,
                t.updatedAt,
                COUNT(f.id) as field_count
            FROM tables t
            LEFT JOIN fields f ON t.id = f.tableId
            GROUP BY t.id, t.table_name, t.table_description, t.createdAt, t.updatedAt
            ORDER BY t.table_name
            """
            
            cursor = conn.execute(query)
            rows = cursor.fetchall()
            
            return [dict(row) for row in rows]

    def test_connection(self) -> bool:
        """Test database connection"""
        try:
            with self.get_connection() as conn:
                cursor = conn.execute("SELECT COUNT(*) FROM app_configurations")
                cursor.fetchone()
                return True
        except Exception:
            return False