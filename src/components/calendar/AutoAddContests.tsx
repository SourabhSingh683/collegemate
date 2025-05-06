
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { addMonths, startOfDay, addDays, setHours, setMinutes, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Component to auto-add CodeChef Starter contests to the calendar
const AutoAddContests: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkAndAddCodeChefContests();
    }
  }, [user]);

  // Helper function to get all Wednesdays in a date range
  const getAllWednesdays = (start: Date, end: Date): Date[] => {
    const wednesdays: Date[] = [];
    let current = new Date(start);
    
    // Find the first Wednesday
    while (current.getDay() !== 3) { // 3 is Wednesday (0 is Sunday)
      current = addDays(current, 1);
    }
    
    // Add all Wednesdays until end date
    while (current <= end) {
      wednesdays.push(new Date(current));
      current = addDays(current, 7);
    }
    
    return wednesdays;
  };

  const checkAndAddCodeChefContests = async () => {
    try {
      // Get existing CodeChef contests
      const { data: existingContests, error: fetchError } = await supabase
        .rpc('get_visible_calendar_events')
        .eq('type', 'Contest')
        .ilike('title', '%CodeChef Starter%');

      if (fetchError) throw fetchError;

      // Get the next 3 months range for which to add contests
      const today = startOfDay(new Date());
      const threeMonthsLater = addMonths(today, 3);
      
      // Get all Wednesdays in the next 3 months
      const wednesdays = getAllWednesdays(today, threeMonthsLater);
      
      // Filter out Wednesdays that already have a CodeChef Starter contest
      const existingDates = (existingContests || []).map(contest => {
        const contestDate = new Date(contest.start);
        return contestDate.toDateString();
      });
      
      const wednesdaysToAdd = wednesdays.filter(wednesday => 
        !existingDates.some(existingDate => 
          isSameDay(new Date(existingDate), wednesday)
        )
      );
      
      // Add a CodeChef Starter contest for each new Wednesday
      for (const wednesday of wednesdaysToAdd) {
        const contestDate = setMinutes(setHours(wednesday, 20), 0); // 8 PM
        const endDate = setMinutes(setHours(wednesday, 23), 0); // 11 PM
        
        const contestNumber = Math.floor(Math.random() * 100) + 1; // Random contest number for demonstration
        
        await supabase.rpc('add_calendar_event', {
          event_title: `CodeChef Starter ${contestNumber}`,
          event_description: 'Weekly programming contest on CodeChef platform.',
          event_start: contestDate.toISOString(),
          event_end: endDate.toISOString(),
          event_category: 'contest',
          event_type: 'Contest',
          event_is_private: false
        });
      }
      
      if (wednesdaysToAdd.length > 0) {
        console.log(`Added ${wednesdaysToAdd.length} new CodeChef Starter contests`);
      }
    } catch (error) {
      console.error('Error adding CodeChef contests:', error);
    }
  };

  return null; // This component doesn't render anything
};

export default AutoAddContests;
