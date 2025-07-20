
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Box, Headset } from "lucide-react";

const ARInfoSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6 text-center">
          <Camera className="h-8 w-8 mx-auto mb-3 text-blue-500" />
          <h3 className="font-semibold mb-2">Camera Access</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Allow camera access to enable AR features
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <Box className="h-8 w-8 mx-auto mb-3 text-green-500" />
          <h3 className="font-semibold mb-2">3D Models</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            High-quality 3D models for realistic visualization
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <Headset className="h-8 w-8 mx-auto mb-3 text-purple-500" />
          <h3 className="font-semibold mb-2">Device Support</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Compatible with smartphones, tablets, and AR headsets
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ARInfoSection;
