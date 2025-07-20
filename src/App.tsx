
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Index from "./pages/Index";
import Category from "./pages/Category";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ChatBot from "./components/ChatBot";
import NeuralShopping from "./components/NeuralShopping";
import UserAnalytics from "./pages/UserAnalytics";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import UserProfile from "./pages/UserProfile";
import OrderHistory from "./pages/OrderHistory";
import AugmentedViewingRoom from "./pages/AugmentedViewingRoom";
import UserPreferencesSurvey from "./components/UserPreferencesSurvey";
import BuildSetup from "./pages/BuildSetup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { useAuth } from "@/context/AuthContext";
import React from 'react';
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PreferencesSurveyHandler = () => {
  const { isFirstLogin, user } = useAuth();
  
  // Don't show the survey for admin users or if admin is in session
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";
  
  // Only show survey for authenticated users who are not admins and it's their first login
  if (isFirstLogin && user && !isAdmin) {
    return <UserPreferencesSurvey />;
  }
  
  return null;
};

const ConditionalComponents = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <>
      <ChatBot />
      {!isAdminRoute && <NeuralShopping />}
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <PreferencesSurveyHandler />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/products" element={<Products />} />
                <Route path="/category/:slug" element={<Category />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/analytics" element={<UserAnalytics />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/ar-room" element={<AugmentedViewingRoom />} />
                <Route path="/build-setup" element={<BuildSetup />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ConditionalComponents />
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
