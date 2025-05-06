
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreateThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  channelName: string;
}

const CreateThreadDialog: React.FC<CreateThreadDialogProps> = ({
  open,
  onOpenChange,
  channelId,
  channelName
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Please provide a title for your thread"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Content required",
        description: "Please provide content for your thread"
      });
      return;
    }

    try {
      setLoading(true);

      // Create a message with a special format to indicate it's a thread
      const threadContent = `**Thread: ${title}**\n\n${content}`;

      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: threadContent,
            channel_id: channelId,
            user_id: user?.id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Thread created",
        description: "Your thread has been created successfully"
      });

      // Reset form and close dialog
      setTitle('');
      setContent('');
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create thread: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Thread in {channelName}</DialogTitle>
          <DialogDescription>
            Start a new discussion thread in this channel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="title">Thread Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your thread"
            />
          </div>

          <div className="grid w-full gap-1.5">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to discuss?"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Thread"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateThreadDialog;
