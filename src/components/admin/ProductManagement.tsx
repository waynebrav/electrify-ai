import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Zap, 
  Package, 
  TrendingUp,
  Clock
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  is_featured: boolean;
  is_flash_sale: boolean;
  flash_sale_end: string | null;
  status: string;
  created_at: string;
}

const ProductManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    is_featured: false,
    is_flash_sale: false,
    flash_sale_end: "",
    video_url: "",
    model_3d_url: "",
    image_url: "",
    image_url_1: "",
    image_url_2: "",
    image_url_3: "",
    ar_enabled: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        flash_sale_end: formData.is_flash_sale && formData.flash_sale_end 
          ? new Date(formData.flash_sale_end).toISOString() 
          : null,
      };

      const { error } = await supabase
        .from("products")
        .insert(productData);

      if (error) throw error;

      setIsAddProductOpen(false);
      resetForm();
      fetchProducts();
      
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        flash_sale_end: formData.is_flash_sale && formData.flash_sale_end 
          ? new Date(formData.flash_sale_end).toISOString() 
          : null,
      };

      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) throw error;

      setEditingProduct(null);
      resetForm();
      fetchProducts();
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      fetchProducts();
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const toggleFlashSale = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ 
          is_flash_sale: !product.is_flash_sale,
          flash_sale_end: !product.is_flash_sale 
            ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
            : null
        })
        .eq("id", product.id);

      if (error) throw error;

      fetchProducts();
      toast({
        title: "Success",
        description: `Flash sale ${!product.is_flash_sale ? 'enabled' : 'disabled'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle flash sale",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_featured: !product.is_featured })
        .eq("id", product.id);

      if (error) throw error;

      fetchProducts();
      toast({
        title: "Success",
        description: `Product ${!product.is_featured ? 'featured' : 'unfeatured'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle featured status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      is_featured: false,
      is_flash_sale: false,
      flash_sale_end: "",
      video_url: "",
      model_3d_url: "",
      image_url: "",
      image_url_1: "",
      image_url_2: "",
      image_url_3: "",
      ar_enabled: false,
    });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      is_featured: product.is_featured,
      is_flash_sale: product.is_flash_sale,
      flash_sale_end: product.flash_sale_end 
        ? new Date(product.flash_sale_end).toISOString().slice(0, 16) 
        : "",
      video_url: "",
      model_3d_url: "",
      image_url: "",
      image_url_1: "",
      image_url_2: "",
      image_url_3: "",
      ar_enabled: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Add a new product to your inventory</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            <ProductForm 
              formData={formData}
              onInputChange={handleInputChange}
              onSwitchChange={handleSwitchChange}
              onSubmit={handleAddProduct}
              submitText="Add Product"
            />
          </ScrollArea>
        </DialogContent>
        </Dialog>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            <ProductForm 
              formData={formData}
              onInputChange={handleInputChange}
              onSwitchChange={handleSwitchChange}
              onSubmit={handleUpdateProduct}
              submitText="Update Product"
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="flash-sale">Flash Sales</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ProductTable 
            products={products}
            isLoading={isLoading}
            onEdit={openEditDialog}
            onDelete={handleDeleteProduct}
            onToggleFlashSale={toggleFlashSale}
            onToggleFeatured={toggleFeatured}
          />
        </TabsContent>

        <TabsContent value="featured">
          <ProductTable 
            products={products.filter(p => p.is_featured)}
            isLoading={isLoading}
            onEdit={openEditDialog}
            onDelete={handleDeleteProduct}
            onToggleFlashSale={toggleFlashSale}
            onToggleFeatured={toggleFeatured}
          />
        </TabsContent>

        <TabsContent value="flash-sale">
          <ProductTable 
            products={products.filter(p => p.is_flash_sale)}
            isLoading={isLoading}
            onEdit={openEditDialog}
            onDelete={handleDeleteProduct}
            onToggleFlashSale={toggleFlashSale}
            onToggleFeatured={toggleFeatured}
          />
        </TabsContent>

        <TabsContent value="low-stock">
          <ProductTable 
            products={products.filter(p => p.stock_quantity < 10)}
            isLoading={isLoading}
            onEdit={openEditDialog}
            onDelete={handleDeleteProduct}
            onToggleFlashSale={toggleFlashSale}
            onToggleFeatured={toggleFeatured}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Product Form Component
const ProductForm = ({ formData, onInputChange, onSwitchChange, onSubmit, submitText }: {
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSwitchChange: (name: string, checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price (KES)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={onInputChange}
          required
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        name="description"
        value={formData.description}
        onChange={onInputChange}
        rows={3}
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="stock_quantity">Stock Quantity</Label>
      <Input
        id="stock_quantity"
        name="stock_quantity"
        type="number"
        value={formData.stock_quantity}
        onChange={onInputChange}
        required
      />
    </div>

    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="is_featured"
          checked={formData.is_featured}
          onCheckedChange={(checked) => onSwitchChange("is_featured", checked)}
        />
        <Label htmlFor="is_featured">Featured Product</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_flash_sale"
          checked={formData.is_flash_sale}
          onCheckedChange={(checked) => onSwitchChange("is_flash_sale", checked)}
        />
        <Label htmlFor="is_flash_sale">Flash Sale</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="ar_enabled"
          checked={formData.ar_enabled}
          onCheckedChange={(checked) => onSwitchChange("ar_enabled", checked)}
        />
        <Label htmlFor="ar_enabled">AR Enabled</Label>
      </div>
    </div>

    {formData.is_flash_sale && (
      <div className="space-y-2">
        <Label htmlFor="flash_sale_end">Flash Sale End Time</Label>
        <Input
          id="flash_sale_end"
          name="flash_sale_end"
          type="datetime-local"
          value={formData.flash_sale_end}
          onChange={onInputChange}
        />
      </div>
    )}

    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Product Media</h3>
      
      <div className="space-y-2">
        <Label htmlFor="image_url">Primary Image URL</Label>
        <Input
          id="image_url"
          name="image_url"
          type="url"
          value={formData.image_url}
          onChange={onInputChange}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url_1">Product Image 1 URL</Label>
        <Input
          id="image_url_1"
          name="image_url_1"
          type="url"
          value={formData.image_url_1}
          onChange={onInputChange}
          placeholder="https://example.com/image1.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url_2">Product Image 2 URL</Label>
        <Input
          id="image_url_2"
          name="image_url_2"
          type="url"
          value={formData.image_url_2}
          onChange={onInputChange}
          placeholder="https://example.com/image2.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url_3">Product Image 3 URL</Label>
        <Input
          id="image_url_3"
          name="image_url_3"
          type="url"
          value={formData.image_url_3}
          onChange={onInputChange}
          placeholder="https://example.com/image3.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="video_url">Product Video URL</Label>
        <Input
          id="video_url"
          name="video_url"
          type="url"
          value={formData.video_url}
          onChange={onInputChange}
          placeholder="https://example.com/video.mp4"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="model_3d_url">3D Model URL</Label>
        <Input
          id="model_3d_url"
          name="model_3d_url"
          type="url"
          value={formData.model_3d_url}
          onChange={onInputChange}
          placeholder="https://example.com/model.glb"
        />
      </div>
    </div>

    <DialogFooter>
      <Button type="submit">{submitText}</Button>
    </DialogFooter>
  </form>
);

// Product Table Component
const ProductTable = ({ products, isLoading, onEdit, onDelete, onToggleFlashSale, onToggleFeatured }: {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleFlashSale: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
}) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center py-8 text-gray-500">No products found</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {product.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>KES {product.price.toLocaleString()}</TableCell>
              <TableCell>
                <span className={product.stock_quantity < 10 ? "text-red-600" : ""}>
                  {product.stock_quantity}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {product.is_featured && (
                    <Badge variant="secondary">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {product.is_flash_sale && (
                    <Badge variant="destructive">
                      <Zap className="w-3 h-3 mr-1" />
                      Flash Sale
                    </Badge>
                  )}
                  {product.stock_quantity < 10 && (
                    <Badge variant="outline" className="text-orange-600">
                      Low Stock
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleFeatured(product)}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      {product.is_featured ? "Unfeature" : "Feature"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleFlashSale(product)}>
                      <Zap className="h-4 w-4 mr-2" />
                      {product.is_flash_sale ? "Remove from Flash Sale" : "Add to Flash Sale"}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(product.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductManagement;