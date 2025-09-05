
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, User, LogOut, Settings, Package, Home, MonitorSmartphone, Search, BarChart3 } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { CartBadge } from "./CartBadge";
import CurrencySelector from "./CurrencySelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedSearch = searchTerm.trim();
      navigate(`/products?q=${encodeURIComponent(trimmedSearch)}`);
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-card shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-electrify-600 dark:text-electrify-400">
              Electrify
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="mx-4 relative w-64">
              <Input 
                type="text" 
                placeholder="Search products..." 
                className="pl-10 pr-4 py-1 w-full bg-gray-100 dark:bg-gray-800" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
            </div>
            
            <div className="space-x-4 flex items-center">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-electrify-600 dark:hover:text-electrify-400 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link to="/products" className="text-gray-700 dark:text-gray-300 hover:text-electrify-600 dark:hover:text-electrify-400 px-3 py-2 text-sm font-medium">
                Products
              </Link>
              <Link to="/ar-room" className="text-gray-700 dark:text-gray-300 hover:text-electrify-600 dark:hover:text-electrify-400 px-3 py-2 text-sm font-medium">
                AR Room
              </Link>
              
              <CurrencySelector />
              <ThemeToggle />
              <CartBadge />
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <User className="h-4 w-4" />
                      My Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>
                      <Link 
                        to="/dashboard" 
                        className="flex items-center gap-2 w-full"
                      >
                        <BarChart3 className="h-4 w-4" /> 
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-2 w-full"
                      >
                        <Settings className="h-4 w-4" /> 
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link 
                        to="/orders" 
                        className="flex items-center gap-2 w-full"
                      >
                        <Package className="h-4 w-4" /> 
                        Order History
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" /> 
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex space-x-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <CurrencySelector />
            <ThemeToggle />
            <CartBadge />
            
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="my-3 px-3 relative">
              <Input 
                type="text" 
                placeholder="Search products..." 
                className="pl-10 pr-4 py-1 w-full bg-gray-100 dark:bg-gray-800" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
              <Search className="h-4 w-4 absolute left-6 top-[1.35rem] text-gray-400" />
            </div>
            
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              <Home className="h-4 w-4 inline mr-2" />
              Home
            </Link>
            <Link to="/products" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              <Package className="h-4 w-4 inline mr-2" />
              Products
            </Link>
            <Link to="/ar-room" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              <MonitorSmartphone className="h-4 w-4 inline mr-2" />
              AR Room
            </Link>
            
            {user ? (
              <>
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="px-3">
                    <p className="text-base font-medium text-gray-800 dark:text-gray-200">My Account</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                   <div className="mt-3 space-y-1">
                     <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                       <BarChart3 className="h-4 w-4 inline mr-2" />
                       Dashboard
                     </Link>
                     <Link to="/profile" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                       <Settings className="h-4 w-4 inline mr-2" />
                       Profile Settings
                     </Link>
                     <Link to="/orders" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                       <Package className="h-4 w-4 inline mr-2" />
                       Order History
                     </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block px-3 py-2 text-base font-medium text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2 px-3">
                  <Button asChild className="w-full">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
