import { Canvas } from "@react-three/fiber";
import { GizmoHelper, GizmoViewport, ScrollControls } from "@react-three/drei";
import { Leva } from "leva";
import Experience from "./components/Experience";

function App() {
  return (
    <div id="canvas-container">
      <Leva />
      <Canvas shadows style={{ height: "100vh", width: "100vw" }}>
        <GizmoHelper alignment="bottom-right" margin={[500, 500]}>
          <GizmoViewport />
        </GizmoHelper>

        {/* Helpers */}
        <gridHelper args={[500, 500, 0xff22aa, 0x55ccff]} />
        <axesHelper args={[10]} />

        {/* Controls */}
        <ScrollControls pages={5} damping={0.3}>
          {/* Experience */}
          <Experience />
        </ScrollControls>

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
      </Canvas>
    </div>
  );
}

export default App;
