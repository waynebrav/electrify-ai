import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";

interface PayPalConfig {
  id: string;
  name: string;
  client_id: string;
  environment: string;
  is_active: boolean;
  created_at: string;
}

const PayPalManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    environment: 'sandbox',
    is_active: false
  });

  // Load PayPal configurations
  const { data: configurations = [], isLoading } = useQuery({
    queryKey: ['paypal-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paypal_configurations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Create new configuration
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('paypal_configurations')
        .insert([{
          ...data,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paypal-configurations'] });
      setIsAddingNew(false);
      resetForm();
      toast({
        title: "Success",
        description: "PayPal configuration created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create configuration",
        variant: "destructive",
      });
    }
  });

  // Update configuration
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from('paypal_configurations')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paypal-configurations'] });
      setEditingId(null);
      resetForm();
      toast({
        title: "Success",
        description: "PayPal configuration updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
    }
  });

  // Delete configuration
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('paypal_configurations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paypal-configurations'] });
      toast({
        title: "Success",
        description: "PayPal configuration deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete configuration",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      client_id: '',
      environment: 'sandbox',
      is_active: false
    });
  };

  const handleEdit = (config: PayPalConfig) => {
    setFormData({
      name: config.name,
      client_id: config.client_id,
      environment: config.environment,
      is_active: config.is_active
    });
    setEditingId(config.id);
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    resetForm();
  };

  const toggleActive = (config: PayPalConfig) => {
    updateMutation.mutate({
      id: config.id,
      data: { is_active: !config.is_active }
    });
  };

  if (isLoading) {
    return <div>Loading PayPal configurations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">PayPal Management</h1>
        <Button onClick={() => setIsAddingNew(true)} disabled={isAddingNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Configuration
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PayPal Integration</CardTitle>
          <CardDescription>
            Manage PayPal payment configurations. You need PayPal Client ID and Client Secret for each environment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Required Credentials:</strong>
              <br />• PayPal Client ID (public - stored in database)
              <br />• PayPal Client Secret (private - stored in Supabase secrets)
              <br />• Environment (sandbox for testing, production for live)
            </p>
          </div>

          {(isAddingNew || editingId) && (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Configuration Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Main PayPal Account"
                    />
                  </div>
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select
                      value={formData.environment}
                      onValueChange={(value) => 
                        setFormData({ ...formData, environment: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                        <SelectItem value="production">Production (Live)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="client_id">PayPal Client ID</Label>
                    <Input
                      id="client_id"
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      placeholder="PayPal Client ID"
                    />
                  </div>
                  <div className="col-span-2 flex items-center space-x-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label>Set as active configuration</Label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={!formData.name || !formData.client_id}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {configurations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No PayPal configurations found. Add one to get started.
              </p>
            ) : (
              configurations.map((config) => (
                <Card key={config.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{config.name}</h3>
                          <Badge variant={config.environment === 'production' ? 'default' : 'secondary'}>
                            {config.environment}
                          </Badge>
                          <Badge variant={config.is_active ? 'default' : 'outline'}>
                            {config.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Client ID: {config.client_id.substring(0, 20)}...
                        </p>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(config.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(config)}
                        >
                          {config.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(config)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(config.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayPalManagement;