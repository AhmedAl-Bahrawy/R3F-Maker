# 🚀 React Three Fiber 3D Starter

This project was auto-generated with **maker.py**.  
It comes with a full set of tools for building 3D/interactive apps.

---

## 📦 Included Dependencies

### Core
- **three** → The 3D engine.
- **@react-three/fiber** → React renderer for three.js.
- **@react-three/drei** → Ready-made helpers (OrbitControls, Sky, Loader...).

### UI & Controls
- **leva** → Live control panel to tweak variables.
- **zustand** → Simple global state management.
- **@use-gesture/react**, **react-use-gesture** → Mouse/touch gestures.

### Physics
- **@react-three/cannon** → Physics (cannon-es backend).
- **@react-three/rapier** → Physics (rapier backend, faster).

### Animation
- **@react-spring/three** → Spring-based animations in 3D.
- **gsap** → Timeline-based advanced animations.

### Effects
- **@react-three/postprocessing** → Bloom, SSAO, DoF, etc.
- **maath** → Math helpers for noise, easing, shaders.

### Models & Assets
- **three-stdlib** → Loaders (GLTF, FBX, HDRI, etc).
- **@react-three/gltfjsx** → Convert GLTF models into React components.

---

## 🛠 Usage

### Run the dev server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Example: add a spinning cube
Edit `src/App.jsx`:

```jsx
<mesh rotation={[0.4, 0.2, 0]}>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="orange" />
</mesh>
```

### Example: load a GLTF model
```jsx
import { useGLTF } from '@react-three/drei'

function Model() {
  const { scene } = useGLTF('/model.glb')
  return <primitive object={scene} />
}
```

### Example: physics with rapier
```jsx
import { Physics, RigidBody } from '@react-three/rapier'

function Scene() {
  return (
    <Physics>
      <RigidBody>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </RigidBody>
    </Physics>
  )
}
```

---

## 📚 Learn more

- R3F: https://docs.pmnd.rs/react-three-fiber
- Drei: https://docs.pmnd.rs/drei
- Leva: https://github.com/pmndrs/leva
- Rapier: https://rapier.rs
- Cannon: https://github.com/pmndrs/use-cannon
- React Spring: https://react-spring.dev
- GSAP: https://greensock.com/gsap
