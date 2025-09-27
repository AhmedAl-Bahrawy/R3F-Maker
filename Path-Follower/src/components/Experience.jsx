import React, { useMemo, useRef } from "react";
import { PerspectiveCamera, OrbitControls, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Curve from "./Curve";
import { Spaceship } from "./Models/Spaceship";

const LINE_NB_POINTS = 2000;

export default function Experience() {
  // --- path curve (كما في الأصل) ---
  const curve = Curve();
  const linePoints = useMemo(() => curve.getPoints(LINE_NB_POINTS), [curve]);

  // refs (مثل الأصلي، بدون اختراعات) --- renamed to spaceship
  const spaceshipRef = useRef();
  const followCamRef = useRef(); // هذه ستكون الكاميرا الافتراضية (makeDefault)
  const overviewCamRef = useRef();

  // helper lines refs
  const lookLineRef = useRef(); // camera -> look target (yellow)
  const camForwardRef = useRef(); // camera forward (cyan)
  const forwardLineRef = useRef(); // spaceship forward (blue)
  const rightLineRef = useRef(); // spaceship right (red)
  const upLineRef = useRef(); // spaceship up (green)

  const scroll = useScroll();

  // reusable vectors لتقليل allocations
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);
  const localCamOffset = useMemo(() => new THREE.Vector3(0, 2, -6), []); // offset خلف السفينة

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
    if (!spaceshipRef.current) return;

    // احسب موقع السفينة على المسار حسب scroll.offset
    const idx = Math.min(
      Math.round(scroll.offset * (linePoints.length - 1)),
      linePoints.length - 1
    );
    const curPoint = linePoints[idx];
    const nextPoint = linePoints[Math.min(idx + 1, linePoints.length - 1)];

    // حرك السفينة بسلاسة لموضع curPoint
    spaceshipRef.current.position.lerp(
      tmpA.copy(curPoint),
      Math.min(delta * 60, 1)
    );

    // وجّه السفينة باتجاه الحركة (slerp للنعومة)
    if (nextPoint) {
      tmpB.copy(nextPoint).sub(curPoint).normalize();
      const targetQ = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1), // افتراض أن موديلك يتقدم على +Z
        tmpB
      );
      spaceshipRef.current.quaternion.slerp(targetQ, Math.min(delta * 8, 1));
    }

    // --- تحديث الكاميرا المتبعة (هذه الكاميرا هي الافتراضية الآن) ---
    if (followCamRef.current) {
      // حول الـ offset المحلي إلى عالمى باستخدام quaternion السفينة
      const worldOffset = tmpB
        .copy(localCamOffset)
        .applyQuaternion(spaceshipRef.current.quaternion);
      const desiredCamPos = tmpA
        .copy(spaceshipRef.current.position)
        .add(worldOffset);

      // لِمْحَة: نستخدم lerp للسلاسة
      followCamRef.current.position.lerp(desiredCamPos, Math.min(delta * 5, 1));

      // اجعل الكاميرا تنظر للسفينة (نقطة فوقها قليلًا)
      const lookTarget = tmpB
        .copy(spaceshipRef.current.position)
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

    // --- تحديث أشعة السفينة المحلية (forward/right/up) ---
    const spaceshipPos = spaceshipRef.current.position;
    const spaceshipQuat = spaceshipRef.current.quaternion;

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

      {/* Follow camera — هذه الكاميرا الأساسية (makeDefault) تبص دايمًا على السفينة */}
      <PerspectiveCamera
        ref={followCamRef}
        makeDefault
        position={[0, 2, -6]}
        fov={90}
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

      {/* السفينة نفسها — نلفها بـ group عشان نضمن ref يعمل حتى لو الموديل مش forwardRef */}
      <group ref={spaceshipRef} position={[0, 0, 0]} scale={0.5}>
        <Spaceship />
      </group>

      {/* أشعة اتجاه السفينة */}
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
