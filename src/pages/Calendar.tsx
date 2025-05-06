import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, List, CalendarDays, Info } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarEvent, EventCategory, EventType } from "@/types"; // Added EventType import
import AddEventDialog from "@/components/calendar/AddEventDialog";
import EventDetails from "@/components/calendar/EventDetails";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AutoAddContests from "@/components/calendar/AutoAddContests";

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isViewingEvent, setIsViewingEvent] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const isAdmin = profile?.username === "sumant123" || profile?.username === "sourabh";

  useEffect(() => {
    fetchEvents();
    addRecurringEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.rpc('get_visible_calendar_events');
      
      if (error) throw error;
      
      const transformedEvents: CalendarEvent[] = (data || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        category: event.category as EventCategory,
        type: event.type as EventType,
        isPrivate: event.is_private,
        createdBy: event.created_by,
        approved: event.approved,
        created_at: event.created_at
      }));
      
      setEvents(transformedEvents);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      toast({
        variant: "destructive",
        title: "Error fetching events",
        description: error.message
      });
    }
  };

  const addRecurringEvents = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    for (let i = 0; i < 3; i++) {
      const month = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      
      const wednesdays = days.filter(day => getDay(day) === 3);
      
      wednesdays.forEach(day => {
        const contestDate = new Date(day);
        contestDate.setHours(20, 0, 0, 0);
        
        const event: CalendarEvent = {
          id: `codechef-${format(contestDate, 'yyyy-MM-dd')}`,
          title: "CodeChef Weekly Contest",
          description: "Weekly coding contest on CodeChef platform",
          start: contestDate.toISOString(),
          end: new Date(contestDate.getTime() + 3 * 60 * 60 * 1000).toISOString(),
          category: 'contest',
          type: 'Contest',
          isPrivate: false,
          createdBy: 'system',
          approved: true
        };
        
        setEvents(prev => {
          if (!prev.some(e => e.id === event.id)) {
            return [...prev, event];
          }
          return prev;
        });
      });
    }
  };

  const handleAddEvent = async (newEvent: Omit<CalendarEvent, 'id' | 'approved' | 'createdBy'>) => {
    try {
      const { data, error } = await supabase.rpc('add_calendar_event', {
        event_title: newEvent.title,
        event_description: newEvent.description,
        event_start: newEvent.start,
        event_end: newEvent.end,
        event_category: newEvent.category,
        event_type: newEvent.type,
        event_is_private: newEvent.isPrivate
      });

      if (error) throw error;
      
      fetchEvents();
      setIsAddEventOpen(false);

      toast({
        title: newEvent.isPrivate ? 
          "Personal reminder added" : 
          isAdmin ? 
            "Event added to calendar" : 
            "Event submitted for approval",
        description: newEvent.isPrivate ? 
          "Your reminder has been added to your calendar" : 
          isAdmin ? 
            "The event has been published to the calendar" : 
            "An admin will review and approve your event soon",
      });
    } catch (error: any) {
      console.error("Error adding event:", error);
      toast({
        variant: "destructive",
        title: "Error adding event",
        description: error.message
      });
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewingEvent(true);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startWeekday = getDay(monthStart);

  const eventsInCurrentMonth = events.filter(event => 
    isSameMonth(parseISO(event.start), currentDate) &&
    (isAdmin || event.approved || (event.createdBy === profile?.id))
  );

  const now = new Date();
  const upcomingEvents = events
    .filter(event => 
      parseISO(event.start) > now && 
      (isAdmin || event.approved || (event.createdBy === profile?.id) && event.isPrivate)
    )
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
    .slice(0, 10);

  const selectedDateEvents = selectedDate ? 
    events.filter(event => 
      isSameDay(parseISO(event.start), selectedDate) && 
      (isAdmin || event.approved || (event.createdBy === profile?.id) && event.isPrivate)
    ) : [];

  const getCategoryColorClass = (category: EventCategory) => {
    switch (category) {
      case 'hackathon': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'holiday': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'workshop': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'personal': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'club': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'contest': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300';
      case 'notice': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <AppLayout>
      <AutoAddContests />
      
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">
              Manage your schedules, events, and reminders
            </p>
          </div>
          <Button onClick={() => setIsAddEventOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>

        <Tabs defaultValue="month" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="month" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Month View
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold px-2">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCurrentDate(new Date())}
                title="Today"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="month" className="mt-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="col-span-1 md:col-span-2">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-center font-medium text-sm py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: startWeekday }).map((_, index) => (
                      <div
                        key={`empty-start-${index}`}
                        className="aspect-square p-1 border rounded-md opacity-50 bg-muted/30"
                      />
                    ))}

                    {daysInMonth.map((day) => {
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isToday = isSameDay(day, new Date());
                      
                      const dayEvents = eventsInCurrentMonth.filter(event => 
                        isSameDay(parseISO(event.start), day)
                      );
                      
                      return (
                        <div
                          key={day.toString()}
                          className={`
                            aspect-square p-1 border rounded-md overflow-hidden flex flex-col transition-colors
                            ${isSelected ? 'ring-2 ring-primary' : ''}
                            ${isToday ? 'bg-accent/50' : 'hover:bg-accent/30'}
                            ${getDay(day) === 0 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}
                            cursor-pointer
                          `}
                          onClick={() => handleDateClick(day)}
                        >
                          <div className={`
                            text-right font-medium text-sm mb-1
                            ${isToday ? 'text-primary' : ''}
                          `}>
                            {format(day, "d")}
                          </div>
                          
                          <div className="flex flex-col gap-1 overflow-hidden">
                            {dayEvents.slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className={`
                                  text-xs truncate px-1 py-0.5 rounded
                                  ${getCategoryColorClass(event.category)}
                                  hover:opacity-80 transition-opacity
                                `}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event);
                                }}
                                title={event.title}
                              >
                                {event.title.length > 15 ? `${event.title.substring(0, 15)}...` : event.title}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Upcoming Events"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[500px] overflow-y-auto">
                  {selectedDate ? (
                    selectedDateEvents.length > 0 ? (
                      <div className="space-y-3">
                        {selectedDateEvents.map((event) => (
                          <div
                            key={event.id}
                            className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{event.title}</h3>
                              <Badge className={getCategoryColorClass(event.category)}>
                                {event.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {format(parseISO(event.start), "h:mm a")} - 
                              {format(parseISO(event.end), "h:mm a")}
                            </p>
                            {event.isPrivate && (
                              <Badge variant="outline" className="mt-2">
                                Private
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <CalendarIcon className="mx-auto h-12 w-12 mb-3 opacity-30" />
                        <p>No events scheduled for this day</p>
                        <Button 
                          variant="outline"
                          className="mt-4"
                          onClick={() => setIsAddEventOpen(true)}
                        >
                          Add Event
                        </Button>
                      </div>
                    )
                  ) : (
                    upcomingEvents.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{event.title}</h3>
                              <Badge className={getCategoryColorClass(event.category)}>
                                {event.type}
                              </Badge>
                            </div>
                            <p className="text-sm mt-1">
                              {format(parseISO(event.start), "EEEE, MMMM d")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(event.start), "h:mm a")} - 
                              {format(parseISO(event.end), "h:mm a")}
                            </p>
                            {event.isPrivate && (
                              <Badge variant="outline" className="mt-2">
                                Private
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Info className="mx-auto h-12 w-12 mb-3 opacity-30" />
                        <p>No upcoming events</p>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <div className="bg-background/80 backdrop-blur p-2 rounded-md border min-w-20 text-center">
                            <div className="text-2xl font-semibold">
                              {format(parseISO(event.start), "d")}
                            </div>
                            <div className="text-sm">
                              {format(parseISO(event.start), "MMM")}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(event.start), "EEEE, MMMM d, yyyy")} | 
                              {format(parseISO(event.start), "h:mm a")} - 
                              {format(parseISO(event.end), "h:mm a")}
                            </p>
                          </div>
                          <Badge className={getCategoryColorClass(event.category)}>
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-sm line-clamp-2">{event.description}</p>
                        {event.isPrivate && (
                          <Badge variant="outline" className="mt-2">
                            Private
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <CalendarIcon className="mx-auto h-12 w-12 mb-3 opacity-30" />
                    <p>No upcoming events found</p>
                    <Button 
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsAddEventOpen(true)}
                    >
                      Add Event
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddEventDialog 
        open={isAddEventOpen} 
        onOpenChange={setIsAddEventOpen} 
        onAddEvent={handleAddEvent}
        isAdmin={isAdmin}
      />

      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          open={isViewingEvent}
          onOpenChange={setIsViewingEvent}
          isAdmin={isAdmin}
          onEventUpdated={(updatedEvent) => {
            setEvents(prev => prev.map(e => 
              e.id === updatedEvent.id ? updatedEvent : e
            ));
          }}
          onEventDeleted={(eventId) => {
            setEvents(prev => prev.filter(e => e.id !== eventId));
            setIsViewingEvent(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </AppLayout>
  );
};

export default Calendar;
