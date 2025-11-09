// ==================== SCENE SETUP ==================== //
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ==================== LIGHTS ==================== //
const ambient = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambient);
const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(10, 20, 5);
scene.add(directional);

// ==================== GROUND ==================== //
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x227722 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ==================== PLAYER + BOW ==================== //
const bowGroup = new THREE.Group();
const bowGeo = new THREE.TorusGeometry(0.5, 0.05, 16, 100, Math.PI);
const bowMat = new THREE.MeshStandardMaterial({ color: 0x442200, metalness: 0.3, roughness: 0.7 });
const bow = new THREE.Mesh(bowGeo, bowMat);
bow.rotation.z = Math.PI / 2;
bowGroup.add(bow);
bowGroup.position.set(-2, 1, 0);
scene.add(bowGroup);

// ==================== TARGET ==================== //
const targetGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
const targetMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const target = new THREE.Mesh(targetGeo, targetMat);
target.position.set(0, 1, -20);
scene.add(target);

// ==================== ARROW ==================== //
let arrows = [];
const arrowGeo = new THREE.CylinderGeometry(0.02, 0.02, 2);
const arrowMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

// ==================== PHYSICS VARIABLES ==================== //
let isCharging = false;
let power = 0;
let score = 0;
let combo = 1;
let wind = (Math.random() - 0.5) * 0.05;

// ==================== UI ELEMENTS ==================== //
const powerFill = document.getElementById("power-fill");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");

// ==================== SOUND ==================== //
const shootSound = new Audio("sounds/shoot.mp3");
const hitSound = new Audio("sounds/hit.mp3");

// ==================== SHOOT FUNCTION ==================== //
function shootArrow() {
  const arrow = new THREE.Mesh(arrowGeo, arrowMat);
  arrow.rotation.x = Math.PI / 2;
  arrow.position.copy(bowGroup.position);
  scene.add(arrow);
  arrows.push({
    mesh: arrow,
    velocity: new THREE.Vector3(0, 0, -power * 0.5)
  });
  shootSound.currentTime = 0;
  shootSound.play();
  power = 0;
  powerFill.style.width = "0%";
}

// ==================== ANIMATE ==================== //
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  // Bow draw animation
  bow.rotation.y = isCharging ? Math.sin(Date.now() * 0.01) * 0.2 : 0;

  // Arrow physics
  for (let i = arrows.length - 1; i >= 0; i--) {
    const a = arrows[i];
    a.velocity.y -= 0.001; // gravity
    a.velocity.x += wind; // wind
    a.mesh.position.add(a.velocity);

    // Hit detection
    if (a.mesh.position.distanceTo(target.position) < 0.7) {
      scene.remove(a.mesh);
      arrows.splice(i, 1);
      hitSound.currentTime = 0;
      hitSound.play();
      score += 10 * combo;
      combo++;
      scoreEl.textContent = score;
      comboEl.textContent = "x" + combo;
    }

    // Remove off-screen
    if (a.mesh.position.z < -100 || a.mesh.position.y < 0) {
      scene.remove(a.mesh);
      arrows.splice(i, 1);
      combo = 1;
      comboEl.textContent = "x1";
    }
  }

  // Move target slowly side to side
  target.position.x = Math.sin(Date.now() * 0.001) * 5;
}

animate();

// ==================== CONTROLS ==================== //
window.addEventListener("keydown", e => {
  if (e.code === "Space") isCharging = true;
});
window.addEventListener("keyup", e => {
  if (e.code === "Space") {
    shootArrow();
    isCharging = false;
  }
});

// ==================== CHARGE LOOP ==================== //
setInterval(() => {
  if (isCharging) {
    power = Math.min(power + 0.5, 100);
    powerFill.style.width = `${power}%`;
  }
}, 50);

// ==================== CAMERA ==================== //
camera.position.set(0, 2, 5);
camera.lookAt(0, 1, 0);
