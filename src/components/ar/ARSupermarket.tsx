import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  position: [number, number, number];
  color: string;
}

// Sample products for different shelves/categories
const SUPERMARKET_PRODUCTS: Product[] = [
  // Electronics Shelf
  { id: '1', name: 'Smartphone', price: 25000, currency: 'KES', category: 'Electronics', position: [-4, 1, 0], color: '#3b82f6' },
  { id: '2', name: 'Laptop', price: 75000, currency: 'KES', category: 'Electronics', position: [-4, 1.5, 0], color: '#3b82f6' },
  { id: '3', name: 'Headphones', price: 8000, currency: 'KES', category: 'Electronics', position: [-4, 0.5, 0], color: '#3b82f6' },
  
  // Home Appliances Shelf
  { id: '4', name: 'Microwave', price: 15000, currency: 'KES', category: 'Home Appliances', position: [0, 1, 0], color: '#10b981' },
  { id: '5', name: 'Blender', price: 5000, currency: 'KES', category: 'Home Appliances', position: [0, 1.5, 0], color: '#10b981' },
  { id: '6', name: 'Toaster', price: 3500, currency: 'KES', category: 'Home Appliances', position: [0, 0.5, 0], color: '#10b981' },
  
  // Gaming Shelf
  { id: '7', name: 'Gaming Console', price: 45000, currency: 'KES', category: 'Gaming', position: [4, 1, 0], color: '#8b5cf6' },
  { id: '8', name: 'Controller', price: 6000, currency: 'KES', category: 'Gaming', position: [4, 1.5, 0], color: '#8b5cf6' },
  { id: '9', name: 'Gaming Chair', price: 25000, currency: 'KES', category: 'Gaming', position: [4, 0.5, 0], color: '#8b5cf6' },
];

interface ProductMeshProps {
  product: Product;
  onClick: (product: Product) => void;
  isSelected: boolean;
}

const ProductMesh: React.FC<ProductMeshProps> = ({ product, onClick, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = hovered ? Math.sin(state.clock.elapsedTime * 2) * 0.1 : 0;
      meshRef.current.scale.setScalar(hovered || isSelected ? 1.1 : 1);
    }
  });

  return (
    <group position={product.position}>
      <Box
        ref={meshRef}
        args={[0.5, 0.5, 0.5]}
        onClick={() => onClick(product)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={product.color} 
          transparent 
          opacity={hovered || isSelected ? 0.8 : 0.6}
          emissive={hovered || isSelected ? product.color : '#000000'}
          emissiveIntensity={hovered || isSelected ? 0.1 : 0}
        />
      </Box>
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {product.name}
      </Text>
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.12}
        color="#ffeb3b"
        anchorX="center"
        anchorY="middle"
      >
        KSh {product.price.toLocaleString()}
      </Text>
    </group>
  );
};

const Floor: React.FC = () => {
  return (
    <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <meshStandardMaterial color="#2a2a2a" />
    </Plane>
  );
};

const Shelf: React.FC<{ position: [number, number, number]; category: string; color: string }> = ({ 
  position, 
  category, 
  color 
}) => {
  return (
    <group position={position}>
      {/* Shelf base */}
      <Box args={[2, 0.1, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      {/* Shelf back */}
      <Box args={[2, 2, 0.1]} position={[0, 1, -0.5]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      {/* Category label */}
      <Text
        position={[0, 2.2, -0.4]}
        fontSize={0.2}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {category}
      </Text>
    </group>
  );
};

const CameraController: React.FC = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 3, 8);
  }, [camera]);
  
  return null;
};

interface ARSupermarketProps {
  onAddToCart: (productId: string, productName: string) => void;
}

const ARSupermarket: React.FC<ARSupermarketProps> = ({ onAddToCart }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
    
    onAddToCart(product.id, product.name);
    
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = SUPERMARKET_PRODUCTS.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  return (
    <div className="w-full h-full relative">
      {/* 3D Scene */}
      <Canvas style={{ height: '70vh' }}>
        <CameraController />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, 10, -10]} intensity={0.5} />
        
        {/* Environment */}
        <Floor />
        
        {/* Shelves */}
        <Shelf position={[-4, 0, 0]} category="Electronics" color="#3b82f6" />
        <Shelf position={[0, 0, 0]} category="Home Appliances" color="#10b981" />
        <Shelf position={[4, 0, 0]} category="Gaming" color="#8b5cf6" />
        
        {/* Products */}
        {SUPERMARKET_PRODUCTS.map(product => (
          <ProductMesh
            key={product.id}
            product={product}
            onClick={handleProductClick}
            isSelected={selectedProduct?.id === product.id}
          />
        ))}
        
        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-black/80 rounded-lg p-4 text-white max-w-xs">
        <h3 className="font-bold mb-2">AR Supermarket</h3>
        <p className="text-sm mb-4">
          Navigate with mouse. Click on products to select them, then add to cart.
        </p>
        
        {/* Cart Summary */}
        <div className="bg-white/10 rounded p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart ({getCartItemCount()})
            </span>
            <CurrencyDisplay amount={getCartTotal()} className="font-bold" />
          </div>
          
          {Object.entries(cart).map(([productId, quantity]) => {
            const product = SUPERMARKET_PRODUCTS.find(p => p.id === productId);
            if (!product) return null;
            
            return (
              <div key={productId} className="text-xs flex justify-between py-1">
                <span>{product.name} x{quantity}</span>
                <CurrencyDisplay amount={product.price * quantity} />
              </div>
            );
          })}
        </div>
        
        {/* Controls */}
        <div className="text-xs space-y-1">
          <p><strong>Mouse:</strong> Look around</p>
          <p><strong>Scroll:</strong> Zoom in/out</p>
          <p><strong>Drag:</strong> Pan view</p>
          <p><strong>Click:</strong> Select product</p>
        </div>
      </div>
      
      {/* Product Details Panel */}
      {selectedProduct && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
              <Badge variant="outline" className="mt-1">
                {selectedProduct.category}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProduct(null)}
            >
              ×
            </Button>
          </div>
          
          <div className="mb-4">
            <div className="text-2xl font-bold mb-2">
              <CurrencyDisplay amount={selectedProduct.price} fromCurrency={selectedProduct.currency} />
            </div>
            <p className="text-sm text-muted-foreground">
              Located in the {selectedProduct.category} section
            </p>
          </div>
          
          <Button 
            onClick={() => handleAddToCart(selectedProduct)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          
          {cart[selectedProduct.id] && (
            <p className="text-sm text-center mt-2 text-muted-foreground">
              {cart[selectedProduct.id]} in cart
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ARSupermarket;