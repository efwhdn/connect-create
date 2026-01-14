import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group p-6 rounded-2xl bg-surface-elevated border border-border/50 google-shadow hover:google-shadow-lg transition-all duration-300 cursor-default"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-google-blue/10 mb-4 group-hover:bg-google-blue/15 transition-colors">
        <Icon className="h-6 w-6 text-google-blue" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
