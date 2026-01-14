import { motion } from "framer-motion";
import { Mic, Video, MonitorUp, Users } from "lucide-react";

const HeroIllustration = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative w-full max-w-lg mx-auto"
    >
      {/* Main video preview container */}
      <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 google-shadow-xl overflow-hidden">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-4 grid-rows-3 h-full gap-px">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white/20 rounded-sm" />
            ))}
          </div>
        </div>

        {/* Participant avatars simulation */}
        <div className="absolute inset-4 grid grid-cols-2 gap-3">
          {[
            { color: "from-blue-500 to-blue-600", initials: "JD" },
            { color: "from-green-500 to-green-600", initials: "SM" },
            { color: "from-purple-500 to-purple-600", initials: "AK" },
            { color: "from-orange-500 to-orange-600", initials: "RB" },
          ].map((participant, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              className={`rounded-lg bg-gradient-to-br ${participant.color} flex items-center justify-center`}
            >
              <span className="text-white font-medium text-lg md:text-xl opacity-90">
                {participant.initials}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Bottom control bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="absolute bottom-0 left-0 right-0 h-14 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center gap-2"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
            <Mic className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
            <Video className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
            <MonitorUp className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
            <Users className="h-5 w-5 text-white" />
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-google-blue/10 blur-2xl"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-google-green/10 blur-2xl"
      />
    </motion.div>
  );
};

export default HeroIllustration;
