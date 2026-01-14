import { motion } from "framer-motion";
import { Shield, Users, Zap, Globe } from "lucide-react";
import Header from "@/components/Header";
import MeetingCard from "@/components/MeetingCard";
import FeatureCard from "@/components/FeatureCard";
import HeroIllustration from "@/components/HeroIllustration";

const features = [
  {
    icon: Shield,
    title: "Secure by design",
    description: "Enterprise-grade security with encryption in transit. Your conversations stay private.",
  },
  {
    icon: Users,
    title: "Meet with anyone",
    description: "Share a link with guests. They can join without signing in or downloading.",
  },
  {
    icon: Zap,
    title: "Crystal clear quality",
    description: "AI-powered noise cancellation and auto-adjusting video for the best experience.",
  },
  {
    icon: Globe,
    title: "Available everywhere",
    description: "Join from any device. Desktop, mobile, or tablet - it just works.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left content */}
              <div className="text-center lg:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-normal text-foreground tracking-tight leading-tight mb-6"
                >
                  Video calls and meetings
                  <span className="block text-muted-foreground">for everyone</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto lg:mx-0"
                >
                  Connect, collaborate, and celebrate from anywhere with secure video conferencing that just works.
                </motion.p>

                <MeetingCard />

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-6 text-sm text-muted-foreground"
                >
                  <a href="#learn-more" className="text-google-blue hover:underline">
                    Learn more
                  </a>
                  {" "}about Meet
                </motion.p>
              </div>

              {/* Right illustration */}
              <div className="hidden lg:block">
                <HeroIllustration />
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-surface-container to-transparent pointer-events-none" />
        </section>

        {/* Features Section */}
        <section id="learn-more" className="bg-surface-container py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-normal text-foreground mb-4">
                Premium video meetings. Free for everyone.
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                We rebuilt video meetings from the ground up. Get started today with features that make collaboration seamless.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={0.1 + index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-normal text-foreground mb-4">
                Ready to get started?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                No downloads required. Start a meeting in seconds.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center h-12 px-8 bg-google-blue hover:bg-google-blue-hover text-primary-foreground rounded-md font-medium text-base shadow-sm transition-all hover:shadow-md"
              >
                Start a meeting now
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Help</a>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 Meet • Made with care
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
