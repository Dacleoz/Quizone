import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import song from "./champions.mp3";

export default function showWinner(name) {
  const el = document.createElement("div");
  el.className = "winner";
  el.innerHTML = '<canvas></canvas><button class="btn ghost back">← Classifica</button><h2></h2>';
  el.querySelector("h2").textContent = name + " HAI VINTO!";
  document.body.append(el);
  history.pushState(null, ""); // browser/phone back returns to the leaderboard

  const audio = new Audio(song);
  audio.play().catch(() => {});

  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const renderer = new THREE.WebGLRenderer({ canvas: el.querySelector("canvas"), antialias: true, alpha: true });
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment()).texture;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 1.6, 7);

  const gold = new THREE.MeshStandardMaterial({ color: css("--gold"), metalness: 1, roughness: 0.25, side: THREE.DoubleSide });
  const cup = new THREE.Group();
  const profile = [[0, 0], [0.8, 0], [0.8, 0.15], [0.45, 0.3], [0.14, 0.45], [0.12, 1], [0.3, 1.2], [0.75, 1.55], [0.95, 2.1], [1, 2.7]];
  cup.add(new THREE.Mesh(new THREE.LatheGeometry(profile.map(([x, y]) => new THREE.Vector2(x, y)), 64), gold));
  for (const s of [-1, 1]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.07, 16, 32, Math.PI), gold);
    handle.position.set(s * 0.95, 2.05, 0);
    handle.rotation.z = -s * Math.PI / 2;
    cup.add(handle);
  }
  cup.position.y = 0.5;
  scene.add(cup);

  const N = 250, colors = ["--gold", "--accent", "--blue", "--ok", "--bad"].map((v) => new THREE.Color(css(v)));
  const bits = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.14, 0.07), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), N);
  const parts = Array.from({ length: N }, (_, i) => {
    bits.setColorAt(i, colors[i % colors.length]);
    return { p: new THREE.Vector3((Math.random() - 0.5) * 12, Math.random() * 10, (Math.random() - 0.5) * 4), r: new THREE.Euler(), v: 0.01 + Math.random() * 0.02 };
  });
  scene.add(bits);

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1);
  const resize = () => { renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(devicePixelRatio); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  resize();
  addEventListener("resize", resize);

  renderer.setAnimationLoop((t) => {
    cup.rotation.y = t / 1500;
    parts.forEach((c, i) => {
      c.p.y -= c.v;
      if (c.p.y < -4) c.p.y = 6;
      c.r.x += 0.05; c.r.y += 0.03;
      bits.setMatrixAt(i, m.compose(c.p, q.setFromEuler(c.r), one));
    });
    bits.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  });

  const close = () => {
    audio.pause();
    renderer.setAnimationLoop(null);
    renderer.dispose();
    removeEventListener("resize", resize);
    removeEventListener("keydown", onKey);
    removeEventListener("popstate", close);
    el.remove();
  };
  const onKey = (ev) => ev.key === "Escape" && history.back();
  el.querySelector(".back").addEventListener("click", () => history.back());
  addEventListener("keydown", onKey);
  addEventListener("popstate", close);
}
