
import React, { useEffect, useState } from 'react';
import { Bell, Check, ChevronRight, Loader2, ShieldQuestion, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Separator } from './ui/separator';

interface Notification {
  id: string;
  content: string;
  is_read: boolean | null;
  created_at: string;
  related_channel_id: string | null;
  related_user_id?: string | null;
  type?: string;
}

const NotificationsPopover: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error: any) {
      console.error('Error fetching notifications:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not mark notification as read: ${error.message}`
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      toast({
        title: "Notifications",
        description: "All notifications marked as read"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not mark all as read: ${error.message}`
      });
    }
  };

  // Handle join request approval
  const handleJoinRequest = async (notification: Notification, approve: boolean) => {
    if (!notification.related_channel_id || !notification.related_user_id) return;
    
    setProcessingIds(prev => [...prev, notification.id]);
    
    try {
      if (approve) {
        // Add user to channel members
        const { error: memberError } = await supabase
          .from('channel_members')
          .insert([{
            channel_id: notification.related_channel_id,
            user_id: notification.related_user_id
          }]);
          
        if (memberError) throw memberError;
        
        // Create notification for the requesting user
        const { error: notifyError } = await supabase
          .from('notifications')
          .insert([{
            content: 'Your request to join the channel has been approved',
            user_id: notification.related_user_id,
            related_channel_id: notification.related_channel_id,
            type: 'join_approved'
          }]);
          
        if (notifyError) throw notifyError;
        
        toast({
          title: "Request Approved",
          description: "The user has been added to the channel"
        });
      } else {
        // Create notification for the requesting user that they were denied
        const { error: notifyError } = await supabase
          .from('notifications')
          .insert([{
            content: 'Your request to join the channel has been denied',
            user_id: notification.related_user_id,
            related_channel_id: notification.related_channel_id,
            type: 'join_denied'
          }]);
          
        if (notifyError) throw notifyError;
        
        toast({
          title: "Request Denied",
          description: "The user was not added to the channel"
        });
      }
      
      // Mark the notification as read
      await markAsRead(notification.id);
      
      // Remove the notification from the list
      setNotifications(notifications.filter(n => n.id !== notification.id));
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== notification.id));
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Skip navigation for join requests, they have their own buttons
    if (notification.type === 'join_request') return;
    
    // Navigate if there's a related channel
    if (notification.related_channel_id) {
      // Get channel data
      supabase
        .from('channels')
        .select('slug')
        .eq('id', notification.related_channel_id)
        .single()
        .then(({ data }) => {
          if (data?.slug) {
            navigate(`/channel/${data.slug}`);
            setOpen(false);
          }
        });
    }
  };

  // Fetch notifications on mount and when popover opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Set up realtime subscription for new notifications
  useEffect(() => {
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        payload => {
          // Add new notification to the list and increment unread count
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: "New notification",
            description: (payload.new as Notification).content
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          size="icon" 
          variant="ghost" 
          className="relative btn-animate"
        >
          <Bell size={18} className={unreadCount > 0 ? "animate-pulse-slow" : ""} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="btn-animate"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-[350px]">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`
                    p-4 border-b border-border hover:bg-accent/50 transition-colors
                    ${!notification.is_read ? 'bg-accent/40' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div className={notification.type === 'join_request' ? 'w-full' : 'cursor-pointer'} onClick={() => notification.type !== 'join_request' && handleNotificationClick(notification)}>
                      <p className={!notification.is_read ? 'font-medium' : 'text-muted-foreground'}>
                        {notification.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notification.created_at), 'MMM d, yyyy · h:mm a')}
                      </p>
                      
                      {/* Join Request Controls */}
                      {notification.type === 'join_request' && (
                        <div className="mt-3 flex gap-2">
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="w-full btn-animate"
                            disabled={processingIds.includes(notification.id)}
                            onClick={() => handleJoinRequest(notification, true)}
                          >
                            {processingIds.includes(notification.id) ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full btn-animate"
                            disabled={processingIds.includes(notification.id)}
                            onClick={() => handleJoinRequest(notification, false)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Deny
                          </Button>
                        </div>
                      )}
                    </div>
                    {!notification.type && notification.related_channel_id && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    {notification.type === 'join_request' && (
                      <ShieldQuestion className="h-5 w-5 text-primary mr-1 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
