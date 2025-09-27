import * as THREE from "three";

// Very simple path with gentle curves
export default function Curve({
  // Basic settings
  pointsPerSegment = 2, // نقط أقل = انحناءات أقل
  gentleCurves = 2, // انحناءات بسيطة جداً
  curveFrequency = 1, // مسافات أكبر بين الانحناءات

  // Curve properties
  tension = 0.6,
  closed = false,

  // Required points
  requiredPoints = [
    // === مرحلة الذهاب - اتجاهات مختلفة ===
    new THREE.Vector3(0, 0, 0), // نقطة البداية
    new THREE.Vector3(15, 2, 25), // انحناء بسيط يمين
    new THREE.Vector3(30, -3, 50), // انحناء شمال
    new THREE.Vector3(45, 5, 75), // صعود يمين
    new THREE.Vector3(50, 8, 100), // أعلى نقطة
    new THREE.Vector3(40, 10, 125), // نزول بسيط شمال
    new THREE.Vector3(25, 12, 150), // استمرار شمال

    // === الدوران الدائري (نصف دائرة) ===
    new THREE.Vector3(10, 15, 165), // بداية الدوران
    new THREE.Vector3(-5, 18, 175), // ربع الدائرة الأول
    new THREE.Vector3(-15, 20, 180), // نص الدائرة (أقصى شمال)
    new THREE.Vector3(-10, 22, 185), // ثلاثة أرباع
    new THREE.Vector3(5, 20, 195), // نهاية الدوران - بداية العودة

    // === مسار العودة - اتجاهات عكسية ===
    new THREE.Vector3(20, 18, 210), // بداية العودة يمين
    new THREE.Vector3(35, 15, 235), // استمرار يمين
    new THREE.Vector3(50, 12, 260), // وصول للجانب الأيمن
    new THREE.Vector3(45, 8, 285), // نزول من الأعلى
    new THREE.Vector3(30, 5, 310), // انحناء شمال
    new THREE.Vector3(15, 2, 335), // قرب النهاية
    new THREE.Vector3(5, 0, 350), // العودة للمركز تقريباً
    new THREE.Vector3(0, 0, 365),
  ],
} = {}) {
  if (!requiredPoints || requiredPoints.length < 2) {
    throw new Error("Need at least 2 required points");
  }

  // تحويل النقط (بدون ترتيب - نحافظ على ترتيب المستخدم)
  const points = requiredPoints.map((p) => {
    if (p instanceof THREE.Vector3) return p.clone();
    return new THREE.Vector3(p.x || 0, p.y || 0, p.z || 0);
  });

  const finalPoints = [];

  // Random بسيط
  let seed = 42;
  function simpleRandom() {
    seed = (seed * 1664525 + 1013904223) | 0;
    return ((seed >>> 0) % 1000) / 1000;
  }

  // لكل مقطع بين نقطتين
  for (let i = 0; i < points.length - 1; i++) {
    const startPoint = points[i];
    const endPoint = points[i + 1];

    // إضافة النقطة الأولى
    if (i === 0) {
      finalPoints.push(startPoint.clone());
    }

    // إنشاء نقط قليلة بين النقطتين مع انحناءات بسيطة
    for (let j = 1; j <= pointsPerSegment; j++) {
      const t = j / (pointsPerSegment + 1);

      // النقطة على الخط المستقيم
      const straightPoint = startPoint.clone().lerp(endPoint, t);

      // انحناء بسيط جداً - مسافات أكبر
      const wavePhase = t * Math.PI * curveFrequency;

      // انحناء يمين/شمال - بسيط جداً
      const sideWave = Math.sin(wavePhase) * gentleCurves;

      // انحناء فوق/تحت - أبسط
      const upWave = Math.cos(wavePhase * 0.7) * gentleCurves * 0.6;

      // شوية تنويع عشوائي خفيف جداً
      const randomOffset = (simpleRandom() - 0.5) * gentleCurves * 0.3;

      // تطبيق الانحناءات البسيطة
      straightPoint.x += sideWave + randomOffset;
      straightPoint.y += upWave + randomOffset * 0.5;

      finalPoints.push(straightPoint);
    }

    // إضافة النقطة النهائية
    finalPoints.push(endPoint.clone());
  }

  // منحنى بسيط جداً
  return new THREE.CatmullRomCurve3(finalPoints, closed, "catmullrom", tension);
}
