import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Code, MessageSquare, Shield, Users } from "lucide-react";
import FuturisticOrb from "@/components/FuturisticOrb";

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#050810] to-[#111827] overflow-hidden">
      <header className="w-full px-4 py-4 md:py-8 flex items-center justify-between relative z-20 bg-background/5 backdrop-blur-sm border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 z-20">
          <div className="w-8 h-8 flex items-center justify-center">
            <img 
              src="/lovable-uploads/c5ef23be-0e2f-4e1d-9857-866f6ab9f462.png" 
              alt="CollegeMate Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-semibold text-lg hidden sm:inline">CollegeMate</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/auth" className="text-sm font-medium hover:text-primary transition-colors">
            Login
          </Link>
          <Link to="/auth?view=signup">
            <Button size="sm" className="btn-animate whitespace-nowrap">Sign Up</Button>
          </Link>
        </div>
      </header>

      <section className="relative min-h-[85vh] sm:min-h-[75vh] flex items-center w-full py-8 sm:py-0">
        <div className="w-full px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
                <div className="relative">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    Connect, Collaborate, <span className="text-primary">Succeed</span> Together
                  </h1>
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-xl -z-10"></div>
                </div>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  The all-in-one platform that helps college students connect with peers,
                  share knowledge, and collaborate on projects. Build your network and excel in your studies.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center lg:justify-start">
                  <Link to="/auth?view=signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto group btn-animate">
                      Get Started 
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto btn-animate">
                      Already a member? Sign in
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="fade-in delay-300 hidden sm:block">
                <div className="relative h-full min-h-[300px] sm:min-h-[450px]">
                  <FuturisticOrb />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-12 md:py-24 relative z-10 bg-[#070b14]/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16 fade-in delay-300">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              CollegeMate provides powerful tools designed specifically for college students to connect, learn, and grow together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <FeatureCard 
              icon={<MessageSquare />}
              title="Topic-Based Channels"
              description="Join specialized channels for subjects like DSA, Competitive Programming, and more for focused discussions."
              delay={0.1}
            />
            <FeatureCard 
              icon={<BookOpen />}
              title="Resource Sharing"
              description="Easily share and access notes, assignments, and study materials organized by subject and topic."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Users />}
              title="Connect with Peers"
              description="Build relationships with seniors, juniors, and classmates to expand your network and find mentors."
              delay={0.3}
            />
            <FeatureCard 
              icon={<Code />}
              title="Coding Discussions"
              description="Get help with coding problems, share solutions, and improve your programming skills."
              delay={0.4}
            />
            <FeatureCard 
              icon={<Shield />}
              title="Verified Community"
              description="Join a verified college community where you can trust the information shared."
              delay={0.5}
            />
            <FeatureCard 
              icon={<ArrowRight />}
              title="And Much More"
              description="Custom threads, announcements, events, and many more features to enhance your college experience."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-12 md:py-16 relative z-10 fade-in bg-[#050810]" style={{animationDelay: "0.5s"}}>
        <div className="max-w-5xl mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-8 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>
          <div className="text-center space-y-4 relative z-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Ready to transform your college experience?</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Join thousands of students who are already using CollegeMate to excel in their academic journey.
            </p>
            <div className="pt-4">
              <Link to="/auth?view=signup">
                <Button size="lg" className="w-full sm:w-auto btn-animate">
                  Get Started For Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full px-4 py-6 md:py-8 border-t border-white/10 relative z-10 bg-[#050810]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <img 
                src="/lovable-uploads/c5ef23be-0e2f-4e1d-9857-866f6ab9f462.png" 
                alt="CollegeMate Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-medium">CollegeMate</span>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            © 2025 Sumant Sahu. MIT Licensed.
          </div>
          <div className="text-sm text-muted-foreground">
            Made with ❤️ by Sumant & Sourabh
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  return (
    <div 
      className="bg-card/50 backdrop-blur-md border border-white/5 rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary/30 group btn-animate fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;
