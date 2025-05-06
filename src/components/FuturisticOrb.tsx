import React, { useEffect, useRef } from "react";

const FuturisticOrb: React.FC = () => {
  const orbRef = useRef<HTMLDivElement>(null);
  
  // Create connection particles effect
  useEffect(() => {
    if (!orbRef.current) return;
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = 600;
    canvas.height = 600;
    canvas.style.position = "absolute";
    canvas.style.top = "50%";
    canvas.style.left = "50%";
    canvas.style.transform = "translate(-50%, -50%)";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "5";
    
    orbRef.current.appendChild(canvas);
    
    const particles: {x: number, y: number, size: number, speedX: number, speedY: number}[] = [];
    const particlesCount = 30;
    const radius = 150;
    const connectionDistance = 70;
    
    // Create particles around the circle
    for (let i = 0; i < particlesCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius * 0.5 + radius * 0.5;
      particles.push({
        x: Math.cos(angle) * distance + canvas.width / 2,
        y: Math.sin(angle) * distance + canvas.height / 2,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25
      });
    }
    
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections between particles
      ctx.strokeStyle = "rgba(120, 120, 255, 0.2)";
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Draw particles
      ctx.fillStyle = "rgba(130, 180, 255, 0.8)";
      for (const particle of particles) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Keep particles within radius
        const dx = particle.x - canvas.width / 2;
        const dy = particle.y - canvas.height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > radius) {
          const angle = Math.atan2(dy, dx);
          particle.x = Math.cos(angle) * radius + canvas.width / 2;
          particle.y = Math.sin(angle) * radius + canvas.height / 2;
          particle.speedX = -particle.speedX * 0.5;
          particle.speedY = -particle.speedY * 0.5;
        }
      }
      
      requestAnimationFrame(drawParticles);
    };
    
    drawParticles();
    
    return () => {
      if (orbRef.current) {
        orbRef.current.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      {/* Background animated orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute animate-spin-slow-reverse left-[calc(50%-15rem)] top-[calc(50%-15rem)] aspect-square w-[35rem] bg-gradient-to-tr from-primary/10 to-primary/5 opacity-30 rounded-full"></div>
          <div className="absolute animate-spin-slow right-[calc(50%-18rem)] top-[calc(50%-20rem)] aspect-square w-[40rem] bg-gradient-to-tr from-primary/10 to-primary/5 opacity-30 rounded-full"></div>
        </div>
      </div>
      
      {/* Main orb */}
      <div className="relative z-10 group" ref={orbRef}>
        <div className="w-72 h-72 rounded-full bg-gradient-to-r from-primary/30 to-blue-500/20 backdrop-blur-sm flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_50px_5px_rgba(79,70,229,0.3)] hover:scale-105">
          {/* Inner glow effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-blue-400/10 rounded-full animate-pulse-slow"></div>
          
          {/* Orb content - simplified to just the title */}
          <div className="relative z-10 text-center p-6">
            <h2 className="text-4xl font-bold text-white mb-2 tracking-wide">
              CollegeMate
            </h2>
          </div>
        </div>
        
        {/* Outer glow */}
        <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl"></div>
        <div className="absolute -inset-8 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>
    </div>
  );
};

export default FuturisticOrb;
