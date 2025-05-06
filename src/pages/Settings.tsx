
import React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Settings = () => {
  // Use a safe default if theme is not available yet
  const { theme, setTheme } = useTheme();
  
  // Handle theme selection with proper nullish checks
  const handleThemeChange = (selectedTheme: string) => {
    if (setTheme) {
      setTheme(selectedTheme);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Customize your experience
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Change how CollegeMate looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => handleThemeChange("light")}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => handleThemeChange("dark")}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => handleThemeChange("system")}
                  >
                    <span className="flex">
                      <Sun className="h-4 w-4" />
                      <Moon className="h-4 w-4 ml-1" />
                    </span>
                    System
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
