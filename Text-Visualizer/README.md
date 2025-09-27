# 🚀 React Three Fiber 3D Starter

This project was auto-generated with **maker.py**.  
It comes with a full set of tools for building 3D/interactive apps.

---

## 🏃‍♂️ Quick Start

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
npm run clean  # Clean build files and node_modules
```

---

## 📦 Included Dependencies

### Core
- **three** → The 3D engine
- **@react-three/fiber** → React renderer for three.js
- **@react-three/drei** → Ready-made helpers (OrbitControls, Sky, Loader...)

### UI & Controls
- **leva** → Live control panel to tweak variables
- **zustand** → Simple global state management
- **@use-gesture/react** → Mouse/touch gestures

### Physics
- **@react-three/cannon** → Physics (cannon-es backend)
- **@react-three/rapier** → Physics (rapier backend, faster)

### Animation
- **@react-spring/three** → Spring-based animations in 3D
- **gsap** → Timeline-based advanced animations

### Effects
- **@react-three/postprocessing** → Bloom, SSAO, DoF, etc.
- **maath** → Math helpers for noise, easing, shaders

### Utilities
- **three-stdlib** → Loaders (GLTF, FBX, HDRI, etc)

---

## 🛠 Development Tips

### Project Structure
```
src/
├── components/     # React components
│   └── Scene.jsx   # Main 3D scene
├── App.jsx        # Main app component
├── main.jsx       # Entry point
└── index.css      # Global styles
```

### Example: Add a spinning sphere
Edit `src/components/Scene.jsx`:

```jsx
<mesh>
  <sphereGeometry args={[1, 32, 32]} />
  <meshStandardMaterial color="orange" />
</mesh>
```

### Example: Load a GLTF model
```jsx
import { useGLTF } from '@react-three/drei'

function Model() {
  const { scene } = useGLTF('/model.glb')
  return <primitive object={scene} />
}

// Don't forget to preload
useGLTF.preload('/model.glb')
```

### Example: Physics with Rapier
```jsx
import { Physics, RigidBody } from '@react-three/rapier'

function PhysicsScene() {
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

### Example: Animations with React Spring
```jsx
import { useSpring, animated } from '@react-spring/three'

function AnimatedBox() {
  const springs = useSpring({
    scale: [1, 1.2, 1],
    loop: true,
    config: { duration: 2000 }
  })

  return (
    <animated.mesh scale={springs.scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </animated.mesh>
  )
}
```

---

## 🎮 Controls

- **Left Mouse**: Rotate camera
- **Right Mouse**: Pan camera  
- **Scroll**: Zoom in/out
- **Leva Panel**: Adjust scene parameters in real-time

---

## 📚 Learn More

- [R3F Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Drei Documentation](https://docs.pmnd.rs/drei)
- [Leva Documentation](https://github.com/pmndrs/leva)
- [Three.js Documentation](https://threejs.org/docs)
- [React Spring Documentation](https://react-spring.dev)

---

## 🐛 Troubleshooting

### Common Issues

1. **Module resolution errors**: Clear node_modules and reinstall
   ```bash
   npm run clean && npm install
   ```

2. **Performance issues**: Enable Stats component to monitor FPS
   ```jsx
   import { Stats } from '@react-three/drei'
   // Add <Stats /> to your Canvas
   ```

3. **Memory leaks**: Always dispose of geometries and materials
   ```jsx
   useEffect(() => {
     return () => {
       geometry.dispose()
       material.dispose()
     }
   }, [])
   ```

---

Built with ❤️ using React Three Fiber
