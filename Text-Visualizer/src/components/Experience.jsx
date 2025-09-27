// Experience.jsx
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Curve from "./Curve";
import { Spaceship } from "./Models/Spaceship";
import CameraSystem from "./CameraSystem";
import HelperLines from "./HelperLines";
import SpaceshipController from "./SpaceshipController";
import PathVisualizer from "./PathVisualizer";
import TextViewer from "./TextViewer";

const LINE_NB_POINTS = 10000;

export default function Experience() {
  // --- path curve ---
  const curve = useMemo(() => Curve(), []);
  const curveLength = useMemo(() => curve.getLength(), []);

  // refs
  const spaceshipRef = useRef();
  const followCamRef = useRef();
  const overviewCamRef = useRef();

  // helper lines refs
  const lookLineRef = useRef();
  const camForwardRef = useRef();
  const forwardLineRef = useRef();
  const rightLineRef = useRef();
  const upLineRef = useRef();

  // progress along the curve (0..1)
  const progress = useRef(0);

  // ship speed (units per second)
  const shipSpeed = 20;
  const canMove = true;

  // reusable vectors
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);
  const tmpC = useMemo(() => new THREE.Vector3(), []);
  const localCamOffset = useMemo(() => new THREE.Vector3(0, 2, -6), []);

  useFrame((state, delta) => {
    if (!spaceshipRef.current || !canMove) return;

    // Update progress based on speed
    if (curveLength > 0) {
      progress.current += (shipSpeed * delta) / curveLength;
    }

    // Loop at the end
    /*
    if (progress.current > 1) {
      progress.current -= 1;
    } else if (progress.current < 0) {
      progress.current += 1;
    } */

    const u = THREE.MathUtils.clamp(progress.current, 0, 1);
    curve.getPointAt(u, tmpA);
    curve.getTangentAt(u, tmpB);

    // Move spaceship smoothly
    spaceshipRef.current.position.lerp(tmpA, Math.min(delta * 60, 1));

    // Smooth rotation with look ahead
    const eps = 1e-4;
    const uNext = THREE.MathUtils.clamp(u + eps, 0, 1);
    curve.getTangentAt(uNext, tmpC);

    const targetQ = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      tmpC.clone().normalize()
    );
    spaceshipRef.current.quaternion.slerp(targetQ, Math.min(delta * 8, 1));
  });

  return (
    <>
      <CameraSystem
        followCamRef={followCamRef}
        overviewCamRef={overviewCamRef}
        spaceshipRef={spaceshipRef}
        localCamOffset={localCamOffset}
        lookLineRef={lookLineRef}
        camForwardRef={camForwardRef}
      />

      <SpaceshipController ref={spaceshipRef}>
        <Spaceship />
      </SpaceshipController>

      <HelperLines
        forwardLineRef={forwardLineRef}
        rightLineRef={rightLineRef}
        upLineRef={upLineRef}
        lookLineRef={lookLineRef}
        camForwardRef={camForwardRef}
        spaceshipRef={spaceshipRef}
        useHelpers={false}
      />

      <PathVisualizer curve={curve} lineNbPoints={LINE_NB_POINTS} />

      <TextViewer />

      {/* Basic lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
    </>
  );
}
