
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronRight, FileText, BarChart } from 'lucide-react';

interface Match {
  text: string;
  source: string;
  similarity: number;
}

interface PlagiarismResultsProps {
  results: {
    originalityScore: number;
    matches: Match[];
  };
}

const PlagiarismResults = ({ results }: PlagiarismResultsProps) => (
  <div className="mt-8 space-y-6 animate-fade-in">
    <div className="p-4 border rounded-lg bg-muted/30">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Originality Score</h3>
        <div className="text-2xl font-bold">{results.originalityScore}%</div>
      </div>
      
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500"
          style={{ width: `${results.originalityScore}%` }}
        ></div>
      </div>
      
      <div className="mt-2 flex justify-between text-sm text-muted-foreground">
        <span>0% Original</span>
        <span>100% Original</span>
      </div>
    </div>
    
    {results.matches.length > 0 && (
      <div>
        <h3 className="font-semibold text-lg mb-4">Matched Sources ({results.matches.length})</h3>
        <div className="space-y-4">
          {results.matches.map((match: Match, index: number) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-500" />
                  <span className="font-medium">Match found</span>
                </div>
                <span className="text-sm font-semibold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  {match.similarity}% Similar
                </span>
              </div>
              <div className="mt-3 p-3 bg-muted/30 rounded text-sm">
                "{match.text}"
              </div>
              <div className="mt-3 flex items-center justify-between">
                <a 
                  href={match.source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary flex items-center hover:underline"
                >
                  View Source <ChevronRight size={14} />
                </a>
                <Button variant="outline" size="sm" className="text-xs h-8">
                  Exclude Match
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    
    <div className="flex justify-end gap-4">
      <Button variant="outline">
        <FileText size={16} className="mr-2" />
        Download Report
      </Button>
      <Button variant="secondary">
        <BarChart size={16} className="mr-2" />
        Detailed Analysis
      </Button>
    </div>
  </div>
);

export default PlagiarismResults;
