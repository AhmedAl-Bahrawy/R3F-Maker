// Experience.jsx
import React, { useMemo, useRef } from "react";
import { PerspectiveCamera, OrbitControls, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Curve from "./Curve";

const LINE_NB_POINTS = 2000;

export default function Experience() {
  // --- path curve (كما في الأصل) ---
  const curve = Curve();
  const linePoints = useMemo(() => curve.getPoints(LINE_NB_POINTS), [curve]);

  // refs (مثل الأصلي، بدون اختراعات)
  const cubeRef = useRef();
  const followCamRef = useRef(); // هذه ستكون الكاميرا الافتراضية (makeDefault)
  const overviewCamRef = useRef();

  // helper lines refs
  const lookLineRef = useRef(); // camera -> look target (yellow)
  const camForwardRef = useRef(); // camera forward (cyan)
  const forwardLineRef = useRef(); // cube forward (blue)
  const rightLineRef = useRef(); // cube right (red)
  const upLineRef = useRef(); // cube up (green)

  const scroll = useScroll();

  // reusable vectors لتقليل allocations
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);
  const localCamOffset = useMemo(() => new THREE.Vector3(0, 2, -6), []); // offset خلف المكعب

  // helper لتحديث line من نقطة a إلى b
  const setLineFromTo = (lineRef, a, b) => {
    if (!lineRef?.current) return;
    lineRef.current.geometry.setFromPoints([a.clone(), b.clone()]);
    if (lineRef.current.geometry.attributes.position) {
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
    lineRef.current.geometry.computeBoundingSphere();
  };

  // main update loop
  useFrame((state, delta) => {
    if (!cubeRef.current) return;

    // احسب موقع المكعب على المسار حسب scroll.offset
    const idx = Math.min(
      Math.round(scroll.offset * (linePoints.length - 1)),
      linePoints.length - 1
    );
    const curPoint = linePoints[idx];
    const nextPoint = linePoints[Math.min(idx + 1, linePoints.length - 1)];

    // حرك المكعب بسلاسة لموضع curPoint
    cubeRef.current.position.lerp(tmpA.copy(curPoint), Math.min(delta * 60, 1));

    // وجّه المكعب باتجاه الحركة (slerp للنعومة)
    if (nextPoint) {
      tmpB.copy(nextPoint).sub(curPoint).normalize();
      const targetQ = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1), // افتراض أن موديلك يتقدم على +Z
        tmpB
      );
      cubeRef.current.quaternion.slerp(targetQ, Math.min(delta * 8, 1));
    }

    // --- تحديث الكاميرا المتبعة (هذه الكاميرا هي الافتراضية الآن) ---
    if (followCamRef.current) {
      // حول الـ offset المحلي إلى عالمى باستخدام quaternion المكعب
      const worldOffset = tmpB
        .copy(localCamOffset)
        .applyQuaternion(cubeRef.current.quaternion);
      const desiredCamPos = tmpA
        .copy(cubeRef.current.position)
        .add(worldOffset);

      // لِمْحَة: نستخدم lerp للسلاسة
      followCamRef.current.position.lerp(desiredCamPos, Math.min(delta * 5, 1));

      // اجعل الكاميرا تنظر للمكعب (نقطة فوقه قليلًا)
      const lookTarget = tmpB
        .copy(cubeRef.current.position)
        .add(new THREE.Vector3(0, 1, 0));
      followCamRef.current.lookAt(lookTarget);

      // تحديث خط النظر (camera -> lookTarget)
      setLineFromTo(lookLineRef, followCamRef.current.position, lookTarget);

      // تحديث خط اتجاه الكاميرا (based on getWorldDirection)
      const dir = new THREE.Vector3();
      followCamRef.current.getWorldDirection(dir);
      const forwardEnd = tmpA
        .copy(followCamRef.current.position)
        .add(dir.multiplyScalar(6));
      setLineFromTo(camForwardRef, followCamRef.current.position, forwardEnd);
    }

    // --- تحديث أشعة المكعب المحلية (forward/right/up) ---
    const cubePos = cubeRef.current.position;
    const cubeQuat = cubeRef.current.quaternion;

    setLineFromTo(
      forwardLineRef,
      cubePos,
      tmpA
        .copy(new THREE.Vector3(0, 0, 2))
        .applyQuaternion(cubeQuat)
        .add(cubePos)
    );

    setLineFromTo(
      rightLineRef,
      cubePos,
      tmpA
        .copy(new THREE.Vector3(2, 0, 0))
        .applyQuaternion(cubeQuat)
        .add(cubePos)
    );

    setLineFromTo(
      upLineRef,
      cubePos,
      tmpA
        .copy(new THREE.Vector3(0, 2, 0))
        .applyQuaternion(cubeQuat)
        .add(cubePos)
    );
  });

  // شكل بسيط للمسار (كما في الأصلي)
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.08, 0);
    s.lineTo(0.08, 0);
    return s;
  }, []);

  return (
    <>
      {/* Overview camera (غير افتراضية) + تحكم أوربت */}
      <PerspectiveCamera
        ref={overviewCamRef}
        position={[30, 30, 30]}
        fov={60}
      />

      {/* Follow camera — هذه الكاميرا الأساسية (makeDefault) تبص دايمًا على المكعب */}
      <PerspectiveCamera
        ref={followCamRef}
        makeDefault
        position={[0, 2, -6]}
        fov={60}
      />

      {/* CameraHelpers لفرستوم الكاميرات (تشغيلها يساعدك تشوف الفراستوم) */}
      {overviewCamRef.current && (
        <primitive object={new THREE.CameraHelper(overviewCamRef.current)} />
      )}
      {followCamRef.current && (
        <primitive object={new THREE.CameraHelper(followCamRef.current)} />
      )}

      {/* خطوط الهيلبرز */}
      <line ref={lookLineRef}>
        <bufferGeometry />
        <lineBasicMaterial color="yellow" linewidth={2} />
      </line>

      <line ref={camForwardRef}>
        <bufferGeometry />
        <lineBasicMaterial color="cyan" linewidth={2} />
      </line>

      {/* المكعب نفسه */}
      <mesh ref={cubeRef} position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>

      {/* أشعة اتجاه المكعب */}
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

      {/* visual path */}
      <mesh position={[0, -3, 0]}>
        <extrudeGeometry
          args={[
            shape,
            {
              steps: LINE_NB_POINTS,
              bevelEnabled: false,
              extrudePath: curve,
              depth: 0.01, // Make the path flat and thin
              bevelThickness: 0,
              bevelSize: 0,
              curveSegments: 12, // optional, for smoothness
            },
          ]}
        />
        <meshStandardMaterial color="white" transparent opacity={0.7} />
      </mesh>

      {/* إضاءات بسيطة */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
    </>
  );
}
