import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js";

const gallery = document.getElementById("hostedModelGallery");
const models = Array.isArray(window.PORTFOLIO_MODELS) ? window.PORTFOLIO_MODELS : [];
let activeCard = null;
let activeViewer = null;
let activeModel = null;
let animationFrame = 0;

function disposeObject(object) {
  object?.traverse?.(child => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach(material => {
        for (const key in material) if (material[key]?.isTexture) material[key].dispose();
        material.dispose();
      });
    }
  });
}
function stopViewer() {
  cancelAnimationFrame(animationFrame);
  if (activeViewer) {
    activeViewer.controls?.dispose();
    activeViewer.observer?.disconnect();
    activeViewer.renderer?.dispose();
    activeViewer.renderer?.domElement?.remove();
  }
  disposeObject(activeModel);
  activeViewer = null;
  activeModel = null;
}
function loadObject(model) {
  const ext = (model.file || "").split(".").pop().toLowerCase();
  if (ext === "fbx") return new FBXLoader().loadAsync(model.file);
  if (ext === "glb" || ext === "gltf") return new GLTFLoader().loadAsync(model.file).then(gltf => gltf.scene);
  throw new Error(`Unsupported model format .${ext}. Use FBX, GLB, or GLTF.`);
}
function initViewer(host, object) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0b0e14");
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x30394c, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.7); key.position.set(5, 8, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xb6d1ff, 1.2); rim.position.set(-5, 3, -4); scene.add(rim);
  const grid = new THREE.GridHelper(10, 20, 0x465164, 0x252d3a); grid.position.y = 0; scene.add(grid);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.07;
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) throw new Error("The model file contains no visible geometry.");
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);
  const centeredBox = new THREE.Box3().setFromObject(object);
  object.position.y -= centeredBox.min.y;
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const distance = maxDim * 2.2;
  camera.position.set(distance, distance * 0.7, distance);
  controls.target.set(0, Math.max(size.y * 0.42, 0.05), 0);
  controls.minDistance = maxDim * 0.03; controls.maxDistance = maxDim * 30;
  camera.near = Math.max(maxDim / 1000, 0.001); camera.far = Math.max(maxDim * 100, 1000); camera.updateProjectionMatrix();
  controls.update(); scene.add(object);
  object.traverse(child => {
    if (child.isMesh) {
      if (!child.material) child.material = new THREE.MeshStandardMaterial({ color: 0xb8c3d5, roughness: 0.65 });
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach(m => { if (m.map) m.map.colorSpace = THREE.SRGBColorSpace; });
    }
  });
  const resize = () => {
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  activeViewer = { scene, camera, renderer, controls, observer };
  function animate() {
    animationFrame = requestAnimationFrame(animate);
    controls.update(); renderer.render(scene, camera);
  }
  animate();
}
async function selectModel(model, card, button) {
  if (activeCard === card && card.querySelector(".inline-model-viewer")) {
    stopViewer(); card.querySelector(".inline-model-viewer")?.remove();
    card.classList.remove("is-expanded"); button.textContent = "View in 3D"; activeCard = null; return;
  }
  if (activeCard) {
    activeCard.querySelector(".inline-model-viewer")?.remove();
    activeCard.classList.remove("is-expanded");
    const oldButton = activeCard.querySelector(".model-view-button"); if (oldButton) oldButton.textContent = "View in 3D";
  }
  stopViewer(); activeCard = card; card.classList.add("is-expanded"); button.textContent = "Close 3D View";
  const panel = document.createElement("div"); panel.className = "inline-model-viewer";
  const status = document.createElement("p"); status.className = "model-load-status"; status.textContent = `Loading ${model.title || "model"}…`;
  const canvasHost = document.createElement("div"); canvasHost.className = "inline-model-canvas";
  panel.append(status, canvasHost); card.appendChild(panel);
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  try {
    const object = await loadObject(model);
    if (activeCard !== card) { disposeObject(object); return; }
    activeModel = object; initViewer(canvasHost, object); status.remove();
  } catch (error) {
    console.error("Could not load hosted model:", model.file, error);
    status.classList.add("model-load-error");
    status.textContent = `Could not load this model. Check that ${model.file} exists in the repository and that any required textures are included. ${error.message || ""}`;
  }
}
function renderGallery() {
  if (!gallery) return;
  gallery.replaceChildren();
  if (!models.length) { gallery.textContent = "No models are configured in js/hosted-models.js."; return; }
  models.forEach((model, index) => {
    const card = document.createElement("article"); card.className = "hosted-model-card";
    const title = document.createElement("h3"); title.textContent = model.title || `3D Model ${index + 1}`;
    const description = document.createElement("p"); description.textContent = model.description || "Interactive 3D model.";
    const format = document.createElement("div"); format.className = "model-format"; format.textContent = `BROWSER 3D · ${(model.file || "").split(".").pop().toUpperCase()}`;
    const button = document.createElement("button"); button.type = "button"; button.className = "button primary model-view-button"; button.textContent = "View in 3D";
    button.addEventListener("click", () => selectModel(model, card, button));
    card.append(title, description, format, button); gallery.appendChild(card);
  });
}
renderGallery();
