
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileIcon, FileText, FileImage, FileVideo, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileViewer from "./FileViewer";
import { format } from "date-fns";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
  user_id: string;
  profile?: {
    username: string;
    full_name: string | null;
    year: string | null;
  };
}

interface ChannelResourcesProps {
  channelId: string;
}

const ChannelResources: React.FC<ChannelResourcesProps> = ({ channelId }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<Resource | null>(null);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);

  useEffect(() => {
    fetchResources();
    
    const subscription = supabase
      .channel('resources_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'resources', filter: `channel_id=eq.${channelId}` }, 
        payload => {
          fetchResources();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channelId]);
  
  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("resources")
        .select(`
          *,
          profile:profiles(username, full_name, year)
        `)
        .eq("channel_id", channelId)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return <FileImage className="h-5 w-5" />;
    if (fileType?.startsWith('video/')) return <FileVideo className="h-5 w-5" />;
    if (fileType?.startsWith('audio/')) return <FileAudio className="h-5 w-5" />;
    if (fileType === 'application/pdf') return <FileText className="h-5 w-5" />;
    return <FileIcon className="h-5 w-5" />;
  };
  
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size";
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };
  
  const openFile = (resource: Resource) => {
    setSelectedFile(resource);
    setFileViewerOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared Resources</CardTitle>
        <CardDescription>Files and resources shared in this channel</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : resources.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No resources have been shared yet.</p>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => (
              <div 
                key={resource.id} 
                className="border rounded-md p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => openFile(resource)}
              >
                <div className="flex gap-3 items-start">
                  <div className="bg-primary/10 p-2 rounded-md text-primary">
                    {getFileIcon(resource.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{resource.title}</h4>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 items-center mt-2 text-xs text-muted-foreground">
                      <span>By {resource.profile?.full_name || resource.profile?.username || 'Unknown user'} 
                      {resource.profile?.year && <span> • {resource.profile?.year}</span>}
                      </span>
                      <span>{formatFileSize(resource.file_size)}</span>
                      <span>{format(new Date(resource.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    window.open(resource.file_url, '_blank');
                  }}>
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {selectedFile && (
          <FileViewer 
            open={fileViewerOpen}
            onOpenChange={setFileViewerOpen}
            file={{
              title: selectedFile.title,
              fileUrl: selectedFile.file_url,
              fileType: selectedFile.file_type
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ChannelResources;
