
import React from 'react';
import { Button } from "@/components/ui/button";
import { NeomorphicCard } from "@/components/ui/neomorphic-card";
import ModelViewer from "@/components/ModelViewer";
import { Box, Headset, Camera } from "lucide-react";

interface ARViewerProps {
  isARActive: boolean;
  selectedProduct: any | null;
  onLaunchAR: () => void;
}

const ARViewer = ({ isARActive, selectedProduct, onLaunchAR }: ARViewerProps) => {
  return (
    <NeomorphicCard className="w-full aspect-[4/3] flex items-center justify-center p-1 bg-gray-200 dark:bg-gray-800">
      {isARActive && selectedProduct && selectedProduct.model_3d_url ? (
        <ModelViewer modelUrl={selectedProduct.model_3d_url} />
      ) : isARActive ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg flex items-center justify-center relative">
          <div className="text-center text-white">
            <div className="animate-pulse mb-4">
              <Box size={48} className="mx-auto" />
            </div>
            <p className="text-lg font-medium mb-2">AR Mode Active</p>
            <p className="text-sm opacity-80">Select a product with a 3D model to view it</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <Headset size={64} className="mx-auto mb-4 text-primary" />
          <p className="text-xl font-medium mb-2">AR Viewer Ready</p>
          <p className="text-muted-foreground mb-6 max-w-md">
            Select a product from the list to view it in AR, or launch the experience directly.
          </p>
          <Button onClick={onLaunchAR} size="lg" className="mb-4">
            <Camera className="mr-2 h-5 w-5" />
            Launch AR Experience
          </Button>
          <div className="text-xs text-gray-500">
            <p>Supports: iOS 12+, Android 8.0+, WebXR compatible browsers</p>
          </div>
        </div>
      )}
    </NeomorphicCard>
  );
};

export default ARViewer;
