import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import { Gltf, Environment, KeyboardControls } from '@react-three/drei'
import Controller from 'ecctrl'

function fireKey(key, type) {
  window.dispatchEvent(new KeyboardEvent(type, { code: key, bubbles: true }))
}

const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)

function MobileControls() {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      padding: '20px 30px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      zIndex: 999, pointerEvents: 'none'
    }}>

      {/* Left: D-Pad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 64px)',
        gridTemplateRows: 'repeat(3, 64px)',
        gap: 4,
        pointerEvents: 'all'
      }}>
        {/* Row 1 */}
        <div />
        <Btn label="↑" keyCode="KeyW" style={{ gridColumn: 2, gridRow: 1 }} />
        <div />
        {/* Row 2 */}
        <Btn label="←" keyCode="KeyA" style={{ gridColumn: 1, gridRow: 2 }} />
        <div />
        <Btn label="→" keyCode="KeyD" style={{ gridColumn: 3, gridRow: 2 }} />
        {/* Row 3 */}
        <div />
        <Btn label="↓" keyCode="KeyS" style={{ gridColumn: 2, gridRow: 3 }} />
        <div />
      </div>

      {/* Right: Action buttons */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'all'
      }}>
        <Btn label="JUMP" keyCode="Space" wide />
        <Btn label="RUN" keyCode="ShiftLeft" wide />
      </div>
    </div>
  )
}

function Btn({ label, keyCode, wide, style }) {
  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); fireKey(keyCode, 'keydown') }}
      onPointerUp={(e) => { e.preventDefault(); fireKey(keyCode, 'keyup') }}
      onPointerLeave={(e) => { e.preventDefault(); fireKey(keyCode, 'keyup') }}
      onPointerCancel={(e) => { e.preventDefault(); fireKey(keyCode, 'keyup') }}
      style={{
        width: wide ? 90 : 64,
        height: 64,
        borderRadius: 14,
        background: 'rgba(30,30,40,0.55)',
        backdropFilter: 'blur(6px)',
        color: 'white',
        fontSize: wide ? 13 : 22,
        fontWeight: 'bold',
        border: '1.5px solid rgba(255,255,255,0.35)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'none',
        WebkitTapHighlightColor: 'transparent',
        ...style
      }}
    >
      {label}
    </button>
  )
}

export default function App() {
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
    // 'ShiftLeft' is needed so the on-screen RUN button works
    { name: 'run', keys: ['Shift', 'ShiftLeft', 'ShiftRight'] },
  ]

  return (
    <>
      <Canvas
        shadows
        camera={{ fov: 65 }}
        style={{ width: '100vw', height: '100vh', background: '#05060f' }}
        // Only request pointer lock on desktop
        onPointerDown={(e) => { if (!isMobile) e.target.requestPointerLock() }}
      >
        {/* <Fisheye> wrapper removed so the scene renders with a normal camera */}
        <Environment files="/night.hdr" ground={{ scale: 100 }} />
        <directionalLight intensity={0.7} castShadow shadow-bias={-0.0004} position={[-20, 20, 20]}>
          <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
        </directionalLight>
        <ambientLight intensity={0.2} />
        <Physics timeStep="vary">
          <KeyboardControls map={keyboardMap}>
            <Controller maxVelLimit={5}>
              <Gltf castShadow receiveShadow scale={0.315} position={[0, -0.55, 0]} src="/ghost_w_tophat-transformed.glb" />
            </Controller>
          </KeyboardControls>
          <RigidBody type="fixed" colliders="trimesh">
            <Gltf castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]} scale={0.11} src="/fantasy_game_inn2-transformed.glb" />
          </RigidBody>
        </Physics>
      </Canvas>

      <MobileControls />
    </>
  )
}