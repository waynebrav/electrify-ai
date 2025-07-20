
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, Monitor, Gamepad2, Headphones, Keyboard, Mouse, Speaker } from "lucide-react";

const BuildSetup = () => {
  const [setupType, setSetupType] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSetup, setGeneratedSetup] = useState(null);

  const setupTypes = [
    { id: "gaming", name: "Gaming Setup", icon: Gamepad2, color: "bg-red-500" },
    { id: "productivity", name: "Productivity", icon: Monitor, color: "bg-blue-500" },
    { id: "content-creation", name: "Content Creation", icon: Speaker, color: "bg-purple-500" },
    { id: "entertainment", name: "Entertainment", icon: Speaker, color: "bg-green-500" }
  ];

  const mockSetup = {
    total: 1499,
    items: [
      { name: "Gaming Monitor 27\" 144Hz", price: 399, category: "Display", icon: Monitor },
      { name: "Mechanical Gaming Keyboard", price: 149, category: "Input", icon: Keyboard },
      { name: "RGB Gaming Mouse", price: 79, category: "Input", icon: Mouse },
      { name: "Gaming Headset", price: 199, category: "Audio", icon: Headphones },
      { name: "RGB LED Strip Kit", price: 49, category: "Lighting", icon: Zap },
      { name: "Desk Speakers", price: 299, category: "Audio", icon: Speaker },
      { name: "Webcam 4K", price: 179, category: "Recording", icon: Monitor },
      { name: "Desk Organizer", price: 39, category: "Accessories", icon: Monitor },
    ]
  };

  const handleGenerateSetup = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setGeneratedSetup(mockSetup);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-8 px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
              AI POWERED
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Build My Setup
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Describe what you need, and our AI will build the perfect electronics setup for you
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Tell us about your needs</CardTitle>
                <CardDescription>
                  The more details you provide, the better we can customize your setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Setup Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Setup Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {setupTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSetupType(type.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          setupType === type.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <type.icon className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">{type.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Budget Range</label>
                  <Input
                    type="text"
                    placeholder="e.g., $500-$1500"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Describe your needs</label>
                  <Textarea
                    placeholder="I need a setup for streaming games, with good audio quality and RGB lighting. I have a small desk space..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleGenerateSetup}
                  disabled={!setupType || !budget || !description || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Setup...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate My Setup
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Setup */}
            <Card>
              <CardHeader>
                <CardTitle>Your Recommended Setup</CardTitle>
                <CardDescription>
                  AI-curated electronics based on your requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!generatedSetup ? (
                  <div className="text-center py-12">
                    <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Fill out the form to generate your custom setup</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Total Price */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">Total Setup Cost</span>
                        <span className="text-2xl font-bold text-blue-600">${generatedSetup.total}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Within your budget range
                      </p>
                    </div>

                    <Separator />

                    {/* Items List */}
                    <div className="space-y-3">
                      {generatedSetup.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                {item.category}
                              </Badge>
                            </div>
                          </div>
                          <span className="font-medium">${item.price}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button className="w-full">
                        Add All to Cart
                      </Button>
                      <Button variant="outline" className="w-full">
                        Customize Setup
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Why Use Our AI Setup Builder?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold mb-2">Smart Recommendations</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI analyzes thousands of product combinations to find the perfect match
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Monitor className="h-8 w-8 mx-auto mb-3 text-green-500" />
                  <h3 className="font-semibold mb-2">Budget Optimization</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get the best value for your money with intelligent budget allocation
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Gamepad2 className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                  <h3 className="font-semibold mb-2">Compatibility Guaranteed</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All recommended products work seamlessly together
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BuildSetup;
