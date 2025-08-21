import EnhancedSchemaWizard from "@/components/EnhancedSchemaWizard";
import DataViewer from "@/components/DataViewer";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="mb-6">
            <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight">
              Text2SQL <span className="text-gradient">Studio</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create and manage your database schemas for natural language to SQL conversion with our modern, intuitive interface
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Schema Designer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>CSV Import</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Data Management</span>
            </div>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Schema Wizard Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="animate-slide-in">
              <EnhancedSchemaWizard />
            </div>
          </div>
          
          {/* Data Viewer Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <DataViewer />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
