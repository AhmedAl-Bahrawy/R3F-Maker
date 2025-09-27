import { Text } from "@react-three/drei";
import React, { useMemo } from "react";
import Curve from "./Curve";

export default function TextViewer() {
  const curve = useMemo(() => Curve(), []);
  const curveLength = useMemo(() => curve.getLength(), []);

  // Get a random point on the curve
  const randomPoint = useMemo(() => {
    // pick a random distance along the curve
    const randomDistance = Math.random() * curveLength;

    // normalize distance to [0,1]
    const u = randomDistance / curveLength;

    // get position as THREE.Vector3
    return curve.getPointAt(u);
  }, [curve, curveLength]);
  return (
    <>
      <group
        rotation={[0, Math.PI, 0]}
        position={[randomPoint.x - 3, randomPoint.y + 5, randomPoint.z]}
      >
        <Text
          color={"white"}
          anchorX={"center"}
          anchorY={"middle"}
          fontSize={1}
        >
          Hello World!{"\n"}
          Are We Ready ?? {"\n"}
          Nooo!
        </Text>
      </group>
    </>
  );
}
