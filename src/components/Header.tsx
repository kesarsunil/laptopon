import React, { useEffect, useRef } from 'react';
import { Shield, Zap, Lock, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

export const Header = () => {
  const shieldRef = useRef<HTMLDivElement>(null);
  const zapRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP animations for shield rotation
    if (shieldRef.current) {
      gsap.to(shieldRef.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none"
      });
    }

    // Zap pulse animation
    if (zapRef.current) {
      gsap.to(zapRef.current, {
        scale: 1.3,
        opacity: 0.7,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }

    // Status indicator pulse
    if (statusRef.current) {
      gsap.to(statusRef.current, {
        scale: 1.2,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
  }, []);

  return (
    <motion.header 
      className="sticky top-0 z-50 border-b border-border/30 backdrop-blur-xl shadow-lg"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        boxShadow: '0 8px 32px 0 rgba(100, 200, 255, 0.1)',
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative" ref={shieldRef}>
              <Shield className="h-10 w-10 text-primary" />
              <div ref={zapRef} className="absolute -top-1 -right-1">
                <Zap className="h-5 w-5 text-warning" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                CyberScan Pro
              </h1>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Advanced AI-Powered Protection
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full glass-card">
              <div ref={statusRef} className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-success font-semibold tracking-wide">PROTECTED</span>
              <Activity className="h-4 w-4 text-success" />
            </div>
            
            <motion.div
              className="px-4 py-2 rounded-lg glass-card cursor-pointer"
              whileHover={{ 
                scale: 1.05
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-sm font-medium text-white">Premium</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};