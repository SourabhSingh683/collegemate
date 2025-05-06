
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, BookOpen, TrendingUp, Shield, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { Channel } from "@/types";
import { format } from "date-fns";
import CreateChannelDialog from "@/components/CreateChannelDialog";
import FindClassmates from "@/components/FindClassmates";

const Dashboard: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();

    // Subscribe to realtime updates for channels
    const channelSubscription = supabase
      .channel('public:channels')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'channels' }, 
        payload => {
          setChannels(prev => [...prev, payload.new as Channel]);
        }
      )
      .subscribe();
    
    // Subscribe to realtime updates for messages
    const messageSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        payload => {
          // Refresh recent activities when new messages come in
          fetchRecentActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSubscription);
      supabase.removeChannel(messageSubscription);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await fetchChannels();
      await fetchRecentActivities();
    } catch (error: any) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("name");
      
      if (error) {
        throw error;
      }
      
      setChannels(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching channels",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      setActivityLoading(true);
      // Get recent messages with profile information
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          channel_id,
          user_id,
          profiles:user_id (username, full_name, avatar_url, year)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (messagesError) throw messagesError;

      // Get channel information for the messages
      if (messages && messages.length > 0) {
        const channelIds = [...new Set(messages.map(msg => msg.channel_id))];
        
        const { data: channelsData, error: channelsError } = await supabase
          .from("channels")
          .select("id, name, slug")
          .in("id", channelIds);
          
        if (channelsError) throw channelsError;
        
        // Combine message and channel data
        const activitiesWithChannels = messages.map(msg => ({
          ...msg,
          channel: channelsData?.find(ch => ch.id === msg.channel_id) || null
        }));
        
        setRecentActivities(activitiesWithChannels);
      } else {
        setRecentActivities([]);
      }
    } catch (error: any) {
      console.error("Error fetching recent activities:", error);
    } finally {
      setActivityLoading(false);
    }
  };

  const getChannelIcon = (icon: string | null) => {
    switch (icon) {
      case "MessageSquare":
        return <MessageSquare className="h-5 w-5" />;
      case "Code":
        return <TrendingUp className="h-5 w-5" />;
      case "TrendingUp":
        return <TrendingUp className="h-5 w-5" />;
      case "Shield":
        return <Shield className="h-5 w-5" />;
      case "BookOpen":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const joinChannel = async (channelId: string, slug: string) => {
    try {
      // Check if already a member
      const userResponse = await supabase.auth.getUser();
      const userId = userResponse.data.user?.id;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: "Could not determine current user"
        });
        return;
      }
      
      const { data: existingMembership, error: membershipError } = await supabase
        .from("channel_members")
        .select("*")
        .eq("channel_id", channelId)
        .eq("user_id", userId);
      
      if (membershipError) throw membershipError;
      
      // If not already a member, join the channel
      if (!existingMembership || existingMembership.length === 0) {
        const { error } = await supabase
          .from("channel_members")
          .insert([
            { channel_id: channelId, user_id: userId }
          ]);
        
        if (error) throw error;
        
        toast({
          title: "Joined channel",
          description: "You've successfully joined this channel."
        });
      }
      
      // Navigate to the channel
      navigate(`/channel/${slug}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error joining channel",
        description: error.message
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to CollegeMate. Join a channel to start connecting with your peers.
            </p>
          </div>
          
          <div className="flex gap-2">
            <FindClassmates />
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Channel
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-7 gap-6">
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Channels
              </CardTitle>
              <CardDescription>
                Join topic-based channels to connect with peers and discuss specific subjects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[300px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {channels.map((channel) => (
                    <div 
                      key={channel.id}
                      className="flex items-start gap-4 p-4 rounded-md hover:bg-accent transition-colors"
                    >
                      <div className="bg-primary/10 text-primary h-12 w-12 rounded-md flex items-center justify-center">
                        {getChannelIcon(channel.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{channel.name}</h3>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => joinChannel(channel.id, channel.slug)}
                          >
                            Join
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{channel.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Stay updated with the latest discussions across channels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-3 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  No recent activity found. Join some channels and start discussions!
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div 
                      key={activity.id}
                      className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/channel/${activity.channel?.slug}`)}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-medium">
                        {activity.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 
                         activity.profiles?.username?.substring(0, 2).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <p className="text-sm font-medium">
                            <span>{activity.profiles?.full_name || activity.profiles?.username}</span>
                            {activity.profiles?.year && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                (Year {activity.profiles.year})
                              </span>
                            )}
                            <span> in </span>
                            <span className="text-primary font-medium">
                              #{activity.channel?.name || 'Unknown'}
                            </span>
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {activity.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateChannelDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onComplete={fetchChannels}
      />
    </AppLayout>
  );
};

export default Dashboard;
