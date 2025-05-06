
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile sidebar toggle button - moved down for better visibility */}
      <div className="lg:hidden fixed left-4 top-16 z-30">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 shadow-md"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      {/* Sidebar - hidden on mobile by default, shown on larger screens */}
      <div
        className={`fixed inset-y-0 left-0 z-20 transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
        style={{ width: "270px" }}
      >
        <Sidebar />
      </div>

      {/* Main content area - use flex-1 to take up remaining space */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile overlay when sidebar is open - semi-transparent for better appearance */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default AppLayout;
