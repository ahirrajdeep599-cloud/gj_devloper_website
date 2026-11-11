"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroSphereCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect low-power or reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for mouse rotation
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Core Sphere: Icosahedron with Wireframe + Glowing Material
    const coreGeometry = new THREE.IcosahedronGeometry(2.1, 3);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0a1638,
      emissive: 0x101b44,
      roughness: 0.2,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    mainGroup.add(coreMesh);

    // 2. Inner Glowing Core: Solid sphere with deep neon glow
    const innerGeometry = new THREE.SphereGeometry(1.6, 32, 32);
    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0x030712,
      emissive: 0x0033aa,
      emissiveIntensity: 0.8,
      roughness: 0.4,
      metalness: 0.8,
    });
    const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
    mainGroup.add(innerSphere);

    // 3. Digital Vertex Nodes (Point Cloud on Sphere Vertices)
    const pointsGeometry = new THREE.IcosahedronGeometry(2.12, 3);
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const vertexPoints = new THREE.Points(pointsGeometry, pointsMaterial);
    mainGroup.add(vertexPoints);

    // 4. Outer Orbital Gyro Rings
    const ring1Geometry = new THREE.TorusGeometry(2.8, 0.018, 16, 100);
    const ring1Material = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0066ff,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ring1Geometry, ring1Material);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ring2Geometry = new THREE.TorusGeometry(3.1, 0.015, 16, 100);
    const ring2Material = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.7,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.6,
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    mainGroup.add(ring2);

    // 5. Ambient Swarm Particles
    const particleCount = 400;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x38bdf8); // electric blue
    const color2 = new THREE.Color(0xa855f7); // neon violet

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.6 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = color1.clone().lerp(color2, Math.random());
      particleColors[i * 3] = mixedColor.r;
      particleColors[i * 3 + 1] = mixedColor.g;
      particleColors[i * 3 + 2] = mixedColor.b;
    }

    const swarmGeometry = new THREE.BufferGeometry();
    swarmGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    swarmGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const swarmMaterial = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const swarmPoints = new THREE.Points(swarmGeometry, swarmMaterial);
    mainGroup.add(swarmPoints);

    // Lighting: Electric Blue & Neon Violet lights
    const blueLight = new THREE.PointLight(0x0066ff, 3.5, 50);
    blueLight.position.set(4, 3, 4);
    scene.add(blueLight);

    const violetLight = new THREE.PointLight(0xa855f7, 3.8, 50);
    violetLight.position.set(-4, -3, 3);
    scene.add(violetLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 2.0, 30);
    cyanLight.position.set(0, 5, -2);
    scene.add(cyanLight);

    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    scene.add(ambientLight);

    // Mouse Tracking with Smooth Inertia
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (event.clientX / innerWidth) * 2 - 1;
      const y = -(event.clientY / innerHeight) * 2 + 1;
      targetRotationY = x * 0.7;
      targetRotationX = -y * 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth inertia lerp for mouse orientation
      if (!prefersReducedMotion) {
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;
        currentRotationY += (targetRotationY - currentRotationY) * 0.05;
        mainGroup.rotation.x = currentRotationX + Math.sin(elapsedTime * 0.3) * 0.08;
        mainGroup.rotation.y = currentRotationY + elapsedTime * 0.15;
      } else {
        mainGroup.rotation.y = elapsedTime * 0.05;
      }

      // Independent ring rotations
      ring1.rotation.z = elapsedTime * 0.2;
      ring2.rotation.x = -Math.PI / 6 + Math.sin(elapsedTime * 0.3) * 0.2;
      ring2.rotation.z = -elapsedTime * 0.25;

      // Swarm oscillation
      swarmPoints.rotation.y = -elapsedTime * 0.08;
      swarmPoints.rotation.x = Math.sin(elapsedTime * 0.15) * 0.1;

      // Subtle breathing pulse on the core
      const scalePulse = 1 + Math.sin(elapsedTime * 1.2) * 0.02;
      coreMesh.scale.set(scalePulse, scalePulse, scalePulse);
      vertexPoints.scale.set(scalePulse, scalePulse, scalePulse);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      // Clean up Three.js resources
      coreGeometry.dispose();
      coreMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      ring1Geometry.dispose();
      ring1Material.dispose();
      ring2Geometry.dispose();
      ring2Material.dispose();
      swarmGeometry.dispose();
      swarmMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[420px] md:min-h-[550px] lg:min-h-[640px] flex items-center justify-center cursor-grab active:cursor-grabbing"
      aria-hidden="true"
    >
      {/* Background radial glow specifically underneath the 3D sphere */}
      <div className="absolute w-[300px] md:w-[420px] h-[300px] md:h-[420px] rounded-full bg-gradient-to-tr from-blue-600/25 via-violet-600/20 to-cyan-400/20 blur-3xl pointer-events-none -z-10" />
    </div>
  );
}
