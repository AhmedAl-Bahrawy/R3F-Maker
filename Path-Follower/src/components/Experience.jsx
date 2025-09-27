// Experience.jsx
import React, { useMemo, useRef } from "react";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Curve from "./Curve";
import { Spaceship } from "./Models/Spaceship";

const LINE_NB_POINTS = 100000;

export default function Experience() {
  // --- path curve (كما في الأصل) ---
  const curve = useMemo(() => Curve(), []);
  const linePoints = useMemo(() => curve.getPoints(LINE_NB_POINTS), [curve]);
  const curveLength = useMemo(() => curve.getLength(), [curve]);

  // refs
  const spaceshipRef = useRef();
  const followCamRef = useRef(); // الكاميرا الأساسية (makeDefault)
  const overviewCamRef = useRef();

  // helper lines refs
  const lookLineRef = useRef();
  const camForwardRef = useRef();
  const forwardLineRef = useRef();
  const rightLineRef = useRef();
  const upLineRef = useRef();

  // progress along the curve (0..1)
  const progress = useRef(0);

  // 🔧 المتغير الوحيد اللي يتحكم في سرعة السفينة (وحدات / ثانية)
  // shipSpeed = 10  => السفينة تمشي بمعدل 10 وحدات عالمية في الثانية على طول المسار
  // غيّره حسب ما تريد.
  const shipSpeed = 15;

  // reusable vectors لتقليل allocations
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);
  const tmpC = useMemo(() => new THREE.Vector3(), []);
  const localCamOffset = useMemo(() => new THREE.Vector3(0, 2, -6), []);

  // helper لتحديث line من نقطة a إلى b
  const setLineFromTo = (lineRef, a, b) => {
    if (!lineRef?.current) return;
    lineRef.current.geometry.setFromPoints([a.clone(), b.clone()]);
    if (lineRef.current.geometry.attributes.position) {
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
    lineRef.current.geometry.computeBoundingSphere();
  };

  useFrame((state, delta) => {
    if (!spaceshipRef.current) return;

    // ===== حساب التقدّم بناءً على السرعة (وحدات/ثانية) وليس على الفريمات =====
    // خطوة الprogress = (shipSpeed * delta) / طول_المنحنى
    // هذا يضمن أن السفينة تتحرك بمعدل ثابت (وحدات/ثانية) مهما كان طول المسار.
    if (curveLength > 0) {
      progress.current += (shipSpeed * delta) / curveLength;
    }

    // loop عند الوصول للنهاية (أو استخدم clamp لو تحب تتوقف)
    if (progress.current > 1) {
      progress.current -= 1; // يلف من البداية مرة تانية
    } else if (progress.current < 0) {
      progress.current += 1;
    }

    // الحصول على نقطة واتجاه بناءً على نسبة الطول u (0..1)
    const u = THREE.MathUtils.clamp(progress.current, 0, 1);
    curve.getPointAt(u, tmpA); // tmpA = curPoint
    curve.getTangentAt(u, tmpB); // tmpB = tangent (unit)

    // حرك السفينة بسلاسة للموقع الجديد
    spaceshipRef.current.position.lerp(tmpA, Math.min(delta * 60, 1));

    // للحصول على دوران ناعم استخدم "look ahead" صغير
    const eps = 1e-4;
    const uNext = THREE.MathUtils.clamp(u + eps, 0, 1);
    curve.getTangentAt(uNext, tmpC);

    const targetQ = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1), // نفترض موديل السفينة متجه +Z
      tmpC.clone().normalize()
    );
    spaceshipRef.current.quaternion.slerp(targetQ, Math.min(delta * 8, 1));

    // --- تحديث الكاميرا المتبعة (makeDefault) ---
    if (followCamRef.current) {
      // حوالة offset محلي لعالمى
      const worldOffset = tmpB
        .copy(localCamOffset)
        .applyQuaternion(spaceshipRef.current.quaternion);
      const desiredCamPos = tmpA
        .copy(spaceshipRef.current.position)
        .add(worldOffset);

      followCamRef.current.position.lerp(desiredCamPos, Math.min(delta * 5, 1));

      // الكاميرا تبص على السفينة بقليل ارتفاع
      const lookTarget = tmpB
        .copy(spaceshipRef.current.position)
        .add(new THREE.Vector3(0, 1, 0));
      followCamRef.current.lookAt(lookTarget);

      // خطوط الديباغ
      setLineFromTo(lookLineRef, followCamRef.current.position, lookTarget);

      const dir = new THREE.Vector3();
      followCamRef.current.getWorldDirection(dir);
      const forwardEnd = tmpA
        .copy(followCamRef.current.position)
        .add(dir.multiplyScalar(6));
      setLineFromTo(camForwardRef, followCamRef.current.position, forwardEnd);
    }

    // --- تحديث أشعة السفينة المحلية ---
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
      <OrbitControls makeDefault={false} camera={overviewCamRef.current} />

      {/* Follow camera — هذه الكاميرا الأساسية (makeDefault) تبص دايمًا على السفينة */}
      <PerspectiveCamera
        ref={followCamRef}
        makeDefault
        position={[0, 2, -6]}
        fov={90}
      />

      {/* CameraHelpers */}
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

      {/* السفينة نفسها */}
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
              depth: 0.01,
              bevelThickness: 0,
              bevelSize: 0,
              curveSegments: 12,
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
