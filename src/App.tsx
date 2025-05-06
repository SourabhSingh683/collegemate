
import { ThemeProvider } from "next-themes";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthRoute from "@/components/AuthRoute";

import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Channel from "@/pages/Channel";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import Settings from "@/pages/Settings";
import Placement from "@/pages/Placement";

// Reset margins and padding for full-width layout
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark"> {/* Force dark theme */}
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/index"
                element={
                  <AuthRoute>
                    <Index />
                  </AuthRoute>
                }
              />
              <Route
                path="/channel/:channelId"
                element={
                  <AuthRoute>
                    <Channel />
                  </AuthRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <AuthRoute>
                    <Dashboard />
                  </AuthRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <AuthRoute>
                    <Calendar />
                  </AuthRoute>
                }
              />
              <Route
                path="/placement"
                element={
                  <AuthRoute>
                    <Placement />
                  </AuthRoute>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <AuthRoute>
                    <Profile />
                  </AuthRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <AuthRoute>
                    <Profile />
                  </AuthRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <AuthRoute>
                    <Settings />
                  </AuthRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
