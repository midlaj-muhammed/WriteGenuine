
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw } from 'lucide-react';

interface PatternIndicatorProps {
  label: string;
  value: string;
  color: string;
}

interface DetectionResultProps {
  results: {
    aiProbability: number;
    humanProbability: number;
    score?: number;
    patterns: {
      repetitive: string;
      complexity: string;
      variability: string;
    };
  };
}

const PatternIndicator = ({ label, value, color }: PatternIndicatorProps) => {
  const getColorClass = () => {
    switch (color) {
      case 'red': return 'bg-red-100 text-red-700';
      case 'yellow': return 'bg-yellow-100 text-yellow-700';
      case 'green': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <div className="p-3 border rounded-lg">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="flex justify-between items-center">
        <span className="font-medium">{value}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getColorClass()}`}>
          {value}
        </span>
      </div>
    </div>
  );
};

const DetectionResults = ({ results }: DetectionResultProps) => {
  // Use aiProbability directly or fall back to score if aiProbability isn't available
  const aiProbability = results.aiProbability || results.score || 50;
  const humanProbability = results.humanProbability || 100 - aiProbability;
  
  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      <div className={`p-6 rounded-lg border ${
        aiProbability > 50 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex justify-between items-start">
          <div>
            <div className={`text-lg font-semibold ${
              aiProbability > 50 ? 'text-red-700' : 'text-green-700'
            }`}>
              {aiProbability > 50 ? 'AI-Generated Content Detected' : 'Human-Written Content Detected'}
            </div>
            <p className={`text-sm ${
              aiProbability > 50 ? 'text-red-600' : 'text-green-600'
            }`}>
              This content appears to be {aiProbability > 50 ? 'written by AI' : 'written by a human'}.
            </p>
          </div>
          <div className={`text-3xl font-bold ${
            aiProbability > 50 ? 'text-red-700' : 'text-green-700'
          }`}>
            {aiProbability}%
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">AI Probability</h3>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-red-500"
              style={{ width: `${aiProbability}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0%</span>
            <span>{aiProbability}%</span>
          </div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">Human Probability</h3>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-green-500"
              style={{ width: `${humanProbability}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0%</span>
            <span>{humanProbability}%</span>
          </div>
        </div>
      </div>
      
      {results.patterns && (
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-4">Pattern Analysis</h3>
          <div className="grid grid-cols-3 gap-4">
            <PatternIndicator 
              label="Repetitive Patterns" 
              value={results.patterns.repetitive} 
              color={results.patterns.repetitive === 'High' ? 'red' : results.patterns.repetitive === 'Medium' ? 'yellow' : 'green'}
            />
            <PatternIndicator 
              label="Complexity" 
              value={results.patterns.complexity} 
              color={results.patterns.complexity === 'Low' ? 'red' : results.patterns.complexity === 'Medium' ? 'yellow' : 'green'} 
            />
            <PatternIndicator 
              label="Variability" 
              value={results.patterns.variability} 
              color={results.patterns.variability === 'Low' ? 'red' : results.patterns.variability === 'Medium' ? 'yellow' : 'green'} 
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-4">
        <Button variant="outline">
          <FileText size={16} className="mr-2" />
          Download Report
        </Button>
        <Button variant="secondary">
          <RefreshCw size={16} className="mr-2" />
          Humanize Content
        </Button>
      </div>
    </div>
  );
};

export default DetectionResults;
