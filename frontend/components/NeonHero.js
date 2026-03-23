import { useEffect, useRef } from 'react';

export default function NeonHero() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let THREE, renderer, scene, camera, animationId;

    const init = async () => {
      THREE = await import('three');
      const mount = mountRef.current;
      if (!mount) return;

      const W = mount.clientWidth;
      const H = mount.clientHeight;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
      camera.position.z = 8;

      // Neon objects
      const objects = [];

      // Floating torus rings
      const torusGeo = new THREE.TorusGeometry(1.2, 0.05, 16, 80);
      const colors = [0x00f0ff, 0xbf00ff, 0xff00aa, 0x00ff88];

      for (let i = 0; i < 4; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length] });
        const torus = new THREE.Mesh(torusGeo, mat);
        torus.position.set(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4
        );
        torus.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        torus.userData = {
          rotX: (Math.random() - 0.5) * 0.01,
          rotY: (Math.random() - 0.5) * 0.01,
          floatOffset: Math.random() * Math.PI * 2,
          floatSpeed: 0.3 + Math.random() * 0.4
        };
        scene.add(torus);
        objects.push(torus);
      }

      // Icosahedrons
      for (let i = 0; i < 3; i++) {
        const geo = new THREE.IcosahedronGeometry(0.4 + Math.random() * 0.4, 0);
        const mat = new THREE.MeshBasicMaterial({
          color: colors[i % colors.length],
          wireframe: true
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4
        );
        mesh.userData = {
          rotX: (Math.random() - 0.5) * 0.02,
          rotY: (Math.random() - 0.5) * 0.02,
          floatOffset: Math.random() * Math.PI * 2,
          floatSpeed: 0.2 + Math.random() * 0.3
        };
        scene.add(mesh);
        objects.push(mesh);
      }

      // Particle field
      const particleGeo = new THREE.BufferGeometry();
      const count = 200;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 30;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.05, transparent: true, opacity: 0.6 });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      let t = 0;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        t += 0.016;

        objects.forEach(obj => {
          obj.rotation.x += obj.userData.rotX;
          obj.rotation.y += obj.userData.rotY;
          obj.position.y += Math.sin(t * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.002;
        });

        particles.rotation.y += 0.0005;
        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!mount) return;
        const W = mount.clientWidth;
        const H = mount.clientHeight;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
      };
      window.addEventListener('resize', handleResize);
    };

    init();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer && mountRef.current) {
        try { mountRef.current.removeChild(renderer.domElement); } catch (e) {}
        renderer.dispose();
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" />;
}
