// components/PathVisualizer.jsx
import React, { useMemo } from "react";
import * as THREE from "three";

export default function PathVisualizer({ curve, lineNbPoints }) {
  // Simple shape for the path
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.08, 0);
    s.lineTo(0.08, 0);
    return s;
  }, []);

  return (
    <mesh position={[0, -3, 0]}>
      <extrudeGeometry
        args={[
          shape,
          {
            steps: lineNbPoints,
            bevelEnabled: false,
            extrudePath: curve,
            depth: 0.01,
            bevelThickness: 0,
            bevelSize: 0,
            curveSegments: 12,
          },
        ]}
      />
      <meshStandardMaterial color="white" transparent opacity={0.7} />
    </mesh>
  );
}
