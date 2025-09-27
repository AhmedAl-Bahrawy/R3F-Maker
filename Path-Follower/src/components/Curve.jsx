import React, { useMemo } from "react";
import * as THREE from "three";

export default function Curve({
  length = 400, // total number of control points (higher = longer)
  waves = 18, // number of main waves along the track
  amplitudeX = 8, // left-right amplitude
  amplitudeY = 3, // up-down amplitude
  forwardSpacing = 1.2, // how far apart points advance on z (bigger => longer)
  randomness = 0.6, // small jitter amount
  closed = false, // loop the track? false => not circular
  tension = 0.3, // CatmullRom tension (0..1)
} = {}) {
  const curve = useMemo(() => {
    const pts = [];
    // Keep a deterministic pseudo-random (optional)
    let seed = 1337;
    function rand() {
      seed = (seed * 1664525 + 1013904223) | 0;
      return ((seed >>> 0) % 1000) / 1000;
    }

    // Build points along +Z axis with sinusoidal X and Y
    for (let i = 0; i < length; i++) {
      const t = i / (length - 1); // 0..1 along path
      // Make multiple sine components for interesting curves
      const freq1 = waves * 1.0;
      const freq2 = waves * 0.35;
      const leftRight =
        Math.sin(t * Math.PI * 2 * freq1) *
          amplitudeX *
          (0.6 + 0.4 * Math.cos(t * Math.PI * 2 * 0.5)) +
        Math.sin(t * Math.PI * 2 * freq2 + Math.PI * 0.25) * (amplitudeX * 0.4);

      const upDown =
        Math.sin(t * Math.PI * 2 * (waves * 0.5) + Math.PI * 0.9) * amplitudeY +
        Math.cos(t * Math.PI * 2 * (waves * 0.12)) * (amplitudeY * 0.6);

      // Add occasional sharper corks (by boosting X briefly)
      const corkFactor =
        Math.sin(t * Math.PI * 2 * waves * 0.12) > 0.96 ? 2.2 : 1.0;

      // controlled forward movement on Z
      const z = i * forwardSpacing;

      // small jitter
      const jitterX = (rand() - 0.5) * randomness;
      const jitterY = (rand() - 0.5) * (randomness * 0.6);

      const x = leftRight * corkFactor + jitterX;
      const y = upDown + jitterY;

      pts.push(new THREE.Vector3(x, y, z));
    }

    // Optionally smooth the start and add a few leading/back points to avoid abrupt tangents
    // Add a start offset backwards so first segment has natural direction
    const startDir = new THREE.Vector3(0, 0, -1);
    const before = new THREE.Vector3(
      pts[0].x + startDir.x * forwardSpacing,
      pts[0].y + startDir.y * forwardSpacing,
      pts[0].z + startDir.z * forwardSpacing
    );
    pts.unshift(before);

    // Optionally add one extra end point to give nicer endpoint tangent
    const endDir = new THREE.Vector3(0, 0, 1);
    const after = new THREE.Vector3(
      pts[pts.length - 1].x + endDir.x * forwardSpacing,
      pts[pts.length - 1].y + endDir.y * forwardSpacing,
      pts[pts.length - 1].z + endDir.z * forwardSpacing
    );
    pts.push(after);

    // Create the Catmull-Rom curve (not circular unless closed=true)
    const c = new THREE.CatmullRomCurve3(pts, closed, "catmullrom", tension);

    return c;
  }, [
    length,
    waves,
    amplitudeX,
    amplitudeY,
    forwardSpacing,
    randomness,
    closed,
    tension,
  ]);

  return curve;
}
