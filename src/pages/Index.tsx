import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { SecurityDashboard } from '@/components/SecurityDashboard';
import { FileUpload } from '@/components/FileUpload';

const Index = () => {
  const [stats] = useState({
    totalScans: 247,
    threatsBlocked: 12,
    cleanFiles: 235,
    activeScans: 0,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Advanced File Security Scanner
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Upload any file type for comprehensive malware analysis. Our AI-powered engine detects 
              ransomware, trojans, and other malicious threats to keep your system secure.
            </p>
          </div>
          
          <SecurityDashboard stats={stats} />
          <FileUpload />
        </div>
      </main>
    </div>
  );
};

export default Index;
