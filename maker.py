# -*- coding: utf-8 -*-

#!/usr/bin/env python3
"""
Automatic React Three Fiber 3D Project Creator
----------------------------------------------
Creates a React + Vite + Three.js project with
tons of useful 3D dependencies pre-installed.

Usage:
    python maker.py my-project [--skip-install] [--skip-audit] [--skip-dev-server]
"""

import sys
import json
import subprocess
import argparse
import os
from pathlib import Path
from textwrap import dedent
import time

# ✅ Updated versions that are more compatible
PROJECT_TEMPLATE = {
    "name": "",
    "version": "0.0.1",
    "private": True,
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview",
        "lint": "eslint src --ext js,jsx,ts,tsx",
        "clean": "rm -rf dist node_modules package-lock.json"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "three": "^0.160.0",  # Updated version
        "@react-three/fiber": "^8.15.19",
        "@react-three/drei": "^9.88.13",  # More stable version
        "leva": "^0.9.35",
        "zustand": "^4.5.5",
        "@use-gesture/react": "^10.3.1",
        "@react-three/cannon": "^6.6.0",
        "@react-three/rapier": "^1.4.0",
        "@react-spring/three": "^9.7.3",
        "gsap": "^3.12.5",
        "@react-three/postprocessing": "^2.16.2",
        "maath": "^0.10.7",
        "three-stdlib": "^2.29.9"
        # Removed @react-three/gltfjsx as it causes vulnerabilities
    },
    "devDependencies": {
        "vite": "^5.0.12",  # Stable version
        "@vitejs/plugin-react": "^4.2.1",
        "eslint": "^8.57.0",
        "eslint-plugin-react": "^7.34.1",
        "eslint-plugin-react-hooks": "^4.6.0"
    }
}

VITE_CONFIG_JS = '''\
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei']
  }
})
'''

INDEX_HTML = '''\
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Three Fiber 3D App</title>
    <meta name="description" content="A React Three Fiber 3D application" />
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
import { OrbitControls, GizmoHelper, GizmoViewport, Stats, Environment } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import { Suspense } from 'react'
import Scene from './components/Scene'

function App() {
  const { showStats, showGizmo } = useControls({
    showStats: { value: true },
    showGizmo: { value: true }
  })

  return (
    <div id="canvas-container">
      <Leva />
      {showStats && <Stats />}
      
      <Canvas 
        shadows 
        camera={{ position: [5, 5, 5], fov: 60 }} 
        style={{ height: '100vh', width: '100vw' }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" />
          
          {showGizmo && (
            <GizmoHelper alignment='bottom-right' margin={[80, 80]}>
              <GizmoViewport />
            </GizmoHelper>
          )}

          {/* Controls */}
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

          {/* Scene */}
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default App
'''

SCENE_JSX = '''\
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'

function Scene() {
  const meshRef = useRef()
  
  const { 
    cubeColor, 
    cubeScale, 
    autoRotate, 
    showHelpers 
  } = useControls('Scene', {
    cubeColor: '#ff6b6b',
    cubeScale: { value: 1, min: 0.1, max: 3 },
    autoRotate: true,
    showHelpers: true
  })

  const { ambientIntensity, directionalIntensity } = useControls('Lighting', {
    ambientIntensity: { value: 0.5, min: 0, max: 2 },
    directionalIntensity: { value: 1, min: 0, max: 3 }
  })

  useFrame((state, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <>
      {/* Helpers */}
      {showHelpers && (
        <>
          <gridHelper args={[20, 20, '#ff22aa', '#55ccff']} />
          <axesHelper args={[10]} />
        </>
      )}

      {/* Sample cube */}
      <mesh 
        ref={meshRef}
        scale={cubeScale}
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={cubeColor} />
      </mesh>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2c2c2c" />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={directionalIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  )
}

export default Scene
'''

INDEX_CSS = '''\
html, body, #root {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  background: #0b1020;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

#canvas-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
}

/* Loading indicator */
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 18px;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #777;
}
'''

