
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface MessageProps {
  id: string;
  content: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    fallback: string;
    year: string | null;
  };
  enableReply?: boolean;
}

const Message: React.FC<MessageProps> = ({ id, content, timestamp, sender, enableReply = true }) => {
  // Only show 'Anonymous' if explicitly set, otherwise show the full name or username
  const displayName = sender.name === "Anonymous" 
    ? "Anonymous" 
    : sender.name || "Unknown User";
  
  // Generate initials for avatar fallback if not provided
  const avatarFallback = sender.fallback || displayName.substring(0, 2).toUpperCase();

  return (
    <div className="flex items-start gap-2">
      <Avatar className="h-10 w-10">
        <AvatarImage src="" />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <div className="flex gap-2 items-center">
          <p className="font-medium text-foreground">{displayName}</p>
          {sender.year && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
              {sender.year}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {format(timestamp, 'MMM d, h:mm a')}
          </span>
        </div>
        <p className="text-sm text-foreground/90">{content}</p>
      </div>
    </div>
  );
};

export default Message;
