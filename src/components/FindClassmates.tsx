
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, UserSearch } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  year: string | null;
  branch: string | null;
  bio: string | null;
}

const FindClassmates: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (isOpen && !hasSearched) {
      // Initial load of profiles
      fetchProfiles();
    }
  }, [isOpen, hasSearched]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      // Apply filters if they exist
      if (searchText) {
        query = query.or(`username.ilike.%${searchText}%,full_name.ilike.%${searchText}%`);
      }
      
      if (yearFilter && yearFilter !== 'all') {
        query = query.eq('year', yearFilter);
      }
      
      if (branchFilter && branchFilter !== 'all') {
        query = query.eq('branch', branchFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setProfiles(data || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await fetchProfiles();
  };

  const resetFilters = () => {
    setSearchText('');
    setYearFilter('all');
    setBranchFilter('all');
    setHasSearched(false);
    fetchProfiles();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <UserSearch className="h-4 w-4" />
          <span>Find Classmates</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Find Classmates</DialogTitle>
          <DialogDescription>
            Search for classmates by name, year, or branch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by name or username"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="mb-0"
              />
            </div>
            <Button type="submit" onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Year of study" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  <SelectItem value="1">First Year</SelectItem>
                  <SelectItem value="2">Second Year</SelectItem>
                  <SelectItem value="3">Third Year</SelectItem>
                  <SelectItem value="4">Fourth Year</SelectItem>
                  <SelectItem value="5">Fifth Year</SelectItem>
                  <SelectItem value="6">Postgraduate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Branch/Major" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All branches</SelectItem>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="ee">Electrical Engineering</SelectItem>
                  <SelectItem value="me">Mechanical Engineering</SelectItem>
                  <SelectItem value="ce">Civil Engineering</SelectItem>
                  <SelectItem value="chem">Chemical Engineering</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="mt-2">
              <div className="flex justify-between mb-2">
                <p className="text-sm text-muted-foreground">
                  {profiles.length} {profiles.length === 1 ? 'result' : 'results'}
                </p>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
              
              <ScrollArea className="h-[300px] rounded-md border p-2">
                {profiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <p className="text-muted-foreground">No users found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profiles.map((profile) => (
                      <div key={profile.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile.avatar_url || ''} />
                          <AvatarFallback>
                            {profile.full_name
                              ? profile.full_name.split(' ').map(n => n[0]).join('')
                              : profile.username?.substring(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:justify-between">
                            <h4 className="font-medium">{profile.full_name || profile.username}</h4>
                            {profile.year && (
                              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                {profile.year === '1' && 'First Year'}
                                {profile.year === '2' && 'Second Year'}
                                {profile.year === '3' && 'Third Year'}
                                {profile.year === '4' && 'Fourth Year'}
                                {profile.year === '5' && 'Fifth Year'}
                                {profile.year === '6' && 'Postgraduate'}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            @{profile.username}
                            {profile.branch && (
                              <span className="ml-2">
                                • {profile.branch === 'cs' && 'Computer Science'}
                                {profile.branch === 'ee' && 'Electrical Engineering'}
                                {profile.branch === 'me' && 'Mechanical Engineering'}
                                {profile.branch === 'ce' && 'Civil Engineering'}
                                {profile.branch === 'chem' && 'Chemical Engineering'}
                                {profile.branch === 'other' && 'Other'}
                              </span>
                            )}
                          </div>
                          {profile.bio && (
                            <p className="text-sm mt-1 line-clamp-2">{profile.bio}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FindClassmates;
