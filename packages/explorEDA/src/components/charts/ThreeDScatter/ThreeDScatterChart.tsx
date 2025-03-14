import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ThreeDScatterChartProps } from "./types";

import { useDataLayer } from "@/providers/DataLayerProvider";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ThreeDScatterAxes } from "./ThreeDScatterAxes";
import { ThreeDScatterPoints } from "./ThreeDScatterPoints";
import { useThreeDScatterData } from "./useThreeDScatterData";

interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

export function ThreeDScatterChart({
  settings,
  width,
  height,
  facetIds,
}: ThreeDScatterChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number>(null);
  const cameraStateRef = useRef<CameraState>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateChart = useDataLayer((state) => state.updateChart);
  const data = useThreeDScatterData(settings, facetIds);
  const [nonce, setNonce] = useState(0);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || width <= 0 || height <= 0) {
      return;
    }

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.copy(settings.cameraPosition);
    camera.lookAt(settings.cameraTarget);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;
    controls.addEventListener("change", () => {
      if (!controls.object || !controls.target) {
        return;
      }
      cameraStateRef.current = {
        position: controls.object.position.clone(),
        target: controls.target.clone(),
      };

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        if (cameraStateRef.current) {
          updateChart(settings.id, {
            cameraPosition: cameraStateRef.current.position,
            cameraTarget: cameraStateRef.current.target,
          });
        }
      }, 1000);
    });

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Force initial render
    renderer.render(scene, camera);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    setNonce((state) => state + 1);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (controls) {
        controls.dispose();
      }
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [
    width,
    height,
    settings.cameraPosition,
    settings.cameraTarget,
    settings.id,
    updateChart,
  ]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (
        !rendererRef.current ||
        !cameraRef.current ||
        !sceneRef.current ||
        width <= 0 ||
        height <= 0
      ) {
        return;
      }

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
      // Force render on resize
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width, height]);

  // Render points and axes immediately when scene is ready
  useEffect(() => {
    // Force a render after adding points and axes
    if (
      !sceneRef.current ||
      !rendererRef.current ||
      !cameraRef.current ||
      width <= 0 ||
      height <= 0
    ) {
      return;
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [data, width, height]);

  return (
    <div ref={containerRef} style={{ width, height }}>
      {sceneRef.current && (
        <>
          <ThreeDScatterPoints
            scene={sceneRef.current}
            data={data}
            settings={settings}
            key={"points-" + nonce}
          />
          <ThreeDScatterAxes
            scene={sceneRef.current}
            settings={settings}
            key={"axes-" + nonce}
          />
        </>
      )}
    </div>
  );
}
