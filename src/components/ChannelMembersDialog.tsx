
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { type Profile } from '@/types';

interface ChannelMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  channelName: string;
}

interface Member {
  user_id: string;
  joined_at: string;
  profile: Profile;
}

const ChannelMembersDialog: React.FC<ChannelMembersDialogProps> = ({
  open,
  onOpenChange,
  channelId,
  channelName
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open, channelId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          user_id,
          joined_at,
          profile:profiles(*)
        `)
        .eq('channel_id', channelId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not load members: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (term: string) => {
    if (!term.trim() || term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${term}%,full_name.ilike.%${term}%`)
        .limit(5);

      if (error) throw error;
      
      // Filter out users who are already members
      const memberIds = members.map(member => member.user_id);
      const filteredResults = data?.filter(user => !memberIds.includes(user.id)) || [];
      
      setSearchResults(filteredResults);
    } catch (error: any) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const addUserToChannel = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('channel_members')
        .insert([
          { channel_id: channelId, user_id: userId }
        ]);

      if (error) throw error;

      toast({
        title: "Member added",
        description: "User has been added to the channel"
      });

      // Clear search and refresh members list
      setSearchTerm('');
      setSearchResults([]);
      await fetchMembers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to add member: ${error.message}`
      });
    }
  };

  const getInitials = (profile: Profile) => {
    if (profile.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    if (profile.username) {
      return profile.username.substring(0, 2).toUpperCase();
    }
    
    return "U";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Channel Members - {channelName}</DialogTitle>
          <DialogDescription>
            View and manage members of this channel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users to add..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                searchUsers(e.target.value);
              }}
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-md">
              <div className="p-2 bg-muted/50 border-b">
                <h4 className="text-sm font-medium">Search Results</h4>
              </div>
              <div className="divide-y">
                {searchResults.map(user => (
                  <div key={user.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || ""} />
                        <AvatarFallback>{getInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || user.username}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addUserToChannel(user.id)}
                    >
                      <UserPlus size={16} className="mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searching && (
            <div className="flex justify-center p-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}

          {/* Members List */}
          <div className="border rounded-md">
            <div className="p-2 bg-muted/50 border-b">
              <h4 className="text-sm font-medium">Members ({members.length})</h4>
            </div>
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : members.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No members found
                </div>
              ) : (
                members.map(member => (
                  <div key={member.user_id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.profile?.avatar_url || ""} />
                        <AvatarFallback>{getInitials(member.profile)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.profile?.full_name || member.profile?.username}</p>
                        <p className="text-xs text-muted-foreground">@{member.profile?.username}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Joined {format(new Date(member.joined_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelMembersDialog;
