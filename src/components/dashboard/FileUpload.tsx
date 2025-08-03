import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, File, FileText, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface FileUploadProps {
  onTextExtracted: (text: string, filename: string) => void;
  acceptedFormats?: string[];
  maxFileSize?: number; // in MB
  className?: string;
}

interface UploadedFile {
  file: File;
  name: string;
  size: string;
  type: string;
  status: 'uploading' | 'success' | 'error';
  extractedText?: string;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onTextExtracted,
  acceptedFormats = ['.pdf', '.doc', '.docx', '.txt', '.csv', '.rtf'],
  maxFileSize = 10, // 10MB default
  className = ""
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (type.includes('spreadsheet') || type.includes('csv')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target?.result;

          if (file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.txt')) {
            // Handle plain text and CSV files
            resolve(content as string);
          } else if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
            // Handle PDF files using pdf-parse
            try {
              const pdfParse = (await import('pdf-parse')).default;
              const arrayBuffer = content as ArrayBuffer;
              const uint8Array = new Uint8Array(arrayBuffer);
              const data = await pdfParse(uint8Array);
              resolve(data.text);
            } catch (pdfError) {
              reject(new Error('Failed to parse PDF file. Please ensure the PDF contains extractable text.'));
            }
          } else if (file.type.includes('word') || file.type.includes('document') ||
                     file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
            // Handle Word documents using mammoth
            try {
              const mammoth = await import('mammoth');
              const arrayBuffer = content as ArrayBuffer;
              const result = await mammoth.extractRawText({ arrayBuffer });
              resolve(result.value);
            } catch (wordError) {
              reject(new Error('Failed to parse Word document. Please ensure the document is not corrupted.'));
            }
          } else if (file.name.endsWith('.rtf')) {
            // Handle RTF files - basic text extraction
            try {
              const rtfContent = content as string;
              // Simple RTF text extraction (removes RTF formatting codes)
              const textContent = rtfContent
                .replace(/\\[a-z]+\d*\s?/g, '') // Remove RTF control words
                .replace(/[{}]/g, '') // Remove braces
                .replace(/\\\\/g, '\\') // Unescape backslashes
                .replace(/\\'/g, "'") // Unescape quotes
                .trim();
              resolve(textContent);
            } catch (rtfError) {
              reject(new Error('Failed to parse RTF file.'));
            }
          } else {
            // Try to read as text for other formats
            resolve(content as string);
          }
        } catch (error) {
          reject(new Error('Failed to extract text from file: ' + error.message));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      if (file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.txt') || file.name.endsWith('.rtf')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const processFile = async (file: File) => {
    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${maxFileSize}MB`,
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      toast({
        title: "Unsupported File Type",
        description: `Supported formats: ${acceptedFormats.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    const uploadedFile: UploadedFile = {
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'unknown',
      status: 'uploading'
    };

    setUploadedFiles(prev => [...prev, uploadedFile]);

    try {
      const extractedText = await extractTextFromFile(file);
      
      // Update file status to success
      setUploadedFiles(prev => 
        prev.map(f => 
          f.name === file.name 
            ? { ...f, status: 'success', extractedText }
            : f
        )
      );

      // Call the callback with extracted text
      onTextExtracted(extractedText, file.name);

      toast({
        title: "File Processed Successfully",
        description: `Text extracted from ${file.name}`,
      });

    } catch (error) {
      // Update file status to error
      setUploadedFiles(prev => 
        prev.map(f => 
          f.name === file.name 
            ? { ...f, status: 'error', error: error.message }
            : f
        )
      );

      toast({
        title: "File Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(processFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 text-center">
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Upload Document</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <Button onClick={handleButtonClick} variant="outline" className="mb-2">
            Choose File
          </Button>
          <p className="text-xs text-muted-foreground">
            Supported formats: {acceptedFormats.join(', ')} (max {maxFileSize}MB)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedFormats.join(',')}
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Files</h4>
          {uploadedFiles.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {file.status === 'uploading' && (
                    <Badge variant="secondary">Processing...</Badge>
                  )}
                  {file.status === 'success' && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Success
                    </Badge>
                  )}
                  {file.status === 'error' && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file.name)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {file.status === 'error' && file.error && (
                <p className="text-xs text-red-500 mt-2">{file.error}</p>
              )}
              
              {file.status === 'success' && file.extractedText && (
                <p className="text-xs text-muted-foreground mt-2">
                  Extracted {file.extractedText.length} characters
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
