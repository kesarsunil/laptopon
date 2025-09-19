import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface FileData {
  file: File;
  status: 'pending' | 'scanning' | 'safe' | 'threat';
  progress: number;
  threatLevel?: 'low' | 'medium' | 'high';
  threatName?: string;
}

export const FileUpload = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isScanning, setIsScanning] = useState(false);

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
    }
  });

  const scanFiles = async () => {
    setIsScanning(true);
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;
      
      // Update status to scanning
      setFiles(prev => prev.map((f, index) => 
        index === i ? { ...f, status: 'scanning' as const } : f
      ));

      // Simulate scanning progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setFiles(prev => prev.map((f, index) => 
          index === i ? { ...f, progress } : f
        ));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate scan results (random for demo)
      const isThreat = Math.random() > 0.7;
      const threatLevel = isThreat ? ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high' : undefined;
      const threatName = isThreat ? ['Trojan.GenKD', 'Ransomware.CryptoLocker', 'Malware.Suspicious'][Math.floor(Math.random() * 3)] : undefined;

      setFiles(prev => prev.map((f, index) => 
        index === i ? { 
          ...f, 
          status: isThreat ? 'threat' as const : 'safe' as const,
          progress: 100,
          threatLevel,
          threatName
        } : f
      ));
    }
    
    setIsScanning(false);
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const getThreatBadgeVariant = (level?: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: FileData['status']) => {
    switch (status) {
      case 'scanning':
        return <Shield className="h-4 w-4 text-primary animate-spin" />;
      case 'safe':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'threat':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card className="glass-card">
        <div
          {...getRootProps()}
          className={`p-8 border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer text-center ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files to scan'}
          </h3>
          <p className="text-muted-foreground mb-4">
            Upload any file type (.exe, .png, .pdf, etc.) for malware analysis
          </p>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Select Files
          </Button>
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Scan Results ({files.length} files)
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={scanFiles}
                disabled={isScanning || files.every(f => f.status !== 'pending')}
                className="bg-primary hover:bg-primary/90"
              >
                {isScanning ? 'Scanning...' : 'Start Scan'}
              </Button>
              <Button variant="outline" onClick={clearFiles}>
                Clear All
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {files.map((fileData, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  fileData.status === 'threat'
                    ? 'border-destructive/50 bg-destructive/5 threat-glow'
                    : fileData.status === 'safe'
                    ? 'border-success/50 bg-success/5 safe-glow'
                    : 'border-border bg-card/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(fileData.status)}
                    <div>
                      <p className="font-medium truncate max-w-xs">
                        {fileData.file.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {fileData.status === 'threat' && fileData.threatLevel && (
                      <Badge variant={getThreatBadgeVariant(fileData.threatLevel)}>
                        {fileData.threatLevel.toUpperCase()} RISK
                      </Badge>
                    )}
                    {fileData.status === 'safe' && (
                      <Badge variant="outline" className="border-success text-success">
                        CLEAN
                      </Badge>
                    )}
                  </div>
                </div>

                {fileData.status === 'scanning' && (
                  <div className="space-y-2">
                    <Progress value={fileData.progress} className="scan-pulse" />
                    <p className="text-sm text-primary">
                      Scanning for malware... {fileData.progress}%
                    </p>
                  </div>
                )}

                {fileData.status === 'threat' && fileData.threatName && (
                  <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded">
                    <p className="text-sm font-medium text-destructive">
                      🚨 Threat Detected: {fileData.threatName}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};