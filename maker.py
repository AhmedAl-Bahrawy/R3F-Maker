# -*- coding: utf-8 -*-

#!/usr/bin/env python3
"""
Automatic React Three Fiber 3D Project Creator
----------------------------------------------
Creates a React + Vite + Three.js project with
tons of useful 3D dependencies pre-installed.

Usage:
    python maker.py my-project
"""

import sys
import json
import subprocess
from pathlib import Path
from textwrap import dedent

# ✅ Pre-tested versions that exist on npm
PROJECT_TEMPLATE = {
    "name": "",
    "version": "0.0.1",
    "private": True,
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "three": "^0.158.0",
        "@react-three/fiber": "^8.15.15",
        "@react-three/drei": "^9.111.3",
        "leva": "^0.9.34",
        "zustand": "^4.5.5",
        "@use-gesture/react": "^10.3.1",
        "react-use-gesture": "^9.1.3",
        "@react-three/cannon": "^6.5.0",
        "@react-three/rapier": "^1.3.0",
        "@react-spring/three": "^9.7.3",
        "gsap": "^3.12.5",
        "@react-three/postprocessing": "^2.15.10",
        "maath": "^0.10.4",
        "three-stdlib": "^2.30.3",
        "@react-three/gltfjsx": "^4.3.3"
    },
    "devDependencies": {
        "vite": "^5.4.10",
        "@vitejs/plugin-react": "^4.3.2"
    }
}

VITE_CONFIG_JS = '''\
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    open: true
  }
})
'''

INDEX_HTML = '''\
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Three Fiber Starter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
'''

MAIN_JSX = '''\
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
'''

APP_JSX = '''\
import { Canvas } from '@react-three/fiber'
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { Leva } from 'leva'

function App() {
  return (
    <div id="canvas-container">
      <Leva />
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 60 }} style={{ height: '100vh', width: '100vw' }}>
        <GizmoHelper alignment='bottom-right' margin={[80, 80]}>
          <GizmoViewport />
        </GizmoHelper>

        {/* Helpers */}
        <gridHelper args={[20, 20, 0xff22aa, 0x55ccff]} />
        <axesHelper args={[10]} />

        {/* Controls */}
        <OrbitControls />

        {/* Sample cube */}
        <mesh rotation={[0.4, 0.2, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
      </Canvas>
    </div>
  )
}

export default App
'''

INDEX_CSS = '''\
html, body, #root {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  background: #0b1020;
  color: #fff;
}
#canvas-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
'''

README = '''\
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
'''

def run(cmd, cwd=None):
    print(f"> {cmd}")
    return subprocess.run(cmd, shell=True, cwd=cwd, check=True)

def write_file(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(dedent(content), encoding="utf-8")  # ✅ Force UTF-8
    print(f"created {path}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python maker.py my-project")
        sys.exit(1)

    name = sys.argv[1]
    project_dir = Path(name).resolve()

    if project_dir.exists() and any(project_dir.iterdir()):
        print(f"ERROR: Directory {project_dir} already exists and is not empty.")
        sys.exit(1)

    print(f"🚀 Creating React Three Fiber 3D project: {name}\n")

    (project_dir / "src").mkdir(parents=True, exist_ok=True)

    pkg = PROJECT_TEMPLATE.copy()
    pkg["name"] = name
    (project_dir / "package.json").write_text(json.dumps(pkg, indent=2))

    write_file(project_dir / "vite.config.js", VITE_CONFIG_JS)
    write_file(project_dir / "index.html", INDEX_HTML)
    write_file(project_dir / "src" / "main.jsx", MAIN_JSX)
    write_file(project_dir / "src" / "App.jsx", APP_JSX)
    write_file(project_dir / "src" / "index.css", INDEX_CSS)
    write_file(project_dir / "README.md", README)

    print("\n📦 Installing npm packages (this may take a few minutes)...\n")
    run("npm install", cwd=str(project_dir))

    print("\n🔧 Fixing vulnerabilities...\n")
    run("npm audit fix --force", cwd=str(project_dir))

    print("\n▶️ Starting dev server...\n")
    run("npm run dev", cwd=str(project_dir))


if __name__ == "__main__":
    main()