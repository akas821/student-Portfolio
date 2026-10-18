import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/STLLoader.js";
import { PLYLoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/PLYLoader.js";

const host = document.getElementById("viewer");
if (host) {
  const input = document.getElementById("modelInput");
  const dropZone = document.getElementById("viewerDropZone");
  const emptyState = document.getElementById("viewerEmpty");
  const status = document.getElementById("modelStatus");
  const help = document.getElementById("modelHelp");
  const resetButton = document.getElementById("resetView");
  const clearButton = document.getElementById("clearModel");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0b0e14");
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000);
  camera.position.set(3, 2.5, 4);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x30394c, 2.1));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.7);
  keyLight.position.set(5, 8, 6); scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xb6d1ff, 1.2);
  rimLight.position.set(-5, 3, -4); scene.add(rimLight);

  const grid = new THREE.GridHelper(10, 20, 0x465164, 0x252d3a);
  grid.position.y = -0.002; scene.add(grid);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.07;
  controls.target.set(0, 0.5, 0); controls.minDistance = 0.05; controls.maxDistance = 10000;

  let currentModel = null;
  let initialCamera = null;
  let initialTarget = null;
  let loadingToken = 0;
  const resize = () => {
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    camera.aspect = width / height; camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  new ResizeObserver(resize).observe(host);
  resize();

  function disposeModel(object) {
    object.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(material => {
          for (const key in material) {
            const value = material[key];
            if (value && value.isTexture) value.dispose();
          }
          material.dispose();
        });
      }
    });
  }
  function clearCurrent() {
    if (currentModel) { scene.remove(currentModel); disposeModel(currentModel); currentModel = null; }
    emptyState.style.display = "flex";
    status.textContent = "No model loaded";
    help.textContent = "Choose a model file to inspect it. For GLTF files that reference external textures, use a self-contained .glb when possible.";
  }
  function centerAndFit(object) {
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) throw new Error("The file loaded, but it contains no visible geometry.");
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);
    // Keep the model above the grid while centering it horizontally.
    const centeredBox = new THREE.Box3().setFromObject(object);
    object.position.y -= centeredBox.min.y;
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const distance = maxDimension * 2.1;
    camera.position.set(distance * 0.9, distance * 0.65, distance * 0.9);
    controls.target.set(0, size.y * 0.45, 0);
    camera.near = Math.max(maxDimension / 1000, 0.001);
    camera.far = Math.max(maxDimension * 100, 1000);
    camera.updateProjectionMatrix();
    controls.minDistance = maxDimension * 0.03;
    controls.maxDistance = maxDimension * 30;
    controls.update();
    initialCamera = camera.position.clone();
    initialTarget = controls.target.clone();
  }
  function createLoader(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    const url = URL.createObjectURL(file);
    if (ext === "fbx") return { url, load: () => new FBXLoader().loadAsync(url) };
    if (ext === "glb" || ext === "gltf") return { url, load: async () => {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(url);
      return gltf.scene;
    }};
    if (ext === "obj") return { url, load: () => new OBJLoader().loadAsync(url) };
    if (ext === "stl") return { url, load: async () => {
      const geometry = await new STLLoader().loadAsync(url);
      geometry.computeVertexNormals();
      return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xb8c3d5, metalness: 0.18, roughness: 0.55 }));
    }};
    if (ext === "ply") return { url, load: async () => {
      const geometry = await new PLYLoader().loadAsync(url);
      if (geometry.hasAttribute("color")) {
        geometry.computeVertexNormals();
        return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.05, roughness: 0.7 }));
      }
      geometry.computeVertexNormals();
      return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xb8c3d5, metalness: 0.15, roughness: 0.6 }));
    }};
    URL.revokeObjectURL(url);
    throw new Error("Unsupported file type. Choose FBX, GLB, GLTF, OBJ, STL, or PLY.");
  }
  async function loadFile(file) {
    if (!file) return;
    const token = ++loadingToken;
    status.textContent = `Loading ${file.name}…`;
    help.textContent = "Loading model. Large files can take a moment.";
    let resource;
    try {
      resource = createLoader(file);
      const object = await resource.load();
      if (token !== loadingToken) { disposeModel(object); return; }
      if (currentModel) { scene.remove(currentModel); disposeModel(currentModel); }
      currentModel = object;
      // A neutral fallback material helps models that have no embedded material.
      currentModel.traverse(child => {
        if (child.isMesh) {
          if (!child.material) child.material = new THREE.MeshStandardMaterial({ color: 0xb8c3d5, roughness: 0.65 });
          if (child.material && child.material.map) child.material.map.colorSpace = THREE.SRGBColorSpace;
          child.castShadow = false; child.receiveShadow = false;
        }
      });
      scene.add(currentModel);
      centerAndFit(currentModel);
      emptyState.style.display = "none";
      status.textContent = `Loaded: ${file.name}`;
      help.textContent = "Drag to orbit, scroll to zoom, and right-drag (or two-finger drag) to pan.";
    } catch (error) {
      console.error(error);
      status.textContent = "Could not load model";
      const message = error?.message || "The file could not be read. Try exporting it as .glb or check the file.";
      help.textContent = `${message} If this is an FBX with external textures, those texture files are not automatically loaded; try exporting a self-contained .glb from Blender or Maya.`;

    } finally {
      if (resource?.url) URL.revokeObjectURL(resource.url);
    }
  }
  async function loadHostedModel(model) {
    if (!model || !model.file) return;
    const token = ++loadingToken;
    status.textContent = `Loading ${model.title}…`;
    help.textContent = "Loading the model from the website. Large models may take a moment.";
    try {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(model.file);
      const object = gltf.scene;
      if (token !== loadingToken) { disposeModel(object); return; }
      if (currentModel) { scene.remove(currentModel); disposeModel(currentModel); }
      currentModel = object;
      currentModel.traverse(child => {
        if (child.isMesh) {
          if (!child.material) child.material = new THREE.MeshStandardMaterial({ color: 0xb8c3d5, roughness: 0.65 });
          if (child.material && child.material.map) child.material.map.colorSpace = THREE.SRGBColorSpace;
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });
      scene.add(currentModel);
      centerAndFit(currentModel);
      emptyState.style.display = "none";
      status.textContent = `Showing: ${model.title}`;
      help.textContent = "Hosted on this portfolio. Drag to orbit, scroll to zoom, and right-drag to pan.";
      host.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      console.error("Hosted model could not load:", model.file, error);
      status.textContent = `Could not load ${model.title}`;
      help.textContent = `The model file was not found or could not be loaded: ${model.file}. Check that the file exists and is published at this path. Use a self-contained .glb file.`;
    }
  }

  function renderHostedGallery() {
    const gallery = document.getElementById("hostedModelGallery");
    if (!gallery) return;
    const models = Array.isArray(window.PORTFOLIO_MODELS) ? window.PORTFOLIO_MODELS : [];
    gallery.replaceChildren();
    if (!models.length) {
      const note = document.createElement("p");
      note.className = "small-note";
      note.textContent = "No hosted model files are configured yet. Add your exported .glb files to assets/models/ and list them in js/hosted-models.js. They will then be viewable here without visitor downloads.";
      gallery.appendChild(note);
      return;
    }
    models.forEach(model => {
      const card = document.createElement("article");
      card.className = "hosted-model-card";
      const title = document.createElement("h3");
      title.textContent = model.title || "3D Model";
      const description = document.createElement("p");
      description.textContent = model.description || "Interactive 3D model.";
      const format = document.createElement("div");
      format.className = "model-format";
      format.textContent = "BROWSER 3D · GLB/GLTF";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button primary";
      button.textContent = "View in 3D";
      button.addEventListener("click", () => loadHostedModel(model));
      card.append(title, description, format, button);
      gallery.appendChild(card);
    });
  }
  renderHostedGallery();

  input.addEventListener("change", () => { loadFile(input.files[0]); input.value = ""; });
  ["dragenter", "dragover"].forEach(type => dropZone.addEventListener(type, event => {
    event.preventDefault(); dropZone.classList.add("drag-over");
  }));
  ["dragleave", "drop"].forEach(type => dropZone.addEventListener(type, event => {
    event.preventDefault(); dropZone.classList.remove("drag-over");
  }));
  dropZone.addEventListener("drop", event => loadFile(event.dataTransfer.files[0]));
  resetButton.addEventListener("click", () => {
    if (initialCamera && initialTarget) {
      camera.position.copy(initialCamera); controls.target.copy(initialTarget); controls.update();
    } else { camera.position.set(3, 2.5, 4); controls.target.set(0, 0.5, 0); controls.update(); }
  });
  clearButton.addEventListener("click", () => { loadingToken++; clearCurrent(); });
  function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
  animate();
}
