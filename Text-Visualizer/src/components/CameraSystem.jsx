// components/CameraSystem.jsx
import React, { useMemo } from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function CameraSystem({
  followCamRef,
  overviewCamRef,
  spaceshipRef,
  localCamOffset,
  lookLineRef,
  camForwardRef,
}) {
  // reusable vectors for camera calculations
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);

  // helper to update line from point a to b
  const setLineFromTo = (lineRef, a, b) => {
    if (!lineRef?.current) return;
    lineRef.current.geometry.setFromPoints([a.clone(), b.clone()]);
    if (lineRef.current.geometry.attributes.position) {
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
    lineRef.current.geometry.computeBoundingSphere();
  };

  useFrame((state, delta) => {
    if (!spaceshipRef?.current || !followCamRef?.current) return;

    // Update follow camera
    const worldOffset = tmpB
      .copy(localCamOffset)
      .applyQuaternion(spaceshipRef.current.quaternion);
    const desiredCamPos = tmpA
      .copy(spaceshipRef.current.position)
      .add(worldOffset);

    followCamRef.current.position.lerp(desiredCamPos, Math.min(delta * 5, 1));

    // Camera looks at spaceship with slight elevation
    const lookTarget = tmpB
      .copy(spaceshipRef.current.position)
      .add(new THREE.Vector3(0, 1, 0));
    followCamRef.current.lookAt(lookTarget);

    // Update debug lines
    setLineFromTo(lookLineRef, followCamRef.current.position, lookTarget);

    const dir = new THREE.Vector3();
    followCamRef.current.getWorldDirection(dir);
    const forwardEnd = tmpA
      .copy(followCamRef.current.position)
      .add(dir.multiplyScalar(6));
    setLineFromTo(camForwardRef, followCamRef.current.position, forwardEnd);
  });

  return (
    <>
      {/* Overview camera (non-default) + orbit controls */}
      <PerspectiveCamera
        ref={overviewCamRef}
        position={[30, 30, 30]}
        fov={60}
      />
      <OrbitControls
        makeDefault={false}
        camera={overviewCamRef.current}
        enableZoom={false}
      />

      {/* Follow camera — this is the main camera (makeDefault) always looking at the spaceship */}
      <PerspectiveCamera
        ref={followCamRef}
        makeDefault={true}
        position={[0, 2, -6]}
        fov={90}
      />

      {/* Camera Helpers */}
      {overviewCamRef.current && (
        <primitive object={new THREE.CameraHelper(overviewCamRef.current)} />
      )}
      {followCamRef.current && (
        <primitive object={new THREE.CameraHelper(followCamRef.current)} />
      )}
    </>
  );
}
