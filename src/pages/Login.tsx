
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, ArrowLeft, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { user, signIn, signInWithGoogle, signInWithGithub } = useAuth();
  const navigate = useNavigate();
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading('google');
    try {
      await signInWithGoogle?.();
    } catch (error: any) {
      toast({
        title: 'Google sign-in failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGithubSignIn = async () => {
    setOauthLoading('github');
    try {
      await signInWithGithub?.();
    } catch (error: any) {
      toast({
        title: 'GitHub sign-in failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg relative">
          {/* Close button in top-right corner */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Back button */}
          <button
            onClick={handleGoBack}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="text-center pt-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome back to Electrify</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-electrify-600 hover:text-electrify-500">
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="flex flex-col gap-3 mt-4">
            <Button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              onClick={handleGoogleSignIn}
              disabled={oauthLoading === 'google'}
            >
              <svg className="h-5 w-5" viewBox="0 0 48 48"><g><path d="M44.5 20H24v8.5h11.7C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.3 2.7l6.2-6.2C34.2 4.5 29.3 2.5 24 2.5 12.7 2.5 3.5 11.7 3.5 23S12.7 43.5 24 43.5c10.5 0 20-8.5 20-20 0-1.3-.1-2.7-.3-4z" fill="#FFC107"/><path d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c3.1 0 6 .9 8.3 2.7l6.2-6.2C34.2 4.5 29.3 2.5 24 2.5c-7.2 0-13 5.8-13 13 0 2.2.5 4.3 1.3 6.2z" fill="#FF3D00"/><path d="M24 43.5c5.8 0 10.7-1.9 14.3-5.2l-6.6-5.4C29.9 34.9 27.1 36 24 36c-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C7.1 40.2 14.9 43.5 24 43.5z" fill="#4CAF50"/><path d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2.1l-7 5.4C17.5 41.1 20.6 43.5 24 43.5c10.5 0 20-8.5 20-20 0-1.3-.1-2.7-.3-4z" fill="#1976D2"/></g></svg>
              {oauthLoading === 'google' ? 'Signing in with Google...' : 'Sign in with Google'}
            </Button>
            <Button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800"
              onClick={handleGithubSignIn}
              disabled={oauthLoading === 'github'}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .267.18.577.688.479C19.138 20.2 22 16.448 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
              {oauthLoading === 'github' ? 'Signing in with GitHub...' : 'Sign in with GitHub'}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-electrify-600 hover:text-electrify-500">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
