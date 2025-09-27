import * as THREE from "three";

// Simplified, longer and much smoother curve generator.
// - Longer length by default
// - Lower-frequency sine components for broad, slow sweeps
// - Very small randomness (off by default) so motion stays smooth
// - Slight easing applied so climbs/descents feel gradual

export default function Curve({
  length = 120, // more control points => longer curve
  waves = 8, // fewer main waves => broader turns
  amplitudeX = 12, // gentle left-right amplitude
  amplitudeY = 7, // gentle up-down amplitude
  forwardSpacing = 2, // spacing along Z
  randomness = 0.2, // set small (0.2..) if you want tiny jitter
  closed = true,
  tension = 0.7, // slightly smoother tangents
} = {}) {
  const pts = [];

  // small deterministic jitter helper (optional)
  let seed = 42;
  function jitter(scale = 1) {
    if (!randomness) return 0;
    seed = (seed * 1664525 + 1013904223) | 0;
    return (((seed >>> 0) % 1000) / 1000 - 0.5) * randomness * scale;
  }

  for (let i = 0; i < length; i++) {
    const t = i / (length - 1); // 0..1 along path

    // Ease curve to slow the start/stop of large movements
    // cosine ease-in-out: starts slow, accelerates, slows down
    const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);

    // Broad left-right motion (low frequency) and very smooth
    const leftRight = Math.sin(t * Math.PI * 2 * waves) * amplitudeX * ease;

    // Slower up-down motion (half the frequency of left-right)
    const upDown =
      Math.sin(t * Math.PI * 2 * (waves * 0.5) - Math.PI / 2) *
      amplitudeY *
      ease;

    // Forward Z position
    const z = i * forwardSpacing;

    const x = leftRight + jitter(0.6);
    const y = upDown + jitter(0.4);

    pts.push(new THREE.Vector3(x, y, z));
  }

  // Add a single back and front point to avoid abrupt tangent at ends
  const start = pts[0];
  const before = new THREE.Vector3(start.x, start.y, start.z - forwardSpacing);
  pts.unshift(before);

  const last = pts[pts.length - 1];
  const after = new THREE.Vector3(last.x, last.y, last.z + forwardSpacing);
  pts.push(after);

  // Create the Catmull-Rom curve
  return new THREE.CatmullRomCurve3(pts, closed, "catmullrom", tension);
}
