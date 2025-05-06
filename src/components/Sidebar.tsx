
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Home, 
  MessageSquare, 
  Settings, 
  User
} from 'lucide-react';
import FindClassmates from './FindClassmates';

interface Channel {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserChannels();
    }
  }, [user]);

  const fetchUserChannels = async () => {
    try {
      setLoading(true);
      
      // Get channels the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('channel_members')
        .select('channel_id')
        .eq('user_id', user?.id);
      
      if (memberError) throw memberError;
      
      if (memberData && memberData.length > 0) {
        const channelIds = memberData.map(item => item.channel_id);
        
        const { data: channelsData, error: channelsError } = await supabase
          .from('channels')
          .select('*')
          .in('id', channelIds)
          .order('name');
          
        if (channelsError) throw channelsError;
        
        setChannels(channelsData || []);
      } else {
        setChannels([]);
      }
    } catch (error) {
      console.error('Error fetching user channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    if (profile?.username) {
      return profile.username.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  return (
    <div className="h-screen border-r flex flex-col glass-sidebar">
      {/* User profile section */}
      <div className="p-4 border-b border-sidebar-border/40">
        <Link to="/profile" className="flex items-center gap-3 group">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium leading-none truncate group-hover:text-primary transition-colors">
              {profile?.full_name || profile?.username || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{profile?.username || 'username'} · {profile?.year || '3rd Year'}
            </p>
          </div>
        </Link>
      </div>

      {/* Main navigation */}
      <div className="p-2">
        <nav className="grid gap-1">
          <Button 
            variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="justify-start"
            asChild
          >
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          
          <Button 
            variant={location.pathname === '/calendar' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="justify-start"
            asChild
          >
            <Link to="/calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </Link>
          </Button>
          
          <FindClassmates />
          
          <Button 
            variant={location.pathname === '/profile' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="justify-start"
            asChild
          >
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          
          <Button 
            variant={location.pathname === '/settings' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="justify-start"
            asChild
          >
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </nav>
      </div>

      {/* Channels section */}
      <div className="px-4 py-2 flex-1 overflow-hidden">
        <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight">
          My Channels
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-15rem)]">
            <div className="space-y-1 p-2">
              {channels.length === 0 ? (
                <p className="text-xs text-center text-muted-foreground py-4">
                  You haven't joined any channels yet.
                </p>
              ) : (
                channels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={location.pathname === `/channel/${channel.slug}` ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      "w-full justify-start",
                      location.pathname === `/channel/${channel.slug}` ? 'font-medium' : 'font-normal'
                    )}
                    asChild
                  >
                    <Link to={`/channel/${channel.slug}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span className="truncate">{channel.name}</span>
                    </Link>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
