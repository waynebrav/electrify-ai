
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, Loader } from '@react-three/drei';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  // Adjust scale based on the model to normalize size
  const scale = url.includes('iphone-x') ? 12 : url.includes('macbook') ? 0.8 : 1;
  return <primitive object={scene} scale={scale} />;
}

const ModelViewer = ({ modelUrl }: { modelUrl: string }) => {
  return (
    <>
      <Canvas dpr={[1, 2]} camera={{ fov: 45 }} className="w-full h-full rounded-lg cursor-grab active:cursor-grabbing">
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6} adjustCamera>
            <Model url={modelUrl} />
          </Stage>
          <OrbitControls autoRotate autoRotateSpeed={0.5} />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
};

export default ModelViewer;
