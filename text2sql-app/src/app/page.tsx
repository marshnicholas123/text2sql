import EnhancedSchemaWizard from "@/components/EnhancedSchemaWizard";
import DataViewer from "@/components/DataViewer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Text2SQL Application</h1>
          <p className="text-lg text-muted-foreground">Create and manage your database schema for natural language queries</p>
        </div>
        
        <div className="space-y-8">
          <EnhancedSchemaWizard />
          <DataViewer />
        </div>
      </div>
    </div>
  );
}
