import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import { Loader2, ChevronRight, Users, FileText, Paperclip, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Message from "@/components/Message";
import MessageInput from "@/components/MessageInput";
import ChannelResources from "@/components/ChannelResources";
import ShareFileDialog from "@/components/ShareFileDialog";
import ChannelMembersDialog from "@/components/ChannelMembersDialog";
import ChannelJoinRequest from "@/components/ChannelJoinRequest";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface ChannelData {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_public: boolean;
  created_by: string;
}

const Channel: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { user } = useAuth();
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profile:profiles(username, full_name, year)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages"
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      if (!user || !channelData) return;
      
      const { error } = await supabase
        .from('messages')
        .insert([
          { 
            content, 
            channel_id: channelData.id, 
            user_id: user.id 
          }
        ]);
        
      if (error) throw error;
      
      await fetchMessages(channelData.id);
    } catch (error: any) {
      toast({
        variant: "destructive", 
        title: "Error",
        description: `Failed to send message: ${error.message}`
      });
    }
  };

  useEffect(() => {
    const fetchChannelData = async () => {
      setLoading(true);
      try {
        const { data: channel, error: channelError } = await supabase
          .from('channels')
          .select('id, name, description, icon, is_public, created_by')
          .eq('slug', channelId)
          .single();

        if (channelError) throw channelError;
        if (!channel) {
          throw new Error('Channel not found');
        }

        setChannelData(channel);

        if (!channel.is_public) {
          const { data: membership, error: membershipError } = await supabase
            .from('channel_members')
            .select('*')
            .eq('channel_id', channel.id)
            .eq('user_id', user?.id)
            .maybeSingle();

          if (membershipError) throw membershipError;

          setCanAccess(!!membership || channel.created_by === user?.id);
        } else {
          setCanAccess(true);
        }

        if (channel.is_public || canAccess) {
          await fetchMessages(channel.id);
        }
      } catch (error) {
        console.error('Error fetching channel data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load channel data"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user && channelId) {
      fetchChannelData();
    }
  }, [channelId, user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading channel...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!channelData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p>Channel not found</p>
            <Button asChild className="mt-4 btn-animate">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!channelData.is_public && !canAccess) {
    return (
      <AppLayout>
        <ChannelJoinRequest 
          channelId={channelData.id} 
          channelName={channelData.name} 
          createdBy={channelData.created_by} 
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <Card className="mb-4">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-2xl font-bold">{channelData.name}</h1>
              <p className="text-muted-foreground">{channelData.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" /> Members
                  </Button>
                </DialogTrigger>
                <ChannelMembersDialog 
                  open={dialogOpen} 
                  onOpenChange={setDialogOpen} 
                  channelId={channelData.id} 
                  channelName={channelData.name} 
                />
              </Dialog>
            </div>
          </div>
          <Separator />
          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="p-4">
              <TabsTrigger value="messages" className="btn-animate">
                <MessageSquare className="h-4 w-4 mr-2" /> Messages
              </TabsTrigger>
              <TabsTrigger value="resources" className="btn-animate">
                <FileText className="h-4 w-4 mr-2" /> Resources
              </TabsTrigger>
            </TabsList>
            <TabsContent value="messages" className="p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <Message 
                    key={message.id} 
                    id={message.id}
                    content={message.content}
                    timestamp={new Date(message.created_at)}
                    sender={{
                      id: message.user_id,
                      name: message.profile?.full_name || message.profile?.username || "Unknown User",
                      fallback: message.profile?.username?.substring(0, 2).toUpperCase() || "?",
                      year: message.profile?.year
                    }}
                  />
                ))}
              </div>
              <Separator />
              <MessageInput onSendMessage={handleSendMessage} enableAttach={true} />
            </TabsContent>
            <TabsContent value="resources" className="p-4">
              <ChannelResources channelId={channelData.id} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Channel;
