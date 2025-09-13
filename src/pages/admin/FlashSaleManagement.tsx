import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, MoreHorizontal, Zap, Clock, TrendingUp, X } from "lucide-react";
import { format } from "date-fns";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  image_url_1: string | null;
  is_flash_sale: boolean;
  flash_sale_end: string | null;
  stock_quantity: number;
  status: string;
}

const FlashSaleManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [flashSaleEnd, setFlashSaleEnd] = useState("");

  // Fetch all products
  const { data: allProducts } = useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, original_price, image_url, image_url_1, is_flash_sale, flash_sale_end, stock_quantity, status")
        .eq("status", "Active")
        .order("name");

      if (error) throw error;
      return data as Product[];
    },
  });

  // Fetch current flash sale products
  const { data: flashSaleProducts, isLoading } = useQuery({
    queryKey: ["flash-sale-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, original_price, image_url, image_url_1, is_flash_sale, flash_sale_end, stock_quantity, status")
        .eq("is_flash_sale", true)
        .order("flash_sale_end", { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
  });

  // Add products to flash sale
  const addToFlashSaleMutation = useMutation({
    mutationFn: async ({ productIds, endDate }: { productIds: string[]; endDate: string }) => {
      const { error } = await supabase
        .from("products")
        .update({
          is_flash_sale: true,
          flash_sale_end: endDate,
        })
        .in("id", productIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flash-sale-products"] });
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      setShowAddDialog(false);
      setSelectedProducts([]);
      setFlashSaleEnd("");
      toast({ title: "Success", description: "Products added to flash sale" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Remove from flash sale
  const removeFromFlashSaleMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("products")
        .update({
          is_flash_sale: false,
          flash_sale_end: null,
        })
        .eq("id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flash-sale-products"] });
      queryClient.invalidateQueries({ queryKey: ["all-products"] });
      toast({ title: "Success", description: "Product removed from flash sale" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update flash sale end date
  const updateEndDateMutation = useMutation({
    mutationFn: async ({ productId, endDate }: { productId: string; endDate: string }) => {
      const { error } = await supabase
        .from("products")
        .update({ flash_sale_end: endDate })
        .eq("id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flash-sale-products"] });
      toast({ title: "Success", description: "Flash sale end date updated" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAddToFlashSale = () => {
    if (selectedProducts.length === 0 || !flashSaleEnd) {
      toast({ title: "Error", description: "Please select products and set end date", variant: "destructive" });
      return;
    }

    addToFlashSaleMutation.mutate({
      productIds: selectedProducts,
      endDate: new Date(flashSaleEnd).toISOString(),
    });
  };

  const getStatusBadge = (product: Product) => {
    if (!product.flash_sale_end) return <Badge variant="secondary">No End Date</Badge>;
    
    const endDate = new Date(product.flash_sale_end);
    const now = new Date();
    
    if (endDate < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    const hoursLeft = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursLeft < 24) {
      return <Badge variant="destructive">Ending Soon</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  const availableProducts = allProducts?.filter(p => !p.is_flash_sale) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-red-500" />
            Flash Sale Management
          </h1>
          <p className="text-muted-foreground">Manage flash sale products and timers</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Products to Flash Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Products to Flash Sale</DialogTitle>
              <DialogDescription>
                Select products and set the flash sale end date
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="end-date">Flash Sale End Date & Time*</Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={flashSaleEnd}
                  onChange={(e) => setFlashSaleEnd(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Select Products ({selectedProducts.length} selected)</Label>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedProducts.includes(product.id)
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => {
                          setSelectedProducts(prev =>
                            prev.includes(product.id)
                              ? prev.filter(id => id !== product.id)
                              : [...prev, product.id]
                          );
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => {}}
                          className="rounded"
                        />
                        <img
                          src={product.image_url || product.image_url_1 || "/placeholder.svg"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground">KES {product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {availableProducts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No products available for flash sale
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddToFlashSale}
                disabled={selectedProducts.length === 0 || !flashSaleEnd}
              >
                Add to Flash Sale
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flash Sales</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flashSaleProducts?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flashSaleProducts?.filter(p => {
                if (!p.flash_sale_end) return false;
                const hoursLeft = (new Date(p.flash_sale_end).getTime() - new Date().getTime()) / (1000 * 60 * 60);
                return hoursLeft < 24 && hoursLeft > 0;
              }).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Products</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableProducts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Flash Sale Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Flash Sale Products</CardTitle>
          <CardDescription>Manage products currently in flash sale</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flashSaleProducts?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image_url || product.image_url_1 || "/placeholder.svg"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">KES {product.price}</p>
                      {product.original_price && (
                        <p className="text-sm text-muted-foreground line-through">
                          KES {product.original_price}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.flash_sale_end
                      ? format(new Date(product.flash_sale_end), "MMM dd, yyyy HH:mm")
                      : "No end date"}
                  </TableCell>
                  <TableCell>{getStatusBadge(product)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          const newEndDate = prompt(
                            "Enter new end date (YYYY-MM-DDTHH:MM format):",
                            product.flash_sale_end ? new Date(product.flash_sale_end).toISOString().slice(0, 16) : ""
                          );
                          if (newEndDate) {
                            updateEndDateMutation.mutate({
                              productId: product.id,
                              endDate: new Date(newEndDate).toISOString(),
                            });
                          }
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Update End Date
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => removeFromFlashSaleMutation.mutate(product.id)}
                          className="text-red-600"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove from Flash Sale
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No flash sale products found. Add some products to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlashSaleManagement;