"use client";

import EnhancedSchemaWizard from "@/components/EnhancedSchemaWizard";
import DataViewer from "@/components/DataViewer";
import AppConfigurationWizard from "@/components/AppConfigurationWizard";
import AppConfigurationViewer from "@/components/AppConfigurationViewer";
import { Text2SQLQuery } from "@/components/Text2SQLQuery";
import { Text2SQLHealth } from "@/components/Text2SQLHealth";
import Header from "@/components/Header";
import UserProfilePanel from "@/components/UserProfilePanel";
import SchemaStats from "@/components/SchemaStats";
import { Button } from "@/components/ui/button";
import { Database, BarChart3, Users, Settings, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'tables' | 'apps' | 'query'>('tables')
  
  // Mock user data - in real app this would come from auth/database
  const userData = {
    name: "Alex Thompson",
    role: "Database Architect",
    organization: "TechCorp Solutions",
    avatar: undefined
  };

  const userStats = {
    totalSchemas: 24,
    activeQueries: 156,
    successRate: 94
  };

  // Header configuration
  const headerActions = [
    {
      label: "Share",
      variant: "secondary" as const,
      onClick: () => console.log("Share clicked")
    },
    {
      label: "Export All",
      variant: "primary" as const,
      onClick: () => console.log("Export clicked")
    }
  ];

  const headerStatus = {
    message: "All schemas synchronized",
    type: "success" as const
  };

  // Stats data
  const statsData = [
    {
      label: "Total Schemas",
      value: 24,
      icon: <Database className="w-4 h-4 text-blue-600" />,
      change: { value: 12, type: "increase" as const },
      description: "Active database schemas"
    },
    {
      label: "Query Success Rate",
      value: "94%",
      icon: <BarChart3 className="w-4 h-4 text-green-600" />,
      change: { value: 3, type: "increase" as const },
      description: "SQL generation accuracy"
    },
    {
      label: "Active Users",
      value: 8,
      icon: <Users className="w-4 h-4 text-purple-600" />,
      change: { value: 2, type: "increase" as const },
      description: "Team members using schemas"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        actions={headerActions}
        status={headerStatus}
      />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {activeTab === 'query' 
              ? 'Query Generator'
              : 'Text2SQL Generator App'
            }
          </h1>
          <p className="text-gray-600">
            {activeTab === 'query'
              ? 'Convert natural language questions into SQL queries using your configured business contexts'
              : 'Enter your database schema details, set app name and business instructions to generate SQL from natural language'
            }
          </p>
          
          {/* Tab Navigation */}
          <div className="mt-6 flex gap-2">
            <Button
              variant={activeTab === 'tables' ? 'default' : 'outline'}
              onClick={() => setActiveTab('tables')}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Schema Designer
            </Button>
            <Button
              variant={activeTab === 'apps' ? 'default' : 'outline'}
              onClick={() => setActiveTab('apps')}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Text2SQL App Setup
            </Button>
            <Button
              variant={activeTab === 'query' ? 'default' : 'outline'}
              onClick={() => setActiveTab('query')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Query Generator
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <SchemaStats stats={statsData} />
        </div>
        
        {/* Main Content Grid - Professional Layout */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Primary Content - Schema Management */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'tables' ? (
              /* Individual Tables Tab */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Create New Table Schema</h2>
                </div>
                <EnhancedSchemaWizard />
              </div>
            ) : activeTab === 'apps' ? (
              /* Text2SQL Apps Tab */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Configure Text2SQL App</h2>
                  <p className="text-sm text-gray-600">
                    Set up your text-to-SQL application by selecting relevant table schemas and providing business context
                  </p>
                </div>
                <AppConfigurationWizard />
              </div>
            ) : (
              /* Text2SQL Query Tab */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <Text2SQLQuery />
              </div>
            )}
          </div>
          
          {/* Sidebar Content - User Info & Data Viewer */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile Panel */}
            <UserProfilePanel 
              user={userData}
              stats={userStats}
              onCreateSchema={() => setActiveTab('tables')}
              onImportCSV={() => console.log("Import CSV")}
              onExportAll={() => console.log("Export all")}
            />
            
            {/* Data Viewer Section */}
            {activeTab !== 'query' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your {activeTab === 'tables' ? 'Table Schemas' : 'Text2SQL Apps'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {activeTab === 'tables' 
                      ? 'Manage and view your existing database table schemas'
                      : 'Manage your configured text2sql applications'
                    }
                  </p>
                </div>
                {activeTab === 'tables' ? <DataViewer /> : <AppConfigurationViewer />}
              </div>
            )}

            {/* Service Health for Query Tab */}
            {activeTab === 'query' && (
              <Text2SQLHealth />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
