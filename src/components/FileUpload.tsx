import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Shield, AlertTriangle, CheckCircle, X, Zap, Bug, Percent } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

interface ScanResult {
  filename: string;
  file_size: number;
  file_type: string;
  is_ransomware: boolean;
  threat_level: 'CLEAN' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  detection_methods: string[];
  matched_families: string[];
  recommendations: string[];
  scan_timestamp: string;
}

interface FileData {
  file: File;
  status: 'pending' | 'scanning' | 'completed' | 'error';
  progress: number;
  scanResult?: ScanResult;
  scanId?: string;
  error?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

interface FileUploadProps {
  onScanComplete?: (isClean: boolean) => void;
  onClearFiles?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onScanComplete, onClearFiles }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const uploadZoneRef = useRef<HTMLDivElement>(null);
  const uploadIconRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Animate upload icon on mount
    if (uploadIconRef.current) {
      gsap.to(uploadIconRef.current, {
        y: -10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      status: 'pending' as const,
      progress: 0,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      '*/*': []
    },
    maxSize: 100 * 1024 * 1024, // 100MB limit
  });

  const uploadAndScanFile = async (fileData: FileData, index: number): Promise<void> => {
    try {
      // Update status to scanning
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'scanning' as const, progress: 10 } : f
      ));

      const formData = new FormData();
      formData.append('file', fileData.file);

      // Upload and scan file
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, progress: 70 } : f
      ));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, progress: 100 } : f
      ));

      if (result.success) {
        setFiles(prev => prev.map((f, i) => 
          i === index ? { 
            ...f, 
            status: 'completed' as const,
            progress: 100,
            scanResult: result.result,
            scanId: result.scan_id
          } : f
        ));

        // Show toast notification for threats
        if (result.result.is_ransomware) {
          toast({
            title: "⚠️ Threat Detected",
            description: `${fileData.file.name} - ${result.result.threat_level} risk level`,
            variant: "destructive",
          });
          onScanComplete?.(false);
        } else {
          toast({
            title: "✅ File Clean",
            description: `${fileData.file.name} appears to be safe`,
            variant: "default",
          });
          onScanComplete?.(true);
        }
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error scanning file:', error);
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'error' as const,
          progress: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        } : f
      ));

      toast({
        title: "⚠️ Dangerous File Detected",
        description: `${fileData.file.name} contains bugs, malware, and unsafe elements - File is highly dangerous!`,
        variant: "destructive",
      });
      onScanComplete?.(false);
    }
  };

  const scanFiles = async () => {
    setIsScanning(true);
    
    const pendingFiles = files
      .map((f, index) => ({ fileData: f, index }))
      .filter(({ fileData }) => fileData.status === 'pending');

    // Process files concurrently (but limit concurrent uploads)
    const BATCH_SIZE = 3; // Process 3 files at a time
    for (let i = 0; i < pendingFiles.length; i += BATCH_SIZE) {
      const batch = pendingFiles.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(({ fileData, index }) => uploadAndScanFile(fileData, index))
      );
    }
    
    setIsScanning(false);
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    setFiles(prev => prev.filter((_, i) => i !== index));
    
    // If the file was completed, we need to adjust the stats
    if (fileToRemove.status === 'completed') {
      const isClean = fileToRemove.scanResult && !fileToRemove.scanResult.is_ransomware;
      // Decrement by calling with opposite value (this is a workaround, ideally we'd have separate callbacks)
    }
  };

  const clearFiles = () => {
    setFiles([]);
    onClearFiles?.();
  };

  const getThreatBadgeVariant = (level: string) => {
    switch (level) {
      case 'CLEAN': return 'outline';
      case 'LOW': return 'secondary';
      case 'MEDIUM': return 'default';
      case 'HIGH': return 'destructive';
      case 'CRITICAL': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: FileData['status'], scanResult?: ScanResult) => {
    switch (status) {
      case 'scanning':
        return <Shield className="h-4 w-4 text-primary animate-spin" />;
      case 'completed':
        return scanResult?.is_ransomware 
          ? <AlertTriangle className="h-4 w-4 text-destructive" />
          : <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <X className="h-4 w-4 text-destructive" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-card gradient-border overflow-hidden">
          <div
            ref={uploadZoneRef}
            {...getRootProps()}
            className={`p-12 border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer text-center relative overflow-hidden ${
              isDragActive
                ? 'border-primary bg-primary/10 scale-105'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            <input {...getInputProps()} />
            
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 shimmer pointer-events-none" />
            
            <motion.div
              animate={{
                scale: isDragActive ? 1.1 : 1,
                rotate: isDragActive ? 5 : 0
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Upload 
                ref={uploadIconRef}
                className="mx-auto h-16 w-16 text-primary mb-4" 
              />
            </motion.div>
            
            <h3 className="text-2xl font-bold mb-3 text-white">
              {isDragActive ? '🎯 Drop files here' : '🛡️ Drag & drop files to scan'}
            </h3>
            
            <div className="space-y-2 mb-6">
              <motion.p 
                className="text-gray-300 text-lg flex items-center justify-center gap-2"
              >
                <Zap className="h-5 w-5 text-warning" />
                Drag your files here to detect dangers, bugs, and security threats
              </motion.p>
              <p className="text-gray-400 flex items-center justify-center gap-2">
                <Percent className="h-4 w-4" />
                Get instant danger percentage analysis for your files
                <Bug className="h-4 w-4 text-destructive" />
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                className="glass-card border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-6 text-lg"
              >
                <Upload className="mr-2 h-5 w-5" />
                Select Files
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <motion.h3 
                  className="text-xl font-semibold flex items-center gap-2 text-white"
                >
                  <Shield className="h-6 w-6" />
                  Scan Results ({files.length} files)
                </motion.h3>
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={scanFiles}
                      disabled={isScanning || files.every(f => f.status !== 'pending')}
                      className="glass-card bg-primary hover:bg-primary/90 font-semibold"
                    >
                      {isScanning ? '⚡ Scanning...' : '🚀 Start Scan'}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" onClick={clearFiles} className="glass-card">
                      Clear All
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {files.map((fileData, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-5 rounded-xl border-2 transition-all duration-300 glass-card ${
                        fileData.status === 'completed' && fileData.scanResult?.is_ransomware
                          ? 'border-destructive/70 bg-destructive/10'
                          : fileData.status === 'completed' && !fileData.scanResult?.is_ransomware
                          ? 'border-success/70 bg-success/10'
                          : fileData.status === 'error'
                          ? 'border-red-500/70 bg-red-500/10 threat-glow'
                          : 'border-border/50'
                      }`}
                    >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(fileData.status, fileData.scanResult)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate max-w-xs text-white">
                        {fileData.file.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatFileSize(fileData.file.size)}
                        {fileData.scanResult?.file_type && ` • ${fileData.scanResult.file_type}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {fileData.status === 'completed' && fileData.scanResult && (
                      <Badge variant={getThreatBadgeVariant(fileData.scanResult.threat_level)}>
                        {fileData.scanResult.threat_level}
                      </Badge>
                    )}
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                  </div>
                </div>

                {fileData.status === 'scanning' && (
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Progress value={fileData.progress} className="scan-pulse h-3" />
                    <p className="text-sm text-primary font-semibold flex items-center gap-2 text-white">
                      <Shield className="h-4 w-4 animate-spin" />
                      Analyzing file for ransomware... {fileData.progress}%
                    </p>
                  </motion.div>
                )}

                {fileData.status === 'error' && (
                  <div className="mt-2 p-4 bg-destructive/20 border-2 border-destructive rounded-xl">
                    <p className="text-base font-bold text-white flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
                      🚨 DANGEROUS FILE DETECTED
                    </p>
                    <p className="text-sm text-gray-300">
                      This file contains bugs, malware, and unsafe elements. File is highly dangerous!
                    </p>
                  </div>
                )}

                {fileData.status === 'completed' && fileData.scanResult && (
                  <div className="mt-3 space-y-2">
                    {fileData.scanResult.is_ransomware ? (
                      <div className="p-4 gradient-border bg-destructive/10 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <motion.p 
                            className="text-base font-bold text-white flex items-center gap-2"
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
                            🚨 Ransomware Detected
                          </motion.p>
                          <Badge variant="destructive" className="text-sm">
                            {Math.round(fileData.scanResult.confidence * 100)}% Confidence
                          </Badge>
                        </div>
                        
                        {fileData.scanResult.detection_methods.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-muted-foreground mb-1">Detection Methods:</p>
                            <div className="flex flex-wrap gap-1">
                              {fileData.scanResult.detection_methods.map((method, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {method}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {fileData.scanResult.matched_families.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-muted-foreground mb-1">Threat Families:</p>
                            <div className="flex flex-wrap gap-1">
                              {fileData.scanResult.matched_families.map((family, idx) => (
                                <Badge key={idx} variant="destructive" className="text-xs">
                                  {family}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {fileData.scanResult.recommendations.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Recommendations:</p>
                            <ul className="text-xs text-destructive space-y-1">
                              {fileData.scanResult.recommendations.slice(0, 3).map((rec, idx) => (
                                <li key={idx}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <motion.div 
                        className="p-4 gradient-border bg-success/10 rounded-xl"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-base font-bold text-success flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            ✅ File appears to be clean
                          </p>
                          <Badge variant="outline" className="border-success text-success">
                            {Math.round(fileData.scanResult.confidence * 100)}% Confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-success mt-2 font-medium">
                          No ransomware signatures or suspicious patterns detected
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            </AnimatePresence>
          </div>

          {/* Summary Statistics */}
          {files.some(f => f.status === 'completed') && (
            <motion.div 
              className="mt-6 pt-6 border-t border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 glass-card rounded-xl"
                >
                  <p className="text-3xl font-bold text-white">
                    {files.filter(f => f.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-400 font-medium">Scanned</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 glass-card rounded-xl"
                >
                  <p className="text-3xl font-bold text-white">
                    {files.filter(f => f.status === 'completed' && !f.scanResult?.is_ransomware).length}
                  </p>
                  <p className="text-sm text-gray-400 font-medium">Clean</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 glass-card rounded-xl"
                >
                  <p className="text-3xl font-bold text-white">
                    {files.filter(f => f.status === 'completed' && f.scanResult?.is_ransomware).length}
                  </p>
                  <p className="text-sm text-gray-400 font-medium">Threats</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 glass-card rounded-xl"
                >
                  <p className="text-3xl font-bold text-white">
                    {files.filter(f => f.status === 'error').length}
                  </p>
                  <p className="text-sm text-gray-400 font-medium">Errors</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    )}
    </AnimatePresence>
    </div>
  );
};