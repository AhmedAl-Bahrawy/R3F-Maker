// components/HelperLines.jsx
import React, { use, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function HelperLines({
  forwardLineRef,
  rightLineRef,
  upLineRef,
  lookLineRef,
  camForwardRef,
  spaceshipRef,
  useHelpers = true,
}) {
  // reusable vector for calculations
  const tmpA = useMemo(() => new THREE.Vector3(), []);

  // helper to update line from point a to b
  const setLineFromTo = (lineRef, a, b) => {
    if (!lineRef?.current || !useHelpers) return;
    lineRef.current.geometry.setFromPoints([a.clone(), b.clone()]);
    if (lineRef.current.geometry.attributes.position) {
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
    lineRef.current.geometry.computeBoundingSphere();
  };

  useFrame(() => {
    if (!spaceshipRef?.current || !useHelpers) return;

    const spaceshipPos = spaceshipRef.current.position;
    const spaceshipQuat = spaceshipRef.current.quaternion;

    // Update spaceship direction rays
    setLineFromTo(
      forwardLineRef,
      spaceshipPos,
      tmpA
        .copy(new THREE.Vector3(0, 0, 2))
        .applyQuaternion(spaceshipQuat)
        .add(spaceshipPos)
    );

    setLineFromTo(
      rightLineRef,
      spaceshipPos,
      tmpA
        .copy(new THREE.Vector3(2, 0, 0))
        .applyQuaternion(spaceshipQuat)
        .add(spaceshipPos)
    );

    setLineFromTo(
      upLineRef,
      spaceshipPos,
      tmpA
        .copy(new THREE.Vector3(0, 2, 0))
        .applyQuaternion(spaceshipQuat)
        .add(spaceshipPos)
    );
  });

  return (
    <>
      {useHelpers && (
        <>
          {/* Debug lines */}
          <line ref={lookLineRef}>
            <bufferGeometry />
            <lineBasicMaterial color="yellow" linewidth={2} />
          </line>
          <line ref={camForwardRef}>
            <bufferGeometry />
            <lineBasicMaterial color="cyan" linewidth={2} />
          </line>
          {/* Spaceship direction rays */}
          <line ref={forwardLineRef}>
            <bufferGeometry />
            <lineBasicMaterial color="blue" linewidth={2} />
          </line>
          <line ref={rightLineRef}>
            <bufferGeometry />
            <lineBasicMaterial color="red" linewidth={2} />
          </line>
          <line ref={upLineRef}>
            <bufferGeometry />
            <lineBasicMaterial color="green" linewidth={2} />
          </line>
        </>
      )}
    </>
  );
}
