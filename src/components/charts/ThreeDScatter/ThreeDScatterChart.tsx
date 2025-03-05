import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ThreeDScatterChartProps } from "./types";

import { useDataLayer } from "@/providers/DataLayerProvider";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ThreeDScatterAxes } from "./ThreeDScatterAxes";
import { ThreeDScatterPoints } from "./ThreeDScatterPoints";
import { useThreeDScatterData } from "./useThreeDScatterData";

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

  const updateChart = useDataLayer((state) => state.updateChart);
  const data = useThreeDScatterData(settings, facetIds);

  console.log("3d scatter data", data);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) {
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.copy(settings.cameraTarget);
    controls.addEventListener("change", () => {
      // console.log("change");
      // if (camera.position && controls.target) {
      //   updateChart(settings.id, {
      //     cameraPosition: camera.position.clone(),
      //     cameraTarget: controls.target.clone(),
      //   });
      // }
    });
    controlsRef.current = controls;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

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
      if (!rendererRef.current || !cameraRef.current) {
        return;
      }

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width, height]);

  return (
    <div ref={containerRef}>
      {sceneRef.current && (
        <>
          <ThreeDScatterPoints
            scene={sceneRef.current}
            data={data}
            settings={settings}
          />
          <ThreeDScatterAxes scene={sceneRef.current} settings={settings} />
        </>
      )}
    </div>
  );
}
