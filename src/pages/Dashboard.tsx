import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIDetectionTool from '@/components/AIDetectionTool';
import PlagiarismChecker from '@/components/PlagiarismChecker';
import HumanizedTextPreview from '@/components/HumanizedTextPreview';
import { UserButton } from '@clerk/clerk-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold">WriteGenuine Dashboard</h1>
            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Content Tools</h2>
          <p className="text-muted-foreground">Powerful AI tools to analyze and enhance your content</p>
        </div>
        
        <div className="bg-card rounded-lg shadow-lg border p-1 mb-8">
          <Tabs defaultValue="detector" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="detector">AI Detection</TabsTrigger>
              <TabsTrigger value="plagiarism">Plagiarism Checker</TabsTrigger>
              <TabsTrigger value="humanizer">AI Humanizer</TabsTrigger>
            </TabsList>
            <div className="p-4">
              <TabsContent value="detector">
                <AIDetectionTool />
              </TabsContent>
              <TabsContent value="plagiarism">
                <PlagiarismChecker />
              </TabsContent>
              <TabsContent value="humanizer">
                <HumanizedTextPreview />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium mb-2">AI Detection</h3>
            <div className="text-3xl font-bold text-primary mb-1">28</div>
            <p className="text-sm text-muted-foreground">Texts analyzed this month</p>
          </div>
          
          <div className="bg-card rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium mb-2">Plagiarism Checks</h3>
            <div className="text-3xl font-bold text-primary mb-1">14</div>
            <p className="text-sm text-muted-foreground">Texts checked this month</p>
          </div>
          
          <div className="bg-card rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium mb-2">AI Humanization</h3>
            <div className="text-3xl font-bold text-primary mb-1">42</div>
            <p className="text-sm text-muted-foreground">Texts humanized this month</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg shadow border p-6">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <div className="font-medium">AI Detection</div>
                <div className="text-sm text-muted-foreground">Research paper introduction</div>
              </div>
              <div className="text-sm text-muted-foreground">2 hours ago</div>
            </div>
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <div className="font-medium">Plagiarism Check</div>
                <div className="text-sm text-muted-foreground">Marketing content</div>
              </div>
              <div className="text-sm text-muted-foreground">Yesterday</div>
            </div>
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <div className="font-medium">AI Humanization</div>
                <div className="text-sm text-muted-foreground">Product description</div>
              </div>
              <div className="text-sm text-muted-foreground">2 days ago</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
