import React, { useMemo } from "react";
import * as THREE from "three";

const Curve = () => {
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        // Full track with right and left curves, forming a loop

        // Start straight
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(2, 0.1, 2),
        new THREE.Vector3(4, 0.2, 6),
        new THREE.Vector3(6, 0.3, 10),

        // Right curve (quarter circle)
        new THREE.Vector3(7, 0.5, 13),
        new THREE.Vector3(8, 1.0, 16),
        new THREE.Vector3(7, 1.2, 19),
        new THREE.Vector3(4, 1.3, 21),

        // Back straight
        new THREE.Vector3(0, 1.1, 22),
        new THREE.Vector3(-4, 0.8, 21),

        // Left curve (quarter circle)
        new THREE.Vector3(-7, 0.5, 19),
        new THREE.Vector3(-8, 0.2, 16),
        new THREE.Vector3(-7, 0.0, 13),
        new THREE.Vector3(-6, -0.2, 10),

        // Return straight
        new THREE.Vector3(-4, -0.3, 6),
        new THREE.Vector3(-2, -0.2, 2),
        new THREE.Vector3(0, 0, 0), // Close the loop
      ],
      false,
      "catmullrom",
      0.5
    );
  }, []);

  return curve;
};

export default Curve;
