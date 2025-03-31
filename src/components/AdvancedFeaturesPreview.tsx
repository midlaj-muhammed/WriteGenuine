import React from 'react';
import { FileText, BarChart, Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const AdvancedFeaturesPreview = () => {
  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-primary">Content Analysis Report</h3>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-muted-foreground">Last updated: 2 minutes ago</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Score Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Overall Score</h4>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-2xl font-bold text-green-500">92%</span>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: "Originality", value: "98%", icon: FileText, color: "blue" },
            { label: "AI Detection", value: "2%", icon: BarChart, color: "green" },
            { label: "Readability", value: "85%", icon: Zap, color: "purple" },
            { label: "Grammar", value: "95%", icon: CheckCircle, color: "orange" }
          ].map((metric, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`h-8 w-8 rounded-full bg-${metric.color}-100 flex items-center justify-center`}>
                  <metric.icon className={`h-4 w-4 text-${metric.color}-500`} />
                </div>
                <span className="text-sm font-medium">{metric.label}</span>
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="space-y-4">
          <h4 className="font-medium">Improvement Suggestions</h4>
          <div className="space-y-3">
            {[
              { text: "Consider adding more specific examples to support your arguments", type: "info" },
              { text: "Some sentences could be more concise", type: "warning" },
              { text: "Add transition phrases between paragraphs", type: "info" }
            ].map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`mt-1 ${
                  suggestion.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                }`}>
                  <AlertCircle size={16} />
                </div>
                <p className="text-sm text-muted-foreground">{suggestion.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock size={16} />
            <span>Analysis completed in 1.2s</span>
          </div>
          <button className="text-sm text-primary hover:underline">
            View Detailed Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeaturesPreview; 