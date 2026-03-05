import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { SecurityDashboard } from '@/components/SecurityDashboard';
import { FileUpload } from '@/components/FileUpload';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { motion } from 'framer-motion';

const Index = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsBlocked: 0,
    cleanFiles: 0,
  });

  const handleScanComplete = (isClean: boolean) => {
    setStats(prev => ({
      totalScans: prev.totalScans + 1,
      threatsBlocked: !isClean ? prev.threatsBlocked + 1 : prev.threatsBlocked,
      cleanFiles: isClean ? prev.cleanFiles + 1 : prev.cleanFiles,
    }));
  };

  const handleClearFiles = () => {
    setStats({
      totalScans: 0,
      threatsBlocked: 0,
      cleanFiles: 0,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <Header />
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-5xl font-bold mb-6 text-white drop-shadow-2xl"
            >
              🛡️ Advanced File Security Scanner
            </motion.h2>
            <motion.p 
              className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Upload any file type for comprehensive malware analysis. Our AI-powered engine detects 
              ransomware, trojans, and other malicious threats to keep your system secure.
            </motion.p>
            <motion.div
              className="mt-6 flex items-center justify-center gap-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="glass-card px-4 py-2 rounded-full">
                <span className="text-sm font-semibold text-white">⚡ Real-time Scanning</span>
              </div>
              <div className="glass-card px-4 py-2 rounded-full">
                <span className="text-sm font-semibold text-white">🧠 AI-Powered Detection</span>
              </div>
              <div className="glass-card px-4 py-2 rounded-full">
                <span className="text-sm font-semibold text-white">🔒 100% Secure</span>
              </div>
            </motion.div>
          </motion.div>
          
          <SecurityDashboard stats={stats} />
          <FileUpload onScanComplete={handleScanComplete} onClearFiles={handleClearFiles} />
        </div>
      </main>
    </div>
  );
};

export default Index;
