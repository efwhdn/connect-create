import { motion } from "framer-motion";
import { Video, Keyboard, Plus, Link2, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";

const MeetingCard = () => {
  const [meetingCode, setMeetingCode] = useState("");

  const handleNewMeeting = (type: string) => {
    toast.success(`Creating ${type}...`, {
      description: "Your meeting room is being prepared.",
    });
  };

  const handleJoinMeeting = () => {
    if (!meetingCode.trim()) {
      toast.error("Please enter a meeting code");
      return;
    }
    toast.success("Joining meeting...", {
      description: `Connecting to ${meetingCode}`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="h-12 px-6 gap-2 bg-google-blue hover:bg-google-blue-hover text-primary-foreground rounded-md font-medium text-sm shadow-sm transition-all hover:shadow-md"
            >
              <Video className="h-5 w-5" />
              New meeting
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 p-1 rounded-lg google-shadow-lg border-border/50"
          >
            <DropdownMenuItem
              onClick={() => handleNewMeeting("meeting link")}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md"
            >
              <Link2 className="h-5 w-5 text-muted-foreground" />
              <span>Create a meeting for later</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleNewMeeting("instant meeting")}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md"
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
              <span>Start an instant meeting</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleNewMeeting("scheduled meeting")}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md"
            >
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>Schedule in Google Calendar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter a code or link"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
              className="h-12 pl-11 pr-4 rounded-md border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-google-blue focus:ring-google-blue/20"
            />
          </div>
          <Button
            variant="ghost"
            onClick={handleJoinMeeting}
            disabled={!meetingCode.trim()}
            className="h-12 px-4 text-google-blue hover:bg-google-blue/5 font-medium disabled:text-muted-foreground disabled:hover:bg-transparent"
          >
            Join
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MeetingCard;
