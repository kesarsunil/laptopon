import React, { useEffect, useRef } from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import gsap from 'gsap';

interface SecurityStats {
  totalScans: number;
  threatsBlocked: number;
  cleanFiles: number;
}

interface SecurityDashboardProps {
  stats: SecurityStats;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ stats }) => {
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const numberRefs = [useRef<HTMLParagraphElement>(null), useRef<HTMLParagraphElement>(null), useRef<HTMLParagraphElement>(null)];

  useEffect(() => {
    // Animate icons rotation
    const cards = [card1Ref, card2Ref, card3Ref];
    cards.forEach((ref, index) => {
      if (ref.current) {
        gsap.to(ref.current.querySelector('.icon-container'), {
          rotation: 360,
          duration: 10 + index * 2,
          repeat: -1,
          ease: "none"
        });
      }
    });

    // Animate numbers counting up
    const values = [stats.totalScans, stats.threatsBlocked, stats.cleanFiles];
    numberRefs.forEach((ref, index) => {
      if (ref.current) {
        gsap.to(ref.current, {
          textContent: values[index],
          duration: 1.5,
          delay: index * 0.15,
          snap: { textContent: 1 },
          ease: "power1.out",
          onUpdate: function() {
            if (ref.current) {
              ref.current.textContent = Math.round(gsap.getProperty(ref.current, "textContent") as number).toString();
            }
          }
        });
      }
    });
  }, [stats]);

  const riskLevel = stats.threatsBlocked > 5 ? 'high' : stats.threatsBlocked > 0 ? 'medium' : 'low';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div
        ref={card1Ref}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="glass-card p-6 hover:scale-105 transition-transform duration-300 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="icon-container p-3 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p ref={numberRefs[0]} className="text-3xl font-bold text-white">{stats.totalScans}</p>
              <p className="text-sm text-gray-400 font-medium">Total Scans</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        ref={card2Ref}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className={`glass-card p-6 hover:scale-105 transition-transform duration-300 cursor-pointer group ${
          stats.threatsBlocked > 0 ? 'threat-glow' : ''
        }`}>
          <div className="flex items-center gap-3">
            <div className="icon-container p-3 bg-destructive/20 rounded-xl group-hover:bg-destructive/30 transition-colors">
              <AlertTriangle className={`h-7 w-7 text-destructive ${stats.threatsBlocked > 0 ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <p ref={numberRefs[1]} className="text-3xl font-bold text-white">{stats.threatsBlocked}</p>
              <p className="text-sm text-gray-400 font-medium">Threats Detected</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        ref={card3Ref}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="glass-card p-6 hover:scale-105 transition-transform duration-300 cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="icon-container p-3 bg-success/20 rounded-xl group-hover:bg-success/30 transition-colors">
              <CheckCircle className="h-7 w-7 text-success" />
            </div>
            <div>
              <p ref={numberRefs[2]} className="text-3xl font-bold text-white">{stats.cleanFiles}</p>
              <p className="text-sm text-gray-400 font-medium">Clean Files</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};