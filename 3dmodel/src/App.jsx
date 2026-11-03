import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, Loader, useGLTF, OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei'
import './App.css'

function Model({ url }) {
  const { scene } = useGLTF(url)

  return (
    <primitive
      object={scene}
      rotation={[-Math.PI / 30, 10, 0]}
      scale={1}
    />
  )
}

export default function App() {
  return (
    <>
      <div className="bg" />
      <h1>
        Learning 3D <span style={{ fontSize: '0.4em' }}>with</span>
        <br />
        <span>CSM3401</span>

      </h1>

      <Canvas dpr={[1.5, 2]} linear shadows>
        <fog attach="fog" args={['#272730', 16, 30]} />
        <ambientLight intensity={0.75 * Math.PI} />
        <PerspectiveCamera makeDefault position={[0, 0, 16]} fov={75}>
          <spotLight
            castShadow
            intensity={2.25 * Math.PI}
            decay={0}
            angle={0.2}
            penumbra={1}
            position={[-25, 20, -15]}
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />
        </PerspectiveCamera>
        <Suspense fallback={null}>
          <Center>
            <Model url="/scene.glb" />
          </Center>
        </Suspense>
        <OrbitControls autoRotate enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} />
        <Stars radius={500} depth={50} count={1000} factor={10} />
      </Canvas>
      <div className="layer" />
      <Loader />

      <a href="https://github.com/drcmda/learnwithjason" className="top-left" children="CSM3401" />
      <a href="https://twitter.com/0xca0a" className="top-right" children="[ START ]" />
      <a href="https://github.com/pmndrs/react-three-fiber" className="bottom-left" children="CSM3401 @ Version 1.00" />
    
    </>
  )
}