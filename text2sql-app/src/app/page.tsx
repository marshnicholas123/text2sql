"use client";

import EnhancedSchemaWizard from "@/components/EnhancedSchemaWizard";
import DataViewer from "@/components/DataViewer";
import Header from "@/components/Header";
import UserProfilePanel from "@/components/UserProfilePanel";
import SchemaStats from "@/components/SchemaStats";
import { Database, BarChart3, Users } from "lucide-react";

export default function Home() {
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
            Database Schema Management
          </h1>
          <p className="text-gray-600">
            Create and manage your database schemas for natural language to SQL conversion
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <SchemaStats stats={statsData} />
        </div>
        
        {/* Main Content Grid - Professional Layout */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Primary Content - Schema Management */}
          <div className="lg:col-span-3 space-y-6">
            {/* Schema Creation Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Create New Schema</h2>
                <p className="text-sm text-gray-600">
                  Design your database schema with our intuitive form builder
                </p>
              </div>
              <EnhancedSchemaWizard />
            </div>
          </div>
          
          {/* Sidebar Content - User Info & Data Viewer */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Profile Panel */}
            <UserProfilePanel 
              user={userData}
              stats={userStats}
              onCreateSchema={() => console.log("Create schema")}
              onImportCSV={() => console.log("Import CSV")}
              onExportAll={() => console.log("Export all")}
            />
            
            {/* Data Viewer Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Schemas</h3>
                <p className="text-sm text-gray-600">
                  Manage and view your existing database schemas
                </p>
              </div>
              <DataViewer />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
