import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SystemSettings {
  site_name: string;
  site_email: string;
  default_currency: string;
  tax_rate: number;
  free_shipping_threshold: number;
  enable_guest_checkout: boolean;
  enable_reviews: boolean;
  enable_wishlist: boolean;
  max_cart_items: number;
  enable_inventory_tracking: boolean;
}

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("key, value, type");

      if (error) throw error;

      // Default values
      const defaultSettings: SystemSettings = {
        site_name: "Electrify",
        site_email: "support@electrify.com",
        default_currency: "KES",
        tax_rate: 16,
        free_shipping_threshold: 5000,
        enable_guest_checkout: true,
        enable_reviews: true,
        enable_wishlist: true,
        max_cart_items: 50,
        enable_inventory_tracking: true,
      };

      // Override with database values
      const settings = { ...defaultSettings };
      data?.forEach(setting => {
        if (setting.type === 'boolean') {
          (settings as any)[setting.key] = setting.value === 'true';
        } else if (setting.type === 'number') {
          (settings as any)[setting.key] = Number(setting.value);
        } else {
          (settings as any)[setting.key] = setting.value;
        }
      });

      return settings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};