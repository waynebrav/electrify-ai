import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const UserNotifications = () => {
  const { data: notifications } = useQuery({
    queryKey: ["user-notifications"],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("*")
        .eq("is_active", true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = (type: string) => {
    switch (type) {
      case "success":
        return "default";
      case "warning":
        return "destructive";
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {notifications.map((notification: Notification) => (
        <Alert key={notification.id} variant={getVariant(notification.type)}>
          {getIcon(notification.type)}
          <AlertTitle className="flex items-center gap-2">
            {notification.title}
            <Badge variant="outline" className="text-xs">
              {notification.type}
            </Badge>
          </AlertTitle>
          <AlertDescription>
            {notification.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default UserNotifications;