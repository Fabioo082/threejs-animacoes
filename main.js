import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

// Luzes
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(3, 10, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// Chao
const chaoGeo = new THREE.PlaneGeometry(100, 100);
const chaoMat = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false });
const chao = new THREE.Mesh(chaoGeo, chaoMat);
chao.rotation.x = -Math.PI / 2;
chao.receiveShadow = true;
scene.add(chao);

const grid = new THREE.GridHelper(100, 40, 0x000000, 0x000000);
grid.material.opacity = 0.2;
grid.material.transparent = true;
scene.add(grid);

const loader = new GLTFLoader();
const clock = new THREE.Clock();

let mixerSoldado;
let acoesSoldado = {};
let acaoAtualSoldado;

let mixerXbot;
let acoesXbot = {};
let acaoAtualXbot;

// Carregar Personagem 1 - Soldado
loader.load('./models/Soldier.glb', (gltf) => {
    const model = gltf.scene;
    model.position.set(-1.5, 0, 0);
    model.rotation.y = Math.PI;
    scene.add(model);

    model.traverse((obj) => {
        if (obj.isMesh) obj.castShadow = true;
    });

    mixerSoldado = new THREE.AnimationMixer(model);

    gltf.animations.forEach((clip) => {
        acoesSoldado[clip.name] = mixerSoldado.clipAction(clip);
    });

    // Inicia na animacao Idle
    acaoAtualSoldado = acoesSoldado['Idle'];
    acaoAtualSoldado.play();
});

// Carregar Personagem 2 - Xbot
loader.load('./models/Xbot.glb', (gltf) => {
    const model = gltf.scene;
    model.position.set(1.5, 0, 0);
    scene.add(model);

    model.traverse((obj) => {
        if (obj.isMesh) obj.castShadow = true;
    });

    mixerXbot = new THREE.AnimationMixer(model);

    gltf.animations.forEach((clip) => {
        acoesXbot[clip.name] = mixerXbot.clipAction(clip);
    });

    // Inicia na animacao idle
    acaoAtualXbot = acoesXbot['idle'];
    acaoAtualXbot.play();
});

window.trocarAnimacaoSoldado = function(nome) {
    if (!acoesSoldado[nome] || acaoAtualSoldado === acoesSoldado[nome]) return;

    const novaAcao = acoesSoldado[nome];
    acaoAtualSoldado.fadeOut(0.3);
    novaAcao.reset().fadeIn(0.3).play();
    acaoAtualSoldado = novaAcao;
};

window.trocarAnimacaoXbot = function(nome) {
    if (!acoesXbot[nome] || acaoAtualXbot === acoesXbot[nome]) return;

    const novaAcao = acoesXbot[nome];
    acaoAtualXbot.fadeOut(0.3);
    novaAcao.reset().fadeIn(0.3).play();
    acaoAtualXbot = novaAcao;
};

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixerSoldado) mixerSoldado.update(delta);
    if (mixerXbot) mixerXbot.update(delta);

    renderer.render(scene, camera);
}

animate();
