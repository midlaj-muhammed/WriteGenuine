import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart, FileText, ShieldCheck, Bot, RefreshCw, Users, Settings } from 'lucide-react';

const DashboardPreview = () => {
  return (
    <div className="w-full h-[500px] md:h-[600px] bg-white rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Window Controls */}
      <div className="bg-gray-100 border-b p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex h-[calc(100%-48px)]">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r p-4">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-primary font-semibold">
              <ShieldCheck size={20} />
              <span>WriteGenuine</span>
            </div>
            
            <nav className="space-y-1">
              <div className="flex items-center space-x-2 px-3 py-2 bg-primary/10 text-primary rounded-lg">
                <BarChart size={18} />
                <span>Dashboard</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <FileText size={18} />
                <span>Content</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bot size={18} />
                <span>AI Detection</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <RefreshCw size={18} />
                <span>Humanizer</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Users size={18} />
                <span>Team</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings size={18} />
                <span>Settings</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Content", value: "1,234", change: "+12%" },
              { label: "AI Detected", value: "45", change: "-5%" },
              { label: "Humanized", value: "89", change: "+8%" }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-lg border p-4">
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className="text-2xl font-semibold mt-1">{stat.value}</div>
                <div className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </div>
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="bg-white rounded-lg border p-4 mb-6 h-48">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Content Analysis</h3>
              <div className="flex space-x-2">
                <div className="h-3 w-3 rounded-full bg-primary"></div>
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
              <div className="text-gray-400">Interactive Chart</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: "Content Checked", time: "2 minutes ago", status: "success" },
                { action: "AI Detection", time: "15 minutes ago", status: "warning" },
                { action: "Humanization", time: "1 hour ago", status: "success" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <span>{activity.action}</span>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview; 