
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  enableAttach?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, enableAttach = true }) => {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };
  
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      toast({
        title: "File attached",
        description: `${file.name} (${(file.size / 1024).toFixed(1)} KB) has been attached.`,
      });
      
      // Clear the input for future uploads
      e.target.value = "";
    }
  };
  
  const handleEmojiClick = () => {
    toast({
      title: "Emoji picker",
      description: "Emoji picker would open here. This feature is coming soon!",
    });
    
    // For demo purposes, let's add a smiley face emoji to the message
    setMessage(prev => prev + " 😊 ");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="flex gap-2 items-end">
        <div className="relative flex-grow">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[60px] resize-none pr-12 bg-accent/50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (message.trim()) {
                  onSendMessage(message);
                  setMessage("");
                }
              }
            }}
          />
          <div className="absolute right-2 bottom-2 flex gap-1">
            {enableAttach && (
              <>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-primary/10"
                  onClick={handleFileUpload}
                >
                  <Paperclip size={16} />
                </Button>
              </>
            )}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-primary/10"
              onClick={handleEmojiClick}
            >
              <Smile size={16} />
            </Button>
          </div>
        </div>
        <Button
          type="submit"
          className="rounded-full px-3"
          disabled={!message.trim()}
        >
          <Send size={16} className="mr-1" />
          Send
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;
