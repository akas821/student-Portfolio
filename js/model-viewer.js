import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js";

const gallery = document.getElementById("hostedModelGallery");
const panel = document.getElementById("modelViewerPanel");
const host = document.getElementById("viewer");
const status = document.getElementById("modelStatus");
const title = document.getElementById("viewerTitle");
const closeButton = document.getElementById("closeViewer");
const models = Array.isArray(window.PORTFOLIO_MODELS) ? window.PORTFOLIO_MODELS : [];
let renderer, scene, camera, controls, observer, activeModel, animationFrame = 0, loadToken = 0;

function disposeObject(object) {
  object?.traverse?.(child => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) (Array.isArray(child.material) ? child.material : [child.material]).forEach(material => {
      for (const key in material) if (material[key]?.isTexture) material[key].dispose();
      material.dispose();
    });
  });
}
function stopScene() {
  cancelAnimationFrame(animationFrame);
  observer?.disconnect(); controls?.dispose();
  if (activeModel && scene) { scene.remove(activeModel); disposeObject(activeModel); }
  renderer?.dispose(); renderer?.domElement?.remove();
  renderer = scene = camera = controls = observer = activeModel = null;
}
function createObjectLoader(model) {
  const ext = (model.file || "").split(".").pop().toLowerCase();
  if (ext === "fbx") return new FBXLoader().loadAsync(model.file);
  if (ext === "glb" || ext === "gltf") return new GLTFLoader().loadAsync(model.file).then(g => g.scene);
  throw new Error(`Unsupported model format .${ext}. Use FBX, GLB, or GLTF.`);
}
function startViewer(object) {
  scene = new THREE.Scene(); scene.background = new THREE.Color("#0b0e14");
  camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100000);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x30394c, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.7); key.position.set(5, 8, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xb6d1ff, 1.2); rim.position.set(-5, 3, -4); scene.add(rim);
  const grid = new THREE.GridHelper(10, 20, 0x465164, 0x252d3a); grid.position.y = 0; scene.add(grid);
  controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = 0.07;
  object.traverse(child => { if (child.isMesh) { if (!child.material) child.material = new THREE.MeshStandardMaterial({color:0xb8c3d5,roughness:.65}); (Array.isArray(child.material)?child.material:[child.material]).forEach(m=>{if(m.map)m.map.colorSpace=THREE.SRGBColorSpace;}); }});
  const box = new THREE.Box3().setFromObject(object); if (box.isEmpty()) throw new Error("The model file contains no visible geometry.");
  const size=box.getSize(new THREE.Vector3()), center=box.getCenter(new THREE.Vector3()); object.position.sub(center);
  const grounded=new THREE.Box3().setFromObject(object); object.position.y-=grounded.min.y;
  const maxDim=Math.max(size.x,size.y,size.z)||1, distance=maxDim*2.2;
  camera.position.set(distance,distance*.7,distance); controls.target.set(0,Math.max(size.y*.42,.05),0);
  controls.minDistance=maxDim*.03; controls.maxDistance=maxDim*30; camera.near=Math.max(maxDim/1000,.001); camera.far=Math.max(maxDim*100,1000); camera.updateProjectionMatrix(); controls.update();
  scene.add(object); activeModel=object;
  const resize=()=>{if(!renderer||!host.clientWidth)return;const w=host.clientWidth,h=host.clientHeight||440;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);};
  observer=new ResizeObserver(resize); observer.observe(host); resize();
  const animate=()=>{animationFrame=requestAnimationFrame(animate);controls?.update();if(renderer&&scene&&camera)renderer.render(scene,camera);}; animate();
}
async function showModel(model) {
  const token=++loadToken;
  panel.hidden=false; title.textContent=model.title||"3D Model"; status.textContent=`Loading ${model.title||"model"}…`;
  stopScene(); panel.hidden=false;
  panel.scrollIntoView({behavior:"smooth",block:"start"});
  try { const object=await createObjectLoader(model); if(token!==loadToken){disposeObject(object);return;} startViewer(object); status.textContent=`Showing ${model.title}. Rotate with drag and zoom with the scroll wheel.`; }
  catch(error){if(token!==loadToken)return;console.error("Could not load hosted model",model.file,error);status.textContent=`Could not load model. Check that ${model.file} exists in the repository and is published. ${error.message||""}`;}
}
function renderGallery() {
  gallery.replaceChildren();
  if(!models.length){gallery.textContent="No models are configured in js/hosted-models.js.";return;}
  models.forEach((model,index)=>{
    const card=document.createElement("article");card.className="hosted-model-card";
    const number=document.createElement("div");number.className="project-number";number.textContent=`${String(index+1).padStart(2,"0")} / 3D MODEL PROJECT`;
    const heading=document.createElement("h3");heading.textContent=model.title||`3D Model ${index+1}`;
    const description=document.createElement("p");description.textContent=model.description||"3D modeling project.";
    const format=document.createElement("div");format.className="model-format";format.textContent=`MODEL FORMAT · ${(model.file||"").split(".").pop().toUpperCase()}`;
    const button=document.createElement("button");button.type="button";button.className="button primary model-view-button";button.textContent="View in 3D";button.addEventListener("click",()=>showModel(model));
    card.append(number,heading,description,format,button);gallery.appendChild(card);
  });
}
closeButton?.addEventListener("click",()=>{loadToken++;stopScene();panel.hidden=true;});
renderGallery();
