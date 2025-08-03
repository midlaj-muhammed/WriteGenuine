import React from 'react';
import { AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ApiQuotaNotice = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          API Quota Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-amber-700 space-y-2">
          <p>
            The Google Gemini API has reached its daily quota limit. This is a limitation of the free tier API plan.
          </p>
          
          <div className="bg-white p-3 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              What this means:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              <li>The API is temporarily unavailable due to quota limits</li>
              <li>You may see fallback/simulated results instead of real analysis</li>
              <li>This is a temporary limitation that resets daily</li>
              <li>All features will work normally once the quota resets</li>
            </ul>
          </div>

          <div className="bg-white p-3 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2">Solutions:</h4>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              <li><strong>Wait:</strong> The quota typically resets every 24 hours</li>
              <li><strong>Upgrade:</strong> Consider upgrading to a paid Google AI API plan for higher limits</li>
              <li><strong>Use fallback:</strong> The app will provide simulated results when possible</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
            onClick={() => window.open('https://ai.google.dev/gemini-api/docs/rate-limits', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Learn More About Quotas
          </Button>
          
          <Button 
            variant="outline" 
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
            onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Get Your Own API Key
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiQuotaNotice; 