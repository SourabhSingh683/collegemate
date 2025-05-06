
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FuturisticHero = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative overflow-hidden bg-[#050709] pt-16 md:pt-20 lg:pt-24 min-h-[80vh] flex flex-col justify-center">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Animated Orb */}
          <div 
            className="mx-auto relative mb-8"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Main orb */}
            <motion.div 
              className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-900/20 mx-auto relative flex items-center justify-center"
              animate={{
                scale: isHovered ? 1.1 : 1,
                boxShadow: isHovered 
                  ? "0 0 40px 5px rgba(79, 70, 229, 0.4)" 
                  : "0 0 20px 2px rgba(79, 70, 229, 0.2)"
              }}
              transition={{ duration: 0.5 }}
            >
              {/* CollegeMate text centered in orb */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    opacity: [0.8, 1, 0.8],
                    scale: isHovered ? 1.1 : 1,
                  }}
                  transition={{ 
                    opacity: { 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse" 
                    },
                    scale: { duration: 0.5 }
                  }}
                >
                  <img 
                    src="/lovable-uploads/119b5b87-1328-446c-8d9f-9f2c0ff54adb.png" 
                    alt="CM" 
                    className="h-12 w-12 object-contain"
                  />
                </motion.div>
              </div>
              
              {/* Inner rotating ring */}
              <div className="absolute w-full h-full rounded-full border border-blue-500/20 animate-spin-slow opacity-70" />
              
              {/* Networking dots - animated particles around orb */}
              {[...Array(12)].map((_, index) => (
                <motion.div
                  key={index}
                  className="absolute rounded-full bg-primary"
                  style={{
                    width: Math.random() * 5 + 2,
                    height: Math.random() * 5 + 2,
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 0,
                  }}
                  animate={{
                    x: [0, (Math.random() - 0.5) * 300],
                    y: [0, (Math.random() - 0.5) * 300],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: Math.random() * 4 + 6,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                  }}
                />
              ))}
              
              {/* Connection lines */}
              {isHovered && (
                [...Array(8)].map((_, i) => (
                  <motion.div
                    key={`line-${i}`}
                    className="absolute h-0.5 origin-center bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                    initial={{ 
                      width: "10%", 
                      rotate: i * 45, 
                      opacity: 0 
                    }}
                    animate={{ 
                      width: ["10%", "80%", "10%"],
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      delay: i * 0.4
                    }}
                  />
                ))
              )}
            </motion.div>
            
            {/* Outer glow effect */}
            <motion.div 
              className="absolute inset-0 rounded-full bg-primary opacity-5 blur-2xl"
              animate={{
                scale: isHovered ? 1.3 : 1,
              }}
              transition={{ duration: 1 }}
            />
          </div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl mb-12">
            CollegeMate
          </h1>
          
          {/* Button */}
          <div className="mx-auto max-w-md sm:flex sm:justify-center md:mt-10">
            <Button 
              size="lg" 
              asChild 
              className="btn-animate shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary-light"
            >
              <Link to="/auth">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Gradient background */}
        <div 
          className="absolute top-[-10%] left-[-10%] right-[-10%] bottom-[-10%] bg-[radial-gradient(circle_at_center,rgba(37,38,44,0.8)_0%,rgba(5,7,9,1)_70%)]"
        />
        
        {/* Grid pattern */}
        <motion.div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          animate={{
            y: [0, 20],
            x: [0, -10]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
    </div>
  );
};

export default FuturisticHero;