ESLINT_CONFIG = '''\
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "react-hooks"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
'''

GITIGNORE = '''\
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Coverage
coverage/

# Temporary files
.tmp/
.temp/
'''

README = '''\
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
'''

def run(cmd, cwd=None, check=True):
    """Run a command with better error handling"""
    print(f"📟 {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, check=check, 
                              capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return result
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Command failed: {e}")
        if e.stdout:
            print("STDOUT:", e.stdout)
        if e.stderr:
            print("STDERR:", e.stderr)
        if check:
            raise
        return e

def write_file(path: Path, content: str):
    """Write file with UTF-8 encoding and create directories"""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(dedent(content), encoding="utf-8")
    print(f"✅ Created {path}")

def check_node_npm():
    """Check if Node.js and npm are installed with better PATH detection"""
    # Common Node.js installation paths on Windows
    common_paths = [
        r"C:\Program Files\nodejs",
        r"C:\Program Files (x86)\nodejs", 
        os.path.expanduser("~\\AppData\\Roaming\\npm"),
        os.path.expanduser("~\\scoop\\apps\\nodejs\\current"),
        os.path.expanduser("~\\AppData\\Local\\Programs\\Microsoft VS Code\\bin")
    ]
    
    def try_command(cmd):
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True, shell=True)
            return result.stdout.strip()
        except:
            return None
    
    # First try normal method
    node_version = try_command("node --version")
    npm_version = try_command("npm --version")
    
    if node_version and npm_version:
        print(f"✅ Node.js {node_version}")
        print(f"✅ npm {npm_version}")
        return True
    
    # If that fails, try with full paths
    print("🔍 Searching for Node.js in common locations...")
    
    for path in common_paths:
        if os.path.exists(path):
            print(f"   Found: {path}")
            # Try with this path
            node_cmd = f'"{os.path.join(path, "node.exe")}" --version' if os.name == 'nt' else f'"{os.path.join(path, "node")}" --version'
            npm_cmd = f'"{os.path.join(path, "npm.cmd")}" --version' if os.name == 'nt' else f'"{os.path.join(path, "npm")}" --version'
            
            node_version = try_command(node_cmd)
            npm_version = try_command(npm_cmd)
            
            if node_version and npm_version:
                print(f"✅ Found Node.js {node_version} at {path}")
                print(f"✅ Found npm {npm_version}")
                return True
    
    # Last resort - check if we're in a directory with node_modules
    if os.path.exists("node_modules"):
        print("⚠️  Node.js not found in PATH, but node_modules exists.")
        print("   Assuming Node.js is available. Proceeding...")
        return True
    
    # Final attempt - try PowerShell on Windows
    if os.name == 'nt':
        print("🔍 Trying PowerShell...")
        ps_node = try_command('powershell "node --version"')
        ps_npm = try_command('powershell "npm --version"')
        
        if ps_node and ps_npm:
            print(f"✅ Node.js {ps_node} (via PowerShell)")
            print(f"✅ npm {ps_npm} (via PowerShell)")
            return True
    
    print("❌ Node.js and/or npm not found in PATH or common locations.")
    print("\n🛠️  Troubleshooting steps:")
    print("   1. Open Command Prompt/Terminal and try: node --version")
    print("   2. If that works, the issue might be with Python's subprocess")
    print("   3. Try adding Node.js to your PATH environment variable")
    print("   4. Common Node.js locations:")
    for path in common_paths:
        print(f"      - {path}")
    print("   5. Restart your terminal after PATH changes")
    print("\n   You can also use --skip-install to create the project without installing dependencies")
    return False

