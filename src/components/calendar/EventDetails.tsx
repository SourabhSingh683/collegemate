import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Edit, Trash, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent, EventCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EventDetailsProps {
  event: CalendarEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  onEventUpdated: (event: CalendarEvent) => void;
  onEventDeleted: (eventId: string) => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  open,
  onOpenChange,
  isAdmin,
  onEventUpdated,
  onEventDeleted,
}) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Check if the current user is the creator of the event
  const isCreator = profile?.id === event.createdBy;
  
  // Only admins can approve/reject events, and only admins or creators can delete events
  const canManage = isAdmin || isCreator;

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

  const handleApproveEvent = async () => {
    if (!isAdmin) return;
    
    try {
      setIsApproving(true);
      
      // Using RPC to update the database
      const { data, error } = await supabase.rpc('approve_calendar_event', { 
        event_id: event.id 
      });
      
      if (error) throw error;
      
      // Update the local event state
      const updatedEvent = { ...event, approved: true };
      onEventUpdated(updatedEvent);
      
      toast({
        title: "Event approved",
        description: "The event has been approved and is now visible to all users."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error approving event",
        description: error.message
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!canManage) return;
    
    try {
      setIsDeleting(true);
      
      // Using RPC to delete the event
      const { data, error } = await supabase.rpc('delete_calendar_event', { 
        event_id: event.id 
      });
      
      if (error) throw error;
      
      onEventDeleted(event.id);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Event deleted",
        description: "The event has been removed from the calendar."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting event",
        description: error.message
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{event.title}</span>
              {event.isPrivate && (
                <Badge variant="outline" className="ml-2">
                  Private
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Event details and information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColorClass(event.category)}>
                {event.type}
              </Badge>
              {!event.approved && !event.isPrivate && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800">
                  Pending Approval
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Date & Time</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <div>
                  {format(parseISO(event.start), "EEEE, MMMM d, yyyy")}
                  <br />
                  {format(parseISO(event.start), "h:mm a")} - 
                  {format(parseISO(event.end), "h:mm a")}
                </div>
              </div>
            </div>

            {event.description && (
              <div className="space-y-1">
                <div className="text-sm font-medium">Description</div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            {canManage && (
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            
            {isAdmin && !event.approved && !event.isPrivate && (
              <Button 
                onClick={handleApproveEvent}
                disabled={isApproving}
                className="w-full sm:w-auto"
              >
                {isApproving ? "Approving..." : "Approve Event"}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              from the calendar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventDetails;
