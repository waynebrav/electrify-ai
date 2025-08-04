import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Environment } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

interface ModelProps {
  url: string;
  scale?: number;
}

function Model({ url, scale = 1 }: ModelProps) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<any>();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <primitive 
      ref={meshRef}
      object={scene} 
      scale={[scale, scale, scale]} 
      position={[0, 0, 0]}
    />
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm">Loading 3D model...</span>
      </div>
    </Html>
  );
}

interface ModelViewerProps {
  modelUrl: string;
  className?: string;
  scale?: number;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ 
  modelUrl, 
  className = "w-full h-96", 
  scale = 1 
}) => {
  if (!modelUrl) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center`}>
        <p className="text-gray-500">No 3D model available</p>
      </div>
    );
  }

  return (
    <div className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden border relative`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Environment preset="studio" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Model url={modelUrl} scale={scale} />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
      
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Click and drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};

export default ModelViewer;