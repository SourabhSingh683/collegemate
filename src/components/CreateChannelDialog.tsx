
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Code, Info, Lock, MessageSquare, Shield, TrendingUp, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const channelIcons = [
  { value: "MessageSquare", label: "Chat", icon: <MessageSquare className="h-5 w-5" /> },
  { value: "Code", label: "Code", icon: <Code className="h-5 w-5" /> },
  { value: "TrendingUp", label: "Trending", icon: <TrendingUp className="h-5 w-5" /> },
  { value: "Shield", label: "Shield", icon: <Shield className="h-5 w-5" /> },
  { value: "BookOpen", label: "Book", icon: <BookOpen className="h-5 w-5" /> },
  { value: "Users", label: "Users", icon: <Users className="h-5 w-5" /> },
];

interface CreateChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const CreateChannelDialog: React.FC<CreateChannelDialogProps> = ({ 
  open, 
  onOpenChange,
  onComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('MessageSquare');
  const [isPublic, setIsPublic] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleCreateChannel = async () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Channel name is required"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Create a slug from the name
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      
      const { data, error } = await supabase
        .from('channels')
        .insert([
          {
            name,
            description,
            icon,
            is_public: isPublic,
            slug,
            created_by: user?.id
          }
        ])
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      // Join the creator to the channel
      await supabase
        .from('channel_members')
        .insert([
          {
            channel_id: data.id,
            user_id: user?.id,
            is_admin: true // Mark the creator as admin
          }
        ]);
      
      toast({
        title: "Channel created",
        description: `${name} channel has been created successfully`
      });
      
      // Reset form
      setName('');
      setDescription('');
      setIcon('MessageSquare');
      setIsPublic(true);
      
      // Close dialog
      onOpenChange(false);
      
      // Callback
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating channel",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a new channel</DialogTitle>
          <DialogDescription>
            Create a new channel for discussions on specific topics.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Channel Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Web Development"
              className="btn-animate"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              className="btn-animate"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger id="icon" className="btn-animate">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {channelIcons.map((iconOption) => (
                    <SelectItem key={iconOption.value} value={iconOption.value}>
                      <div className="flex items-center gap-2">
                        {iconOption.icon}
                        <span>{iconOption.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="public" className="font-medium">
                  {isPublic ? 'Public Channel' : 'Private Channel'} 
                </Label>
                {isPublic ? null : <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <p className="text-sm text-muted-foreground">
                {isPublic 
                  ? 'Anyone can join this channel' 
                  : 'Users must request to join this channel'}
              </p>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              className="btn-animate"
            />
          </div>
          
          {!isPublic && (
            <div className="bg-muted/50 rounded-md p-3 flex gap-2 items-start">
              <Info size={18} className="text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Private Channel Information</p>
                <p className="text-muted-foreground">
                  You'll receive join requests as notifications. As the channel creator, you'll be the admin and can approve or deny requests.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="btn-animate">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateChannel} 
            disabled={loading} 
            className="btn-animate"
          >
            {loading ? "Creating..." : "Create Channel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelDialog;
