import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Box3, Vector3 } from 'three'
import { useTelemetry } from '../context/TelemetryContext'

const MODEL_TARGET_SIZE = 2.4
const degreesToRadians = (degrees) => (degrees * Math.PI) / 180

function SatelliteMesh({ wireframe }) {
  const { scene } = useGLTF('/cansat.glb')
  const { gyroscope } = useTelemetry()
  const rotationRef = useRef(null)

  useFrame(() => {
    if (!rotationRef.current) return

    const targetRotation = {
      x: degreesToRadians(gyroscope.pitch),
      y: degreesToRadians(gyroscope.yaw),
      z: degreesToRadians(gyroscope.roll),
    }

    rotationRef.current.rotation.x +=
      (targetRotation.x - rotationRef.current.rotation.x) * 0.1
    rotationRef.current.rotation.y +=
      (targetRotation.y - rotationRef.current.rotation.y) * 0.1
    rotationRef.current.rotation.z +=
      (targetRotation.z - rotationRef.current.rotation.z) * 0.1
  })

  const { model, position, scale } = useMemo(() => {
    const clonedScene = scene.clone(true)
    clonedScene.traverse((object) => {
      if (!object.isMesh) return

      const cloneMaterial = (material) => {
        const clonedMaterial = material.clone()
        clonedMaterial.wireframe = wireframe
        return clonedMaterial
      }

      object.material = Array.isArray(object.material)
        ? object.material.map(cloneMaterial)
        : cloneMaterial(object.material)
    })
    const bounds = new Box3().setFromObject(clonedScene)
    const center = bounds.getCenter(new Vector3())
    const size = bounds.getSize(new Vector3())
    const fitScale = MODEL_TARGET_SIZE / Math.max(size.x, size.y, size.z)

    return {
      model: clonedScene,
      position: center.multiplyScalar(-fitScale).toArray(),
      scale: fitScale,
    }
  }, [scene, wireframe])

  return (
    <group>
      <group ref={rotationRef}>
        <group position={position} scale={scale}>
          <primitive object={model} />
        </group>
      </group>
      <axesHelper args={[1.5]} />
    </group>
  )
}

function ResettableCamera({ controlsRef, resetTrigger }) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }
  }, [camera, controlsRef, resetTrigger])

  return null
}

function Satellite3D({ wireframe = false, resetTrigger = 0 }) {
  const controlsRef = useRef(null)

  return (
    <div className="satellite-3d" aria-label="3D CanSat orientation">
      <Canvas camera={{ fov: 35, position: [0, 0, 5] }}>
        <color attach="background" args={['#0d1117']} />
        <ambientLight color="#8bc5ff" intensity={0.9} />
        <directionalLight color="#ffffff" intensity={1.2} position={[3, 4, 5]} />
        <directionalLight color="#00f0ff" intensity={0.5} position={[-4, -2, -3]} />
        <ResettableCamera controlsRef={controlsRef} resetTrigger={resetTrigger} />
        <Suspense fallback={null}>
          <SatelliteMesh wireframe={wireframe} />
        </Suspense>
        <OrbitControls ref={controlsRef} enableDamping />
      </Canvas>
    </div>
  )
}

export default Satellite3D
