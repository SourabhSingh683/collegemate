
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface FileViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: {
    title: string;
    fileUrl: string;
    fileType: string;
  };
}

const FileViewer: React.FC<FileViewerProps> = ({ open, onOpenChange, file }) => {
  const isImage = file.fileType?.startsWith('image/');
  const isPdf = file.fileType === 'application/pdf';
  const isVideo = file.fileType?.startsWith('video/');
  const isAudio = file.fileType?.startsWith('audio/');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{file.title}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={file.fileUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 overflow-hidden max-h-[70vh]">
          {isImage && (
            <img src={file.fileUrl} alt={file.title} className="max-w-full max-h-[70vh] object-contain mx-auto" />
          )}
          {isPdf && (
            <iframe 
              src={file.fileUrl} 
              className="w-full h-[70vh]" 
              title={file.title}
            />
          )}
          {isVideo && (
            <video controls className="w-full max-h-[70vh]">
              <source src={file.fileUrl} type={file.fileType} />
              Your browser does not support the video tag.
            </video>
          )}
          {isAudio && (
            <audio controls className="w-full mt-8">
              <source src={file.fileUrl} type={file.fileType} />
              Your browser does not support the audio element.
            </audio>
          )}
          {!isImage && !isPdf && !isVideo && !isAudio && (
            <div className="text-center py-12">
              <p>Preview not available for this file type.</p>
              <Button variant="outline" className="mt-4" asChild>
                <a href={file.fileUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewer;
