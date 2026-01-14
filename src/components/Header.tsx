import { motion } from "framer-motion";
import { Video, Settings, HelpCircle, Menu, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 h-16 bg-background/95 backdrop-blur-sm border-b border-border/50"
    >
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5 text-muted-foreground" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-google-blue">
            <Video className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-normal text-foreground tracking-tight hidden sm:block">
            Meet
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="mr-2">
          <Grid3X3 className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
          <AvatarFallback className="bg-google-blue text-primary-foreground text-sm">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </motion.header>
  );
};

export default Header;
