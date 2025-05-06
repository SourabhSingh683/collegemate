
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "login";
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };

    checkSession();
  }, [navigate]);

  // Handle login submission
  const onLoginSubmit = async (values: { email: string; password: string }) => {
    console.log("Login form submitted with values:", values);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });

      if (error) {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
      } else if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup submission
  const onSignupSubmit = async (values: { 
    email: string; 
    password: string; 
    username: string; 
    fullName: string 
  }) => {
    console.log("Signup form submitted with values:", { ...values, password: '******' });
    setIsLoading(true);
    
    try {
      // 1. Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
            full_name: values.fullName,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      console.log("Signup successful - auth data:", authData);
      
      if (!authData.user) {
        throw new Error("User creation failed");
      }
      
      // 2. Manually create profile if needed
      // Check if profile already exists (in case the trigger didn't work)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();
        
      if (!existingProfile) {
        console.log("Creating profile for user:", authData.user.id);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: authData.user.id,
            username: values.username,
            full_name: values.fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
          
        if (profileError) {
          console.error("Error creating profile:", profileError);
          throw profileError;
        }
      }
      
      // 3. Show success message and redirect
      toast({
        title: "Account created successfully!",
        description: authData.session 
          ? "You are now logged in."
          : "Please check your email to verify your account.",
      });
      
      if (authData.session) {
        navigate("/dashboard");
      } else {
        // If email confirmation is required, redirect to login
        navigate("/auth");
      }
      
    } catch (error: any) {
      console.error("Signup error:", error);
      
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 flex flex-col">
      <header className="container mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80">
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-background border border-primary rounded-md w-10 h-10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
                <img 
                  src="/lovable-uploads/c5ef23be-0e2f-4e1d-9857-866f6ab9f462.png" 
                  alt="CM Logo" 
                  className="w-8 h-8 object-contain" 
                />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {view === "login" ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription className="text-center">
              {view === "login" 
                ? "Enter your credentials to access your account" 
                : "Sign up to join the community and connect with your peers"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {view === "login" ? (
              <LoginForm onSubmit={onLoginSubmit} isLoading={isLoading} />
            ) : (
              <SignupForm onSubmit={onSignupSubmit} isLoading={isLoading} />
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              {view === "login" ? (
                <>
                  Don't have an account?{" "}
                  <Link to="/auth?view=signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link to="/auth" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
