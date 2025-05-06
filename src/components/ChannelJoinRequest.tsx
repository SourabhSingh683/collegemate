
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChannelJoinRequestProps {
  channelId: string;
  channelName: string;
  createdBy: string;
}

const ChannelJoinRequest: React.FC<ChannelJoinRequestProps> = ({ channelId, channelName, createdBy }) => {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleJoinRequest = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create notification for channel owner
      const { error } = await supabase
        .from('notifications')
        .insert([{
          content: `${user.user_metadata.username || 'A user'} has requested to join ${channelName}`,
          user_id: createdBy,
          related_channel_id: channelId,
          related_user_id: user.id,
          type: 'join_request'
        }]);
      
      if (error) throw error;
      
      setRequested(true);
      toast({
        title: "Request Sent",
        description: "Your request to join this channel has been sent to the admin"
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <Lock className="h-8 w-8 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold">Private Channel</h2>
      
      <p className="text-muted-foreground max-w-md">
        This is a private channel. You need to request access from the channel admin to view its content.
      </p>
      
      {requested ? (
        <div className="bg-primary/10 p-4 rounded-lg flex items-center gap-3 max-w-md">
          <ShieldAlert className="text-primary h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            Your request has been sent. You'll be notified when the admin responds.
          </p>
        </div>
      ) : (
        <Button 
          onClick={handleJoinRequest}
          disabled={loading}
          className="btn-animate"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Request to Join
        </Button>
      )}
    </div>
  );
};

export default ChannelJoinRequest;