def install_dependencies(project_dir: Path, skip_audit: bool = False):
    """Install npm dependencies with better error handling"""
    print("\n📦 Installing npm packages (this may take a few minutes)...\n")
    
    # First, try regular install
    result = run("npm install", cwd=str(project_dir), check=False)
    
    if result.returncode != 0:
        print("❌ npm install failed. Trying with --legacy-peer-deps...")
        result = run("npm install --legacy-peer-deps", cwd=str(project_dir), check=False)
        
        if result.returncode != 0:
            print("❌ npm install failed even with --legacy-peer-deps")
            return False
    
    # Handle audit fixes more gracefully
    if not skip_audit:
        print("\n🔧 Checking for vulnerabilities...")
        audit_result = run("npm audit", cwd=str(project_dir), check=False)
        
        if audit_result.returncode != 0:
            print("⚠️  Some vulnerabilities found. Attempting to fix...")
            fix_result = run("npm audit fix", cwd=str(project_dir), check=False)
            
            if fix_result.returncode != 0:
                print("⚠️  Some vulnerabilities couldn't be auto-fixed.")
                print("   This is normal for development dependencies.")
                print("   Run 'npm audit' later to review if needed.")
        else:
            print("✅ No vulnerabilities found!")
    
    return True

def main():
    parser = argparse.ArgumentParser(description='Create a React Three Fiber 3D project')
    parser.add_argument('name', help='Project name')
    parser.add_argument('--skip-install', action='store_true', help='Skip npm install')
    parser.add_argument('--skip-audit', action='store_true', help='Skip vulnerability audit')
    parser.add_argument('--skip-dev-server', action='store_true', help='Skip starting dev server')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    name = args.name
    project_dir = Path(name).resolve()

    # Validation
    if project_dir.exists() and any(project_dir.iterdir()):
        print(f"❌ Directory {project_dir} already exists and is not empty.")
        print(f"   Use a different name or remove the existing directory.")
        sys.exit(1)
    
    # Check prerequisites
    if not args.skip_install and not check_node_npm():
        sys.exit(1)

    print(f"\n🚀 Creating React Three Fiber 3D project: {name}")
    print(f"📁 Location: {project_dir}\n")

    # Create directory structure
    (project_dir / "src" / "components").mkdir(parents=True, exist_ok=True)

    # Generate package.json
    pkg = PROJECT_TEMPLATE.copy()
    pkg["name"] = name
    (project_dir / "package.json").write_text(json.dumps(pkg, indent=2))
    print(f"✅ Created package.json")

    # Write all project files
    files_to_create = [
        ("vite.config.js", VITE_CONFIG_JS),
        ("index.html", INDEX_HTML),
        ("src/main.jsx", MAIN_JSX),
        ("src/App.jsx", APP_JSX),
        ("src/components/Scene.jsx", SCENE_JSX),
        ("src/index.css", INDEX_CSS),
        (".eslintrc.json", ESLINT_CONFIG),
        (".gitignore", GITIGNORE),
        ("README.md", README),
    ]
    
    for file_path, content in files_to_create:
        write_file(project_dir / file_path, content)

    # Install dependencies
    if not args.skip_install:
        success = install_dependencies(project_dir, args.skip_audit)
        if not success:
            print("\n❌ Installation failed. You can try installing manually:")
            print(f"   cd {name}")
            print("   npm install --legacy-peer-deps")
            sys.exit(1)
    else:
        print("\n⏭️  Skipped npm install")

    # Success message
    print(f"\n🎉 Project '{name}' created successfully!")
    print(f"\n📋 Next steps:")
    print(f"   cd {name}")
    if args.skip_install:
        print(f"   npm install")
    print(f"   npm run dev")
    
    print(f"\n🔗 Useful commands:")
    print(f"   npm run dev      # Start development server")
    print(f"   npm run build    # Build for production")
    print(f"   npm run lint     # Run linter")
    print(f"   npm run clean    # Clean project")

    # Start dev server
    if not args.skip_dev_server and not args.skip_install:
        print(f"\n▶️  Starting development server in 3 seconds...")
        time.sleep(3)
        try:
            run("npm run dev", cwd=str(project_dir))
        except KeyboardInterrupt:
            print("\n👋 Development server stopped. Happy coding!")
        except subprocess.CalledProcessError:
            print(f"\n⚠️  Failed to start dev server. You can start it manually:")
            print(f"   cd {name} && npm run dev")


if __name__ == "__main__":
    main()