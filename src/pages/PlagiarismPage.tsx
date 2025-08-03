import React from 'react';
import PlagiarismChecker from '@/components/PlagiarismChecker';
import ErrorBoundary from '@/components/ErrorBoundary';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const PlagiarismPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-24 sm:py-28">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 sm:mb-4">Plagiarism Checker</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Check your content for plagiarism and ensure originality.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <ErrorBoundary>
            <PlagiarismChecker />
          </ErrorBoundary>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PlagiarismPage; 