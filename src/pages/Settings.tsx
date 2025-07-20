import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Palette, Type, Volume2, Bell, Shield, Database,
  ArrowLeft, Monitor, Moon, Sun, Zap, Gamepad2 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  
  // Local state for settings
  const [fontSize, setFontSize] = useState([16]);
  const [fontFamily, setFontFamily] = useState("system");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState([70]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  React.useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Predefined accent colors
  const accentColors = [
    { name: "Blue", value: "rgb(59, 130, 246)", class: "bg-blue-500" },
    { name: "Purple", value: "rgb(139, 92, 246)", class: "bg-purple-500" },
    { name: "Cyan", value: "rgb(34, 211, 238)", class: "bg-cyan-500" },
    { name: "Green", value: "rgb(16, 185, 129)", class: "bg-green-500" },
    { name: "Orange", value: "rgb(249, 115, 22)", class: "bg-orange-500" },
    { name: "Pink", value: "rgb(236, 72, 153)", class: "bg-pink-500" },
    { name: "Red", value: "rgb(239, 68, 68)", class: "bg-red-500" },
    { name: "Yellow", value: "rgb(245, 158, 11)", class: "bg-yellow-500" },
  ];

  // Font families
  const fontFamilies = [
    { name: "System Default", value: "system" },
    { name: "Inter", value: "Inter" },
    { name: "Roboto", value: "Roboto" },
    { name: "Open Sans", value: "Open Sans" },
    { name: "Poppins", value: "Poppins" },
    { name: "Playfair Display", value: "Playfair Display" },
    { name: "Merriweather", value: "Merriweather" },
  ];

  const handleFontChange = (value: string) => {
    setFontFamily(value);
    if (value === "system") {
      document.documentElement.style.removeProperty("font-family");
    } else {
      document.documentElement.style.setProperty("font-family", `'${value}', sans-serif`);
    }
  };

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value);
    document.documentElement.style.setProperty("font-size", `${value[0]}px`);
  };

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case "light": return <Sun className="h-4 w-4" />;
      case "dark": return <Moon className="h-4 w-4" />;
      case "future": return <Zap className="h-4 w-4" />;
      case "cyberpunk": return <Gamepad2 className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Customize your experience and manage your preferences
            </p>
          </div>

          <Tabs defaultValue="appearance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Accessibility
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>
                    Choose your preferred theme for the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {["system", "light", "dark", "future", "cyberpunk"].map((themeName) => (
                      <Button
                        key={themeName}
                        variant={theme === themeName ? "default" : "outline"}
                        className="flex flex-col items-center gap-2 h-20"
                        onClick={() => setTheme(themeName as any)}
                      >
                        {getThemeIcon(themeName)}
                        <span className="text-xs capitalize">{themeName}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accent Color</CardTitle>
                  <CardDescription>
                    Choose your preferred accent color
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {accentColors.map((color) => (
                      <Button
                        key={color.value}
                        variant="outline"
                        className={`h-12 w-12 p-0 border-2 ${
                          accentColor === color.value ? 'border-foreground' : 'border-border'
                        }`}
                        onClick={() => setAccentColor(color.value)}
                      >
                        <div className={`h-8 w-8 rounded ${color.class}`} />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accessibility" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Typography</CardTitle>
                  <CardDescription>
                    Adjust font settings for better readability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select value={fontFamily} onValueChange={handleFontChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select font family" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size: {fontSize[0]}px</Label>
                    <Slider
                      id="font-size"
                      min={12}
                      max={24}
                      step={1}
                      value={fontSize}
                      onValueChange={handleFontSizeChange}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sound</CardTitle>
                  <CardDescription>
                    Configure audio settings and feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sound-enabled">Enable Sound Effects</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sounds for interactions and notifications
                      </p>
                    </div>
                    <Switch
                      id="sound-enabled"
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>

                  {soundEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="sound-volume">
                        <Volume2 className="h-4 w-4 inline mr-2" />
                        Volume: {soundVolume[0]}%
                      </Label>
                      <Slider
                        id="sound-volume"
                        min={0}
                        max={100}
                        step={5}
                        value={soundVolume}
                        onValueChange={setSoundVolume}
                        className="w-full"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about orders and updates
                      </p>
                    </div>
                    <Switch
                      id="notifications-enabled"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified via email about important updates
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      disabled={!notificationsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive browser notifications
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                      disabled={!notificationsEnabled}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data & Privacy</CardTitle>
                  <CardDescription>
                    Control how your data is collected and used
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-collection">
                        <Database className="h-4 w-4 inline mr-2" />
                        Data Collection
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow collection of usage data to improve experience
                      </p>
                    </div>
                    <Switch
                      id="data-collection"
                      checked={dataCollection}
                      onCheckedChange={setDataCollection}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="analytics">Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help us understand how you use the app
                      </p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={analytics}
                      onCheckedChange={setAnalytics}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Data Management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start">
                        Download My Data
                      </Button>
                      <Button variant="outline" className="justify-start">
                        Clear Cache
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 pt-8 border-t">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Settings are saved automatically
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;