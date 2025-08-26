from typing import Dict, List
import json
from datetime import datetime, timedelta

class TestDataGenerator:
    """Generate realistic test data for template variables"""
    
    @staticmethod
    def get_sql_syntax_options() -> Dict[str, str]:
        """Get available SQL syntax options"""
        return {
            "SQLite": "SQLite",
            "PostgreSQL": "PostgreSQL", 
            "MySQL": "MySQL",
            "Microsoft SQL Server": "Microsoft SQL Server"
        }
    
    @staticmethod
    def get_metric_definitions() -> str:
        """Generate sample metric definitions"""
        metrics = {
            "Revenue": "Total monetary value from sales transactions. Calculated as SUM(order_items.price * order_items.quantity) for completed orders.",
            
            "Active Customers": "Customers who have made at least one purchase in the last 90 days. Counted as DISTINCT(customer_id) from orders where order_date >= CURRENT_DATE - 90.",
            
            "Average Order Value (AOV)": "Average monetary value per order. Calculated as total_revenue / total_orders for a given time period.",
            
            "Monthly Recurring Revenue (MRR)": "Predictable revenue generated per month from subscription customers. SUM(subscription_plans.monthly_price) for active subscriptions.",
            
            "Customer Lifetime Value (CLV)": "Predicted total revenue from a customer relationship. Calculated as (average_order_value * purchase_frequency * customer_lifespan).",
            
            "Conversion Rate": "Percentage of website visitors who complete a purchase. Calculated as (total_orders / total_website_visits) * 100.",
            
            "Churn Rate": "Percentage of customers who stop doing business within a given time period. Calculated as (customers_lost / total_customers_at_start) * 100.",
            
            "Inventory Turnover": "How quickly inventory is sold and replaced. Calculated as cost_of_goods_sold / average_inventory_value.",
            
            "Customer Acquisition Cost (CAC)": "Cost to acquire a new customer. Calculated as total_marketing_spend / new_customers_acquired.",
            
            "Net Promoter Score (NPS)": "Customer loyalty metric based on survey responses. Scale of -100 to +100 based on likelihood to recommend."
        }
        
        # Format as multiline string
        formatted_metrics = []
        for metric_name, definition in metrics.items():
            formatted_metrics.append(f"• {metric_name}: {definition}")
        
        return "\n".join(formatted_metrics)
    
    @staticmethod 
    def get_semantic_nouns() -> str:
        """Generate sample semantic nouns for business domain"""
        e_commerce_nouns = [
            "customer", "client", "user", "buyer", "shopper",
            "order", "purchase", "transaction", "sale", "payment",
            "product", "item", "merchandise", "goods", "inventory",
            "category", "department", "brand", "manufacturer", "supplier",
            "revenue", "income", "earnings", "profit", "margin",
            "discount", "promotion", "coupon", "offer", "deal",
            "shipping", "delivery", "fulfillment", "logistics", "carrier",
            "return", "refund", "exchange", "cancellation", "chargeback",
            "subscription", "membership", "plan", "tier", "package",
            "campaign", "marketing", "advertisement", "channel", "source",
            "session", "visit", "pageview", "click", "conversion",
            "cart", "basket", "wishlist", "favorite", "bookmark",
            "review", "rating", "feedback", "comment", "testimonial",
            "warehouse", "store", "location", "region", "territory",
            "employee", "staff", "representative", "manager", "admin"
        ]
        
        return ", ".join(sorted(e_commerce_nouns))
    
    @staticmethod
    def get_sample_table_schemas() -> str:
        """Generate comprehensive sample table schemas"""
        schemas = {
            "customers": {
                "description": "Customer information and demographics",
                "fields": {
                    "customer_id": "INT PRIMARY KEY - Unique customer identifier",
                    "first_name": "VARCHAR(50) NOT NULL - Customer first name", 
                    "last_name": "VARCHAR(50) NOT NULL - Customer last name",
                    "email": "VARCHAR(255) UNIQUE NOT NULL - Customer email address",
                    "phone": "VARCHAR(20) - Customer phone number",
                    "date_of_birth": "DATE - Customer birth date",
                    "gender": "VARCHAR(10) - Customer gender",
                    "registration_date": "DATETIME DEFAULT CURRENT_TIMESTAMP - Account creation date",
                    "status": "VARCHAR(20) DEFAULT 'active' - Account status (active, inactive, suspended)",
                    "total_orders": "INT DEFAULT 0 - Total number of orders placed",
                    "total_spent": "DECIMAL(10,2) DEFAULT 0.00 - Total amount spent",
                    "last_login": "DATETIME - Last login timestamp",
                    "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
                    "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP"
                }
            },
            
            "products": {
                "description": "Product catalog with details and pricing",
                "fields": {
                    "product_id": "INT PRIMARY KEY - Unique product identifier",
                    "name": "VARCHAR(255) NOT NULL - Product name",
                    "description": "TEXT - Product description",
                    "sku": "VARCHAR(50) UNIQUE NOT NULL - Stock keeping unit",
                    "category_id": "INT NOT NULL - Product category reference",
                    "brand": "VARCHAR(100) - Product brand",
                    "price": "DECIMAL(10,2) NOT NULL - Current selling price",
                    "cost": "DECIMAL(10,2) - Product cost for margin calculations",
                    "weight": "DECIMAL(8,3) - Product weight in kg",
                    "dimensions": "VARCHAR(50) - Product dimensions (LxWxH)",
                    "color": "VARCHAR(30) - Product color",
                    "size": "VARCHAR(20) - Product size",
                    "stock_quantity": "INT DEFAULT 0 - Current inventory count",
                    "status": "VARCHAR(20) DEFAULT 'active' - Product status",
                    "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
                    "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP"
                }
            },
            
            "orders": {
                "description": "Customer orders and transaction details",
                "fields": {
                    "order_id": "INT PRIMARY KEY - Unique order identifier",
                    "customer_id": "INT NOT NULL - Customer who placed the order",
                    "order_number": "VARCHAR(50) UNIQUE NOT NULL - Human-readable order number",
                    "order_date": "DATETIME DEFAULT CURRENT_TIMESTAMP - Order placement date",
                    "status": "VARCHAR(20) DEFAULT 'pending' - Order status",
                    "subtotal": "DECIMAL(10,2) NOT NULL - Order subtotal before tax/shipping",
                    "tax_amount": "DECIMAL(10,2) DEFAULT 0.00 - Tax amount",
                    "shipping_amount": "DECIMAL(10,2) DEFAULT 0.00 - Shipping cost",
                    "discount_amount": "DECIMAL(10,2) DEFAULT 0.00 - Total discounts applied",
                    "total_amount": "DECIMAL(10,2) NOT NULL - Final order total",
                    "payment_method": "VARCHAR(50) - Payment method used",
                    "payment_status": "VARCHAR(20) DEFAULT 'pending' - Payment status",
                    "shipping_address": "TEXT - Shipping address",
                    "billing_address": "TEXT - Billing address",
                    "notes": "TEXT - Order notes or special instructions",
                    "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
                    "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP"
                }
            },
            
            "order_items": {
                "description": "Individual items within each order",
                "fields": {
                    "item_id": "INT PRIMARY KEY - Unique item identifier",
                    "order_id": "INT NOT NULL - Order this item belongs to",
                    "product_id": "INT NOT NULL - Product being ordered",
                    "quantity": "INT NOT NULL - Quantity ordered",
                    "unit_price": "DECIMAL(10,2) NOT NULL - Price per unit at time of order",
                    "total_price": "DECIMAL(10,2) NOT NULL - Total price for this line item",
                    "discount_applied": "DECIMAL(10,2) DEFAULT 0.00 - Discount on this item",
                    "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP"
                }
            }
        }
        
        # Format schemas as readable text
        formatted_schemas = []
        for table_name, table_info in schemas.items():
            formatted_schemas.append(f"Table: {table_name}")
            formatted_schemas.append(f"Description: {table_info['description']}")
            formatted_schemas.append("Fields:")
            
            for field_name, field_desc in table_info["fields"].items():
                formatted_schemas.append(f"  - {field_name}: {field_desc}")
            
            formatted_schemas.append("")  # Empty line between tables
        
        return "\n".join(formatted_schemas)
    
    @staticmethod
    def get_sample_business_instructions() -> str:
        """Generate comprehensive sample business instructions"""
        return """This is an e-commerce platform that manages products, customers, orders, and inventory for a modern online retail business.

Key Business Context:
• We operate a multi-category online store selling consumer goods across electronics, clothing, home & garden, and sports categories
• Our customer base consists of both one-time buyers and repeat customers with varying purchase patterns
• Orders go through multiple stages: pending → processing → shipped → delivered → completed
• We track inventory levels and automatically handle stock updates when orders are placed
• Revenue recognition occurs when orders are marked as 'completed'
• We offer various payment methods including credit cards, PayPal, and buy-now-pay-later options

Important Business Rules:
• Only count orders with status 'completed' for revenue calculations
• Active customers are defined as those with at least one order in the last 90 days
• Inventory quantities should never go negative - implement proper stock checks
• Refunds and returns are handled as separate transactions, not order modifications
• Customer lifetime value calculations should include all completed orders since registration

Common Query Patterns:
• Sales performance metrics (daily/weekly/monthly revenue trends)
• Customer analysis (new vs returning, geographic distribution, purchase behavior)
• Product performance (best sellers, slow movers, category analysis)
• Inventory management (stock levels, reorder points, turnover rates)
• Order fulfillment metrics (processing times, shipping performance, completion rates)

Terminology Conventions:
• "Revenue" refers to completed order totals only
• "AOV" (Average Order Value) is calculated from completed orders
• "Active inventory" excludes discontinued or out-of-stock products
• Date ranges are typically inclusive of start date, exclusive of end date
• All monetary values are in USD unless specified otherwise

Time-based Context:
• Business operates in EST timezone
• Peak sales periods are Black Friday, holiday season (Nov-Dec), and back-to-school (Aug-Sep)
• Fiscal year runs January-December
• Weekly reports typically run Monday-Sunday
• Consider seasonality when analyzing year-over-year trends"""
    
    @staticmethod
    def get_sample_previous_context() -> str:
        """Generate sample conversation context"""
        return """Previous conversation context:

User: "Show me our top 5 products by revenue last month"
SQL Generated: SELECT p.name, SUM(oi.total_price) as revenue FROM products p JOIN order_items oi ON p.product_id = oi.product_id JOIN orders o ON oi.order_id = o.order_id WHERE o.order_date >= DATE('now', '-1 month') AND o.status = 'completed' GROUP BY p.product_id, p.name ORDER BY revenue DESC LIMIT 5
Result: Electronics and clothing categories dominated with $45K and $38K respectively.

User: "What about customer segments by purchase frequency?"
SQL Generated: SELECT CASE WHEN total_orders >= 10 THEN 'High Frequency' WHEN total_orders >= 3 THEN 'Medium Frequency' ELSE 'Low Frequency' END as segment, COUNT(*) as customer_count FROM customers GROUP BY segment
Result: 65% of customers are low frequency (1-2 orders), 28% medium frequency, 7% high frequency.

The user is now asking about patterns in customer behavior and may want to drill down into specific segments or time periods."""
    
    @staticmethod
    def get_all_test_data(sql_syntax: str = "SQLite") -> Dict[str, str]:
        """Get all test data as a dictionary"""
        return {
            "SQL_SYNTAX": sql_syntax,
            "METRIC_DEFINITIONS": TestDataGenerator.get_metric_definitions(),
            "SEMANTIC_NOUNS": TestDataGenerator.get_semantic_nouns(),
            "TABLE_SCHEMAS": TestDataGenerator.get_sample_table_schemas(),
            "BUSINESS_INSTRUCTIONS": TestDataGenerator.get_sample_business_instructions(),
            "PREVIOUS_CONTEXT": TestDataGenerator.get_sample_previous_context()
        }
    
    @staticmethod
    def get_sample_queries() -> List[str]:
        """Get sample natural language queries for testing"""
        return [
            "Show me total revenue for last month",
            "What are our top 5 best selling products?",
            "How many new customers did we acquire this quarter?",
            "What's the average order value by customer segment?",
            "Which products are running low on inventory?",
            "Show me monthly revenue trends for the past year",
            "What's our customer retention rate?",
            "List customers who haven't ordered in the last 6 months",
            "What's the conversion rate by traffic source?",
            "Show me the most popular product categories",
            "What's our average order processing time?",
            "How many returns did we have last week?",
            "What's the lifetime value of our top 10 customers?",
            "Show me seasonal sales patterns",
            "Which marketing campaigns drove the most revenue?"
        ]