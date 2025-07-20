
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="container">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-9xl font-extrabold text-electrify-500 mb-4">404</h1>
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <p className="text-gray-500 mb-8">
              We couldn't find the page you're looking for. The link might be incorrect or the page may have been removed.
            </p>
            <div className="flex justify-center space-x-4">
              <Button asChild>
                <Link to="/">Back to Home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/products">Shop Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
