import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class StudioScene {
  constructor(canvasContainer, onObjectClick, onHoverChange) {
    this.container = canvasContainer;
    this.onObjectClick = onObjectClick;
    this.onHoverChange = onHoverChange;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredObject = null;
    this.interactiveObjects = [];

    this.mobile = window.matchMedia('(max-width: 768px)').matches;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.networkState = 'fault';
    this.networkTime = 0;
    this.repairStarted = null;
    this.lastFrame = 0;
    // Lighting state
    this.lampLightOn = true;

    // Turntable state
    this.turntableSpinning = false;
    this.vinylRecord = null;
    this.tonearm = null;

    // Chair state
    this.chairGroup = null;
    this.chairTargetRotation = 0.2;

    // Steam particles
    this.steamParticles = [];

    // Cisco switch LEDs
    this.switchLeds = [];

    // Monitor canvas texture
    this.monitorCanvas = null;
    this.monitorCtx = null;
    this.monitorTexture = null;
    this.monitorGraphPoints = [];

    // Camera animation state
    this.cameraPositions = {
      overview: {
        pos: new THREE.Vector3(-3.2, 3.4, 4.4),
        target: new THREE.Vector3(-0.1, 1.05, 0)
      },
      monitor: {
        pos: new THREE.Vector3(-0.1, 2.05, 1.7),
        target: new THREE.Vector3(-0.1, 1.85, 0.05)
      },
      notebook: {
        pos: new THREE.Vector3(1.15, 2.2, 1.8),
        target: new THREE.Vector3(0.75, 1.25, 0.6)
      },
      rack: {
        pos: new THREE.Vector3(2.2, 2.05, 2.7),
        target: new THREE.Vector3(1.05, 1.5, 0.62)
      }
    };

    this.currentView = 'overview';
    this.cameraAnimating = false;
    this.camStartPos = new THREE.Vector3();
    this.camEndPos = new THREE.Vector3();
    this.targetStart = new THREE.Vector3();
    this.targetEnd = new THREE.Vector3();
    this.animProgress = 1;
    this.animDuration = this.reducedMotion ? 0.01 : 0.7;
    this.animClock = new THREE.Clock();

    // Mouse parallax
    this.targetParallax = { x: 0, y: 0 };
    this.currentParallax = { x: 0, y: 0 };

    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1522);
    this.scene.fog = new THREE.FogExp2(0x0e1522, 0.075);

    // 2. Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 50);
    this.camera.position.copy(this.cameraPositions.overview.pos);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.mobile ? 1.25 : 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.copy(this.cameraPositions.overview.target);
    this.controls.maxPolarAngle = Math.PI / 2.1; // Don't go below floor
    this.controls.minPolarAngle = Math.PI / 6;   // Don't look straight down
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 8.5;
    this.controls.enablePan = false;
    this.controls.addEventListener('start', () => { this.controlsDragging = true; });


    // 5. Lighting Setup
    this.setupLighting();

    // 6. Build Studio Environment
    this.buildStudio();

    // 7. Event Listeners
    this.setupEvents();

    // 8. Start Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setTheme(theme) {
    const light = theme === 'light';
    this.scene.background.setHex(light ? 0xe8e4db : 0x182435);
    this.scene.fog.color.copy(this.scene.background);
    this.scene.fog.density = light ? 0.025 : 0.045;
    this.ambientLight.color.setHex(light ? 0xfff4df : 0x9bb5d5);
    this.ambientLight.intensity = light ? 2.0 : 1.2;
    this.keyLight.color.setHex(light ? 0xfff1d6 : 0xe1eeff);
    this.keyLight.intensity = light ? 3.2 : 2.3;
    this.rimLight.intensity = light ? 0.7 : 0.8;
    this.renderer.toneMappingExposure = light ? 1.35 : 1.25;
    this.floorMaterial.color.setHex(light ? 0xd9d2c5 : 0x26364b);
    this.rugMaterial.color.setHex(light ? 0xb7c4c8 : 0x35475d);
  }

  setupLighting() {
    // Ambient soft blue sky light
    const ambientLight = new THREE.AmbientLight(0x283b56, 0.85);
    this.ambientLight = ambientLight;
    this.scene.add(ambientLight);

    // Directional Key Light (Moonlight / Studio Key)
    const keyLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
    keyLight.position.set(-6, 9, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = this.mobile ? 512 : 2048;
    keyLight.shadow.mapSize.height = this.mobile ? 512 : 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.radius = 2.5;
    this.keyLight = keyLight;
    this.scene.add(keyLight);

    // Soft Cyan/Blue Rim Light from behind
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
    rimLight.position.set(5, 5, -5);
    this.rimLight = rimLight;
    this.scene.add(rimLight);
    const rackLight = new THREE.PointLight(0x7dd3fc, 1.6, 3);
    rackLight.position.set(1.2, 2.3, 1.4);
    this.scene.add(rackLight);

    // Warm Desk Lamp Spot Light
    this.lampLight = new THREE.SpotLight(0xffe6a3, 3.2, 7.5, Math.PI / 3.2, 0.45, 1.2);
    this.lampLight.position.set(0.4, 2.42, -0.1);
    this.lampLight.target.position.set(0.4, 1.2, 0.1);
    this.lampLight.castShadow = !this.mobile;
    this.lampLight.shadow.mapSize.width = 1024;
    this.lampLight.shadow.mapSize.height = 1024;
    this.lampLight.shadow.bias = -0.0003;
    this.lampLight.shadow.radius = 3;
    this.scene.add(this.lampLight);
    this.scene.add(this.lampLight.target);

    // Subtle warm point light under the lamp bulb for ambient glow
    this.lampBulbGlow = new THREE.PointLight(0xffe6a3, 1.0, 2.0);
    this.lampBulbGlow.position.set(0.4, 2.40, -0.1);
    this.scene.add(this.lampBulbGlow);
  }

  buildStudio() {
    // Ground / Studio Floor Plane
    const floorGeo = new THREE.PlaneGeometry(35, 35);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c131e,
      roughness: 0.88,
      metalness: 0.12
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    this.floorMaterial = floorMat;
    this.scene.add(floor);

    // Floating Platform / Desk Rug
    const rugGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.04, 48);
    const rugMat = new THREE.MeshStandardMaterial({
      color: 0x141f30,
      roughness: 0.95,
      metalness: 0.05
    });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.position.set(0, 0.02, 0);
    rug.receiveShadow = true;
    this.rugMaterial = rugMat;
    this.scene.add(rug);

    // Build Individual Components
    this.buildLShapedDesk();
    this.buildMonitor();
    this.buildTurntable();
    this.buildArcLamp();
    this.buildOfficeChair();
    this.buildPlant();
    this.buildCiscoSwitch();
    this.buildNotebookAndPencil();
    this.buildCV();
    this.buildCoffeeMug();
    if (!this.mobile) {
      this.buildDustParticles();
    }
  }

  // 1. Architectural L-Shaped Desk
  buildLShapedDesk() {
    const deskGroup = new THREE.Group();

    // Wood Material with rich dark walnut tone
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x1e1814,
      roughness: 0.45,
      metalness: 0.15
    });

    // Metal Frame / Legs material
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x0f1115,
      roughness: 0.35,
      metalness: 0.85
    });

    // Main Desk Top (2.5m wide, 0.9m deep, 0.08m thick)
    const mainTopGeo = new THREE.BoxGeometry(2.5, 0.09, 1.0);
    const mainTop = new THREE.Mesh(mainTopGeo, woodMat);
    mainTop.position.set(-0.1, 1.24, 0);
    mainTop.castShadow = true;
    mainTop.receiveShadow = true;
    deskGroup.add(mainTop);

    // Return Desk Top (L-extension on the right, 1.2m long, 0.7m wide)
    const returnTopGeo = new THREE.BoxGeometry(0.75, 0.09, 1.25);
    const returnTop = new THREE.Mesh(returnTopGeo, woodMat);
    returnTop.position.set(0.98, 1.24, 0.8);
    returnTop.castShadow = true;
    returnTop.receiveShadow = true;
    deskGroup.add(returnTop);

    // Desk Sub-Structure & Drawer Unit under return desk
    const drawerGeo = new THREE.BoxGeometry(0.68, 0.9, 1.1);
    const drawerMat = new THREE.MeshStandardMaterial({
      color: 0x16120f,
      roughness: 0.5,
      metalness: 0.1
    });
    const drawer = new THREE.Mesh(drawerGeo, drawerMat);
    drawer.position.set(0.98, 0.74, 0.8);
    drawer.castShadow = true;
    drawer.receiveShadow = true;
    deskGroup.add(drawer);

    // Subtle brushed drawer handle pulls
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x8a7a60, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 3; i++) {
      const handleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.25, 16);
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(0.62, 0.95 - i * 0.25, 0.8);
      deskGroup.add(handle);
    }

    // Modern Sleek Square Steel Legs
    const legGeo = new THREE.BoxGeometry(0.06, 1.2, 0.06);
    const legPositions = [
      [-1.28, 0.6, -0.44],
      [-1.28, 0.6, 0.44],
      [0.55, 0.6, -0.44]
    ];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, metalMat);
      leg.position.set(...pos);
      leg.castShadow = true;
      leg.receiveShadow = true;
      deskGroup.add(leg);
    });

    // Dark Leather Desk Pad
    const padGeo = new THREE.BoxGeometry(1.2, 0.008, 0.65);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x181a1f,
      roughness: 0.8,
      metalness: 0.05
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(-0.15, 1.29, 0.05);
    pad.receiveShadow = true;
    deskGroup.add(pad);

    this.scene.add(deskGroup);
  }

  // 2. Apple Studio Display / Workstation Monitor with Live Canvas Screen
  buildMonitor() {
    const monitorGroup = new THREE.Group();
    monitorGroup.name = 'monitor';

    const aluminumMat = new THREE.MeshStandardMaterial({
      color: 0xd4d8de,
      metalness: 0.85,
      roughness: 0.25
    });

    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x101216,
      metalness: 0.4,
      roughness: 0.5
    });

    // Monitor Stand Base
    const baseGeo = new THREE.BoxGeometry(0.36, 0.015, 0.28);
    const base = new THREE.Mesh(baseGeo, aluminumMat);
    base.position.set(-0.1, 1.29, -0.2);
    base.castShadow = true;
    base.receiveShadow = true;
    monitorGroup.add(base);

    // Stand Stem with Cable Hole
    const stemGeo = new THREE.BoxGeometry(0.12, 0.42, 0.035);
    const stem = new THREE.Mesh(stemGeo, aluminumMat);
    stem.position.set(-0.1, 1.5, -0.2);
    stem.rotation.x = -0.06;
    stem.castShadow = true;
    monitorGroup.add(stem);

    // Monitor Enclosure Back
    const backGeo = new THREE.BoxGeometry(1.25, 0.76, 0.04);
    const back = new THREE.Mesh(backGeo, aluminumMat);
    back.position.set(-0.1, 1.82, -0.15);
    back.castShadow = true;
    monitorGroup.add(back);

    // Front Bezel Frame
    const frontGeo = new THREE.BoxGeometry(1.25, 0.76, 0.01);
    const front = new THREE.Mesh(frontGeo, bezelMat);
    front.position.set(-0.1, 1.82, -0.13);
    monitorGroup.add(front);

    // Setup Live 2D Canvas for Monitor Screen
    this.monitorCanvas = document.createElement('canvas');
    this.monitorCanvas.width = 1024;
    this.monitorCanvas.height = 600;
    this.monitorCtx = this.monitorCanvas.getContext('2d');

    // Pre-populate ping points
    for (let i = 0; i < 40; i++) {
      this.monitorGraphPoints.push(35 + Math.random() * 25);
    }
    this.updateMonitorCanvas();

    this.monitorTexture = new THREE.CanvasTexture(this.monitorCanvas);
    this.monitorTexture.colorSpace = THREE.SRGBColorSpace;

    // Screen Geometry & Material
    const screenGeo = new THREE.PlaneGeometry(1.2, 0.71);
    const screenMat = new THREE.MeshBasicMaterial({
      map: this.monitorTexture
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(-0.1, 1.82, -0.122);
    monitorGroup.add(screenMesh);

    // Make interactive
    this.registerInteractive(screenMesh, 'monitor', 'Workstation Display', 'Click to explore Projects & Network Topologies');

    // Keyboard & Mouse on desk pad
    const kbGeo = new THREE.BoxGeometry(0.42, 0.012, 0.14);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x22262e, metalness: 0.7, roughness: 0.3 });
    const kb = new THREE.Mesh(kbGeo, kbMat);
    kb.position.set(-0.15, 1.30, 0.15);
    kb.castShadow = true;
    monitorGroup.add(kb);

    const mouseGeo = new THREE.BoxGeometry(0.07, 0.02, 0.12);
    const mouse = new THREE.Mesh(mouseGeo, kbMat);
    mouse.position.set(0.22, 1.30, 0.15);
    mouse.castShadow = true;
    monitorGroup.add(mouse);

    this.scene.add(monitorGroup);
  }

  updateMonitorCanvas() {
    if (!this.monitorCtx) return;
    const ctx = this.monitorCtx;
    const w = this.monitorCanvas.width;
    const h = this.monitorCanvas.height;

    // Dark sleek terminal background
    ctx.fillStyle = '#080d16';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Top Header Bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, 52);
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, 52);
    ctx.lineTo(w, 52);
    ctx.stroke();

    // Window Dots
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(30, 26, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(50, 26, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(70, 26, 6, 0, Math.PI * 2); ctx.fill();

    // Terminal Title
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('RAMEES_KALLAN // NETWORK_OPS_CONSOLE (v4.2)', 105, 32);

    // Active Node Pill
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.fillRect(w - 220, 14, 195, 26);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(w - 220, 14, 195, 26);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('● SIMULATED NETWORK', w - 205, 31);

    // Left Column: Telemetry & OSPF
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('[NETWORK STATUS]', 40, 95);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px "JetBrains Mono", monospace';
    const lines = [
      'ROUTER_HOST: leeds-core-gw-01',
      'PROTOCOL:    OSPFv2 Area 0 (Full)',
      'DEFAULT_GW:  10.240.0.1 /24 [UP]',
      'DHCP SCOPE:  10.240.10.0/24 (Lease: 89%)',
      'DNS_PRIMARY: 1.1.1.1 (Quad9 Backup)',
      'VLAN_TRUNK:  802.1Q (IDs 10,20,30,99)'
    ];
    lines.forEach((l, idx) => {
      ctx.fillText(l, 40, 125 + idx * 24);
    });

    // Real-Time Ping Waveform Graph
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('[RTT LATENCY TELEMETRY - 15s SLIDING WINDOW]', 40, 295);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(40, 310, 440, 120);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.strokeRect(40, 310, 440, 120);

    // Draw Graph
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    const step = 440 / (this.monitorGraphPoints.length - 1);
    this.monitorGraphPoints.forEach((val, i) => {
      const gx = 40 + i * step;
      const gy = 410 - val;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    });
    ctx.stroke();

    // Pulse dot at current point
    const lastIdx = this.monitorGraphPoints.length - 1;
    const lastX = 40 + lastIdx * step;
    const lastY = 410 - this.monitorGraphPoints[lastIdx];
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(lastX, lastY, 4, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('AVG: 12.4ms   MIN: 9.1ms   LOSS: 0.00%', 45, 415);

    this.drawTopology(ctx);

    // Live Clock & Footer
    ctx.fillStyle = '#475569';
    ctx.font = '11px "JetBrains Mono", monospace';
    const nowStr = new Date().toUTCString();
    ctx.fillText(`DEMO TELEMETRY // ${nowStr}`, 40, 560);
  }

  drawTopology(ctx) {
    const nodes = [[580, 155, 'ROUTER'], [760, 155, 'SWITCH'], [925, 155, 'SERVER'], [700, 325, 'DESK 01'], [875, 325, 'DESK 02']];
    const links = [[0, 1], [1, 2], [1, 3], [1, 4]];
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('LAB // PACKET FLOW', 540, 95);
    links.forEach(([from, to], i) => {
      const a = nodes[from], b = nodes[to];
      const faulty = i === 1 && this.networkState !== 'healthy';
      ctx.strokeStyle = faulty ? '#fbbf24' : '#38bdf8';
      ctx.lineWidth = 3;
      ctx.setLineDash(faulty ? [8, 8] : []);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      ctx.setLineDash([]);
      if (!faulty) {
        const t = this.reducedMotion ? 0.5 : (this.networkTime * 0.4 + i * 0.2) % 1;
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath(); ctx.arc(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 5, 0, Math.PI * 2); ctx.fill();
      }
    });
    nodes.forEach(([x, y, label], i) => {
      ctx.fillStyle = i === 2 && this.networkState !== 'healthy' ? '#78350f' : '#0c4a6e';
      ctx.fillRect(x - 42, y - 22, 84, 44);
      ctx.strokeStyle = '#7dd3fc'; ctx.strokeRect(x - 42, y - 22, 84, 44);
      ctx.fillStyle = '#ffffff'; ctx.font = '12px monospace'; ctx.fillText(label, x - 33, y + 4);
    });
    ctx.fillStyle = this.networkState === 'healthy' ? '#34d399' : '#fbbf24';
    ctx.font = 'bold 14px monospace';
    const label = this.networkState === 'healthy' ? 'LINK RESTORED // ALL NODES REACHABLE' : this.networkState === 'repairing' ? 'CHECKING PATCH LEAD / PORT / PING...' : 'SERVER UPLINK DOWN // CLICK AMBER CABLE';
    ctx.fillText(label, 540, 420);
    ctx.fillStyle = '#94a3b8'; ctx.font = '12px monospace';
    ctx.fillText('CLICK DISPLAY TO EXPLORE NETWORK PROJECTS', 540, 460);
  }

  repairNetwork() {
    if (this.networkState === 'repairing') return;
    if (this.networkState === 'healthy') {
      this.networkState = 'fault';
      this.faultCable.material.color.setHex(0xfbbf24);
      this.onHoverChange?.({ title: 'Simulated link failure', hint: 'Select the amber uplink to inspect and restore it.' });
    } else {
      this.networkState = 'repairing';
      this.repairStarted = this.networkTime;
      this.onHoverChange?.({ title: 'Checking the uplink', hint: 'Reseating patch lead → verifying port → testing reachability.' });
    }
  }

  labelTexture(text, subtitle = '') {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e9eef0'; ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#0e1522'; ctx.font = 'bold 36px monospace'; ctx.fillText(text, 24, 90);
    ctx.font = '22px monospace'; ctx.fillText(subtitle, 24, 145);
    ctx.fillStyle = '#0284c7'; ctx.fillRect(24, 190, 464, 8);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  buildCV() {
    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.006, 0.43), new THREE.MeshStandardMaterial({ color: 0xe9eef0, roughness: 0.9 }));
    paper.position.set(-0.65, 1.30, 0.42); paper.rotation.y = -0.15;
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.30, 0.41), new THREE.MeshBasicMaterial({ map: this.labelTexture('RAMEES / CV', 'VIEW PROFILE ↗') }));
    label.rotation.x = -Math.PI / 2; label.position.y = 0.004; paper.add(label);
    paper.castShadow = true; this.scene.add(paper);
    this.registerInteractive(paper, 'cv', 'View / Download CV', 'Open Ramees’s CV in a new tab');
    this.registerInteractive(label, 'cv', 'View / Download CV', 'Open Ramees’s CV in a new tab');
  }

  // 3. Retro Audiophile Vinyl Turntable
  buildTurntable() {
    const turntableGroup = new THREE.Group();
    turntableGroup.name = 'turntable';
    turntableGroup.position.set(-1.05, 1.29, 0.18);

    // Silver Plinth Base
    const plinthGeo = new THREE.BoxGeometry(0.48, 0.06, 0.42);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.03;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    turntableGroup.add(plinth);

    // Metallic Platter Ring
    const platterGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.02, 36);
    const platterMat = new THREE.MeshStandardMaterial({
      color: 0xcfd6df,
      metalness: 0.9,
      roughness: 0.15
    });
    const platter = new THREE.Mesh(platterGeo, platterMat);
    platter.position.set(-0.04, 0.07, 0);
    platter.castShadow = true;
    turntableGroup.add(platter);

    // Vinyl Record (Black grooved disc)
    const vinylGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.006, 40);
    const vinylMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      roughness: 0.2,
      metalness: 0.7
    });
    this.vinylRecord = new THREE.Mesh(vinylGeo, vinylMat);
    this.vinylRecord.position.set(-0.04, 0.082, 0);
    this.vinylRecord.castShadow = true;
    turntableGroup.add(this.vinylRecord);

    // Vinyl Center Label (Cyan circular sticker)
    const labelGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.007, 24);
    const labelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(-0.04, 0.083, 0);
    turntableGroup.add(label);

    // Center Spindle
    const spindleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.03, 16);
    const spindleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 });
    const spindle = new THREE.Mesh(spindleGeo, spindleMat);
    spindle.position.set(-0.04, 0.09, 0);
    turntableGroup.add(spindle);

    // Tonearm Base & Arm
    const tonearmBaseGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.04, 16);
    const tonearmBase = new THREE.Mesh(tonearmBaseGeo, plinthMat);
    tonearmBase.position.set(0.15, 0.08, -0.12);
    turntableGroup.add(tonearmBase);

    this.tonearm = new THREE.Group();
    this.tonearm.position.set(0.15, 0.10, -0.12);

    const armGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.22, 12);
    const armMesh = new THREE.Mesh(armGeo, plinthMat);
    armMesh.rotation.x = Math.PI / 2;
    armMesh.position.set(-0.08, 0, 0.09);
    this.tonearm.add(armMesh);

    // Cartridge Head
    const headGeo = new THREE.BoxGeometry(0.02, 0.015, 0.035);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.5 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(-0.16, -0.006, 0.18);
    this.tonearm.add(head);

    turntableGroup.add(this.tonearm);

    // Acrylic Dust Cover (hinged open at an angle, just like Growon!)
    const coverGeo = new THREE.BoxGeometry(0.48, 0.01, 0.42);
    const coverMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.88,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5
    });
    const cover = new THREE.Mesh(coverGeo, coverMat);
    cover.position.set(0, 0.22, -0.2);
    cover.rotation.x = -Math.PI / 3.8;
    turntableGroup.add(cover);

    // Register click interaction
    this.registerInteractive(plinth, 'turntable', 'Audiophile Vinyl Player', 'Click to toggle Lo-Fi Ambient Audio & Turntable');
    this.registerInteractive(this.vinylRecord, 'turntable', 'Audiophile Vinyl Player', 'Click to toggle Lo-Fi Ambient Audio & Turntable');

    this.scene.add(turntableGroup);
  }

  // 4. Minimalist Floor Arc Lamp
  buildArcLamp() {
    const lampGroup = new THREE.Group();
    lampGroup.name = 'lamp';
    lampGroup.position.set(1.4, 0, -0.1);

    const blackMetal = new THREE.MeshStandardMaterial({
      color: 0x111317,
      metalness: 0.85,
      roughness: 0.3
    });

    // Heavy Circular Floor Base
    const baseGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.04, 32);
    const base = new THREE.Mesh(baseGeo, blackMetal);
    base.position.y = 0.02;
    base.castShadow = true;
    base.receiveShadow = true;
    lampGroup.add(base);

    // Vertical Stem
    const stemGeo = new THREE.CylinderGeometry(0.018, 0.018, 1.8, 16);
    const stem = new THREE.Mesh(stemGeo, blackMetal);
    stem.position.y = 0.92;
    stem.castShadow = true;
    lampGroup.add(stem);

    // A continuous curved tube joins the vertical stem directly to the shade.
    const arc = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.82, 0),
      new THREE.Vector3(-0.12, 2.12, 0),
      new THREE.Vector3(-0.5, 2.4, 0),
      new THREE.Vector3(-1.0, 2.45, 0)
    ]);
    const arm = new THREE.Mesh(new THREE.TubeGeometry(arc, 32, 0.018, 10, false), blackMetal);
    arm.castShadow = true;
    lampGroup.add(arm);

    // Thin Circular Lamp Disc Shade
    const shadeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.03, 32);
    const shade = new THREE.Mesh(shadeGeo, blackMetal);
    shade.position.set(-1.0, 2.45, 0);
    shade.castShadow = true;
    lampGroup.add(shade);

    // Glowing Diffuser Disc on underside
    const diffuserGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.005, 32);
    this.diffuserMat = new THREE.MeshBasicMaterial({ color: 0xffe6a3 });
    const diffuser = new THREE.Mesh(diffuserGeo, this.diffuserMat);
    diffuser.position.set(-1.0, 2.432, 0);
    lampGroup.add(diffuser);

    // Register click interaction
    this.registerInteractive(shade, 'lamp', 'Architectural Arc Lamp', 'Click to toggle Studio Warm Lamp');
    this.registerInteractive(base, 'lamp', 'Architectural Arc Lamp', 'Click to toggle Studio Warm Lamp');

    this.scene.add(lampGroup);
  }

  // 5. Mid-Century Modern Executive Leather Chair
  buildOfficeChair() {
    this.chairGroup = new THREE.Group();
    this.chairGroup.name = 'chair';
    this.chairGroup.position.set(0.12, 0, 0.85);
    this.chairGroup.rotation.y = 0.2; // angled towards desk

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x181a1e,
      roughness: 0.6,
      metalness: 0.1
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xdde2ea,
      metalness: 0.95,
      roughness: 0.15
    });

    // 5-Star Caster Base
    const starCenterGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16);
    const starCenter = new THREE.Mesh(starCenterGeo, chromeMat);
    starCenter.position.y = 0.12;
    this.chairGroup.add(starCenter);

    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const legGeo = new THREE.BoxGeometry(0.04, 0.03, 0.35);
      const leg = new THREE.Mesh(legGeo, chromeMat);
      leg.position.set(Math.sin(angle) * 0.17, 0.10, Math.cos(angle) * 0.17);
      leg.rotation.y = angle;
      leg.castShadow = true;
      this.chairGroup.add(leg);

      // Caster wheel
      const wheelGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(Math.sin(angle) * 0.34, 0.04, Math.cos(angle) * 0.34);
      wheel.castShadow = true;
      this.chairGroup.add(wheel);
    }

    // Pneumatic Central Piston
    const pistonGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.42, 16);
    const piston = new THREE.Mesh(pistonGeo, chromeMat);
    piston.position.y = 0.33;
    this.chairGroup.add(piston);

    // Seat Cushion (Tufted leather)
    const seatGeo = new THREE.BoxGeometry(0.56, 0.1, 0.52);
    const seat = new THREE.Mesh(seatGeo, leatherMat);
    seat.position.set(0, 0.56, 0);
    seat.castShadow = true;
    seat.receiveShadow = true;
    this.chairGroup.add(seat);

    // Ribbed Horizontal Backrest Cushions
    const backGeo = new THREE.BoxGeometry(0.52, 0.65, 0.08);
    const back = new THREE.Mesh(backGeo, leatherMat);
    back.position.set(0, 0.94, -0.22);
    back.rotation.x = -0.12;
    back.castShadow = true;
    back.receiveShadow = true;
    this.chairGroup.add(back);

    // Chrome Armrests
    [-0.29, 0.29].forEach(x => {
      const armGeo = new THREE.BoxGeometry(0.05, 0.03, 0.32);
      const arm = new THREE.Mesh(armGeo, leatherMat);
      arm.position.set(x, 0.78, -0.05);
      this.chairGroup.add(arm);

      const postGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.22, 12);
      const post = new THREE.Mesh(postGeo, chromeMat);
      post.position.set(x, 0.67, -0.05);
      this.chairGroup.add(post);
    });

    this.registerInteractive(seat, 'chair', 'Executive Chair', 'Click to rotate chair');
    this.registerInteractive(back, 'chair', 'Executive Chair', 'Click to rotate chair');

    this.scene.add(this.chairGroup);
  }

  // 6. Lush Fiddle Leaf Fig Plant in Ceramic Pot
  buildPlant() {
    const plantGroup = new THREE.Group();
    plantGroup.name = 'plant';
    plantGroup.position.set(-1.6, 0, -0.2);

    // Matte Charcoal Ceramic Pot
    const potGeo = new THREE.CylinderGeometry(0.3, 0.22, 0.58, 24);
    const potMat = new THREE.MeshStandardMaterial({
      color: 0x1c1e24,
      roughness: 0.9,
      metalness: 0.05
    });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.29;
    pot.castShadow = true;
    pot.receiveShadow = true;
    plantGroup.add(pot);

    // Soil
    const soilGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.04, 24);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x120d09, roughness: 1.0 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 0.56;
    plantGroup.add(soil);

    // Central Stem
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.03, 1.4, 12);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x2b3821, roughness: 0.8 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 1.15;
    stem.castShadow = true;
    plantGroup.add(stem);

    // Broad Fiddle Fig Leaves
    const leafGeo = new THREE.BoxGeometry(0.38, 0.008, 0.26);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x1b4332,
      roughness: 0.35,
      metalness: 0.1
    });

    const leafConfigs = [
      { y: 0.75, rY: 0.4, rZ: 0.5, scale: 0.8 },
      { y: 0.95, rY: 2.1, rZ: 0.45, scale: 0.95 },
      { y: 1.15, rY: -1.2, rZ: 0.5, scale: 1.1 },
      { y: 1.35, rY: 0.9, rZ: 0.4, scale: 1.15 },
      { y: 1.55, rY: -2.4, rZ: 0.45, scale: 1.2 },
      { y: 1.70, rY: 1.6, rZ: 0.35, scale: 1.05 },
      { y: 1.85, rY: -0.3, rZ: 0.25, scale: 0.9 }
    ];

    leafConfigs.forEach(cfg => {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.scale.set(cfg.scale, 1, cfg.scale);
      leaf.position.set(Math.sin(cfg.rY) * 0.18, cfg.y, Math.cos(cfg.rY) * 0.18);
      leaf.rotation.y = cfg.rY;
      leaf.rotation.z = cfg.rZ;
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      plantGroup.add(leaf);
    });

    this.scene.add(plantGroup);
  }

  // 7. Cisco Enterprise Switch / Network Rack Unit
  buildCiscoSwitch() {
    const rackGroup = new THREE.Group();
    rackGroup.name = 'rack';
    rackGroup.position.set(1.05, 1.29, 0.62);
    rackGroup.rotation.y = -Math.PI / 10;

    const metalCaseMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.85,
      roughness: 0.3
    });

    // 1U Switch Chassis
    const chassisGeo = new THREE.BoxGeometry(0.48, 0.065, 0.28);
    const chassis = new THREE.Mesh(chassisGeo, metalCaseMat);
    chassis.position.y = 0.033;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    rackGroup.add(chassis);

    // Front Faceplate (Cyan Cisco Teal Accent)
    const faceplateGeo = new THREE.BoxGeometry(0.47, 0.055, 0.005);
    const faceplateMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4
    });
    const faceplate = new THREE.Mesh(faceplateGeo, faceplateMat);
    faceplate.position.set(0, 0.033, 0.142);
    rackGroup.add(faceplate);

    // RJ45 Ports & Blinking LEDs
    for (let i = 0; i < 8; i++) {
      const px = -0.18 + i * 0.045;
      
      // Port Jack
      const jackGeo = new THREE.BoxGeometry(0.03, 0.024, 0.01);
      const jackMat = new THREE.MeshStandardMaterial({ color: 0x090d14, metalness: 0.6 });
      const jack = new THREE.Mesh(jackGeo, jackMat);
      jack.position.set(px, 0.028, 0.144);
      rackGroup.add(jack);

      // LED Link Light
      const ledGeo = new THREE.BoxGeometry(0.008, 0.008, 0.005);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(px, 0.046, 0.146);
      rackGroup.add(led);

      this.switchLeds.push({
        mesh: led,
        rate: 0.08 + Math.random() * 0.15,
        timer: Math.random() * 2
      });
    }

    this.registerInteractive(faceplate, 'rack', 'Network rack', 'Explore infrastructure experience');
    this.registerInteractive(chassis, 'rack', 'Cisco Managed Switch', 'Click to view Experience, Certifications & Hardware');

    // Compact open rack with an upper router and a labelled patch panel.
    for (const x of [-0.27, 0.27]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.45, 0.31), metalCaseMat);
      rail.position.set(x, 0.20, 0); rackGroup.add(rail);
    }
    for (const [y, name] of [[0.19, 'CORE ROUTER'], [0.36, 'PATCH / VLAN 10']]) {
      const device = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.085, 0.28), metalCaseMat);
      device.position.y = y; device.castShadow = true; rackGroup.add(device);
      this.registerInteractive(device, 'rack', 'Network infrastructure', 'Explore infrastructure experience');
      const label = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.065), new THREE.MeshBasicMaterial({ map: this.labelTexture(name, 'LEEDS / LAB') }));
      label.position.set(0, y, 0.145); rackGroup.add(label);
      this.registerInteractive(label, 'rack', 'Network infrastructure', 'Explore infrastructure experience');
    }
    for (let i = 0; i < 4; i++) {
      const x = -0.18 + i * 0.09;
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x, 0.36, 0.15), new THREE.Vector3(x, 0.24, 0.29 + i * 0.025), new THREE.Vector3(x + 0.02, 0.08, 0.24), new THREE.Vector3(x, 0.028, 0.15)]);
      const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, this.mobile ? 12 : 24, i === 1 ? 0.014 : 0.009, 6, false), new THREE.MeshStandardMaterial({ color: i === 1 ? 0xfbbf24 : 0x38bdf8, roughness: 0.65 }));
      rackGroup.add(cable);
      if (i === 1) {
        this.faultCable = cable;
        this.registerInteractive(cable, 'fault', 'Amber uplink / troubleshooting demo', 'Inspect the failed link and restore connectivity');
      }
    }
    this.scene.add(rackGroup);
  }

  // 8. Field Moleskine Notebook & Yellow Drafting Pencil
  buildNotebookAndPencil() {
    const noteGroup = new THREE.Group();
    noteGroup.name = 'notebook';
    noteGroup.position.set(0.62, 1.29, 0.30);
    noteGroup.rotation.y = 0.25;

    // Hardcover Black Notebook
    const bookGeo = new THREE.BoxGeometry(0.24, 0.022, 0.34);
    const bookMat = new THREE.MeshStandardMaterial({
      color: 0x171921,
      roughness: 0.7,
      metalness: 0.05
    });
    const book = new THREE.Mesh(bookGeo, bookMat);
    book.position.y = 0.011;
    book.castShadow = true;
    book.receiveShadow = true;
    noteGroup.add(book);

    // Cream Paper Edge
    const paperGeo = new THREE.BoxGeometry(0.23, 0.018, 0.32);
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xfbf7ee,
      roughness: 0.8
    });
    const paper = new THREE.Mesh(paperGeo, paperMat);
    paper.position.set(0.004, 0.011, 0);
    noteGroup.add(paper);

    // Silk Bookmark Ribbon Hanging Over
    const ribbonGeo = new THREE.BoxGeometry(0.015, 0.004, 0.12);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.set(0.02, 0.023, 0.18);
    noteGroup.add(ribbon);

    // Yellow Drafting Pencil
    const pencilGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.26, 6);
    const pencilMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const pencil = new THREE.Mesh(pencilGeo, pencilMat);
    pencil.rotation.z = Math.PI / 2;
    pencil.rotation.y = 0.3;
    pencil.position.set(0.18, 0.008, 0.02);
    pencil.castShadow = true;
    noteGroup.add(pencil);

    // Pink Eraser Tip
    const eraserGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.025, 12);
    const eraserMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.9 });
    const eraser = new THREE.Mesh(eraserGeo, eraserMat);
    eraser.rotation.z = Math.PI / 2;
    eraser.position.set(0.31, 0.008, 0.06);
    noteGroup.add(eraser);

    this.registerInteractive(book, 'notebook', 'Field Journal & Dossier', 'Click to open About Me & Dossier');

    this.scene.add(noteGroup);
  }

  // 9. Ceramic Coffee Mug with Steam
  buildCoffeeMug() {
    const mugGroup = new THREE.Group();
    mugGroup.name = 'mug';
    mugGroup.position.set(0.15, 1.29, 0.52);

    const mugMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.2,
      metalness: 0.1
    });

    // Cup Cylinder
    const cupGeo = new THREE.LatheGeometry([
      new THREE.Vector2(0, 0), new THREE.Vector2(0.055, 0),
      new THREE.Vector2(0.065, 0.14), new THREE.Vector2(0.055, 0.14),
      new THREE.Vector2(0.047, 0.02), new THREE.Vector2(0, 0.02)
    ], 24);
    const cup = new THREE.Mesh(cupGeo, mugMat);
    cup.position.y = 0;
    cup.castShadow = true;
    mugGroup.add(cup);

    // Dark Coffee Surface
    const coffeeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.01, 24);
    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x271911, roughness: 0.3 });
    const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffee.position.y = 0.12;
    mugGroup.add(coffee);

    // Mug Handle
    const handleGeo = new THREE.TorusGeometry(0.035, 0.01, 12, 24, Math.PI);
    const handle = new THREE.Mesh(handleGeo, mugMat);
    handle.rotation.z = -Math.PI / 2;
    handle.position.set(-0.065, 0.06, 0);
    mugGroup.add(handle);

    // Rising Steam Particle System
    const steamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15
    });

    for (let i = 0; i < (this.mobile ? 0 : 8); i++) {
      const steamGeo = new THREE.SphereGeometry(0.015 + Math.random() * 0.015, 8, 8);
      const steam = new THREE.Mesh(steamGeo, steamMat);
      steam.position.set(
        (Math.random() - 0.5) * 0.04,
        0.12 + Math.random() * 0.25,
        (Math.random() - 0.5) * 0.04
      );
      mugGroup.add(steam);
      this.steamParticles.push({
        mesh: steam,
        speed: 0.003 + Math.random() * 0.003,
        baseY: 0.12,
        maxY: 0.45
      });
    }

    this.registerInteractive(cup, 'mug', 'Engineer Mug', 'Fresh brew • Fueling late-night network deployments');

    this.scene.add(mugGroup);
  }

  // 10. Ambient Atmospheric Dust Motes
  buildDustParticles() {
    const particleCount = 200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = 0.5 + Math.random() * 4;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.03,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    this.dustParticles = new THREE.Points(geo, mat);
    this.scene.add(this.dustParticles);
  }

  registerInteractive(mesh, id, title, hint) {
    mesh.userData = { id, title, hint };
    this.interactiveObjects.push(mesh);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.8, depthTest: false }));
    edges.visible = false; edges.renderOrder = 10; mesh.add(edges);
    mesh.userData.highlight = edges;
  }

  setupEvents() {
    const onPointerMove = (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Mouse Parallax when not animating
      this.targetParallax.x = this.mouse.x * 0.18;
      this.targetParallax.y = this.mouse.y * 0.12;

      this.checkRaycast();
    };

    let pointerStart = null;
    this.container.addEventListener('pointerdown', e => { pointerStart = { x: e.clientX, y: e.clientY }; });
    const onClick = (e) => {
      if (!pointerStart || Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) > 8) return;
      onPointerMove(e);
      if (this.hoveredObject) {
        const { id, title } = this.hoveredObject.userData;
        this.handleObjectInteraction(id, title);
      }
    };

    const onResize = () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.mobile ? 1.25 : 2));
    };

    this.container.addEventListener('pointermove', onPointerMove);
    this.container.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);
    this.resizeObserver = new ResizeObserver(onResize);
    this.resizeObserver.observe(this.container);
  }

  checkRaycast() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    if (document.querySelector('.modal-overlay.active')) return;
    const intersects = this.raycaster.intersectObjects(this.scene.children, true)
      .filter(hit => hit.object.isMesh);
    const first = intersects[0];
    const interactive = first && this.interactiveObjects.includes(first.object);
    const hits = interactive ? [first] : [];

    if (hits.length > 0) {
      const hit = hits[0].object;
      if (this.hoveredObject !== hit) {
        if (this.hoveredObject) this.hoveredObject.userData.highlight.visible = false;
        this.hoveredObject = hit;
        hit.userData.highlight.visible = true;
        this.container.style.cursor = 'pointer';
        if (this.onHoverChange) {
          this.onHoverChange(hit.userData);
        }
      }
    } else {
      if (this.hoveredObject !== null) {
        this.hoveredObject.userData.highlight.visible = false;
        this.hoveredObject = null;
        this.container.style.cursor = 'default';
        if (this.onHoverChange) {
          this.onHoverChange(null);
        }
      }
    }
  }

  handleObjectInteraction(id, title) {
    if (id === 'fault') {
      this.repairNetwork();
    } else if (id === 'lamp') {
      this.toggleLamp();
    } else if (id === 'turntable') {
      this.toggleTurntable();
    } else if (id === 'chair') {
      this.rotateChair();
    }

    if (this.onObjectClick) {
      this.onObjectClick(id, title);
    }
  }

  toggleLamp() {
    this.lampLightOn = !this.lampLightOn;
    this.lampLight.intensity = this.lampLightOn ? 3.2 : 0.05;
    this.lampBulbGlow.intensity = this.lampLightOn ? 1.0 : 0.02;
    if (this.diffuserMat) {
      this.diffuserMat.color.set(this.lampLightOn ? 0xffe6a3 : 0x222222);
    }
  }

  toggleTurntable(forceState) {
    if (forceState !== undefined) {
      this.turntableSpinning = forceState;
    } else {
      this.turntableSpinning = !this.turntableSpinning;
    }

    if (this.tonearm) {
      // Swivel tonearm onto or away from record
      const targetZ = this.turntableSpinning ? -0.18 : 0;
      this.tonearm.rotation.y = targetZ;
    }
  }

  rotateChair() {
    this.chairTargetRotation += (Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1);
  }

  // Camera Navigation Choreography
  navigateTo(viewName) {
    if (!this.cameraPositions[viewName]) return;
    this.controlsDragging = false;
    this.currentView = viewName;
    const targetConfig = this.cameraPositions[viewName];

    this.camStartPos.copy(this.camera.position);
    this.camEndPos.copy(targetConfig.pos);

    this.targetStart.copy(this.controls.target);
    this.targetEnd.copy(targetConfig.target);

    this.animProgress = 0;
    this.cameraAnimating = true;
    this.animClock.start();
  }

  resetToOverview() {
    this.navigateTo('overview');
  }

  // Main Render Loop
  animate(timestamp = 0) {
    requestAnimationFrame(this.animate);
    if (document.hidden || ((this.mobile || this.reducedMotion) && timestamp - this.lastFrame < 33)) return;
    this.lastFrame = timestamp;

    const delta = this.animClock.getDelta();
    const elapsedTime = this.animClock.getElapsedTime();
    this.networkTime += Math.min(delta, 0.1);
    if (this.networkState === 'repairing' && this.networkTime - this.repairStarted > 2.5) {
      this.networkState = 'healthy';
      this.faultCable.material.color.setHex(0x10b981);
      this.onHoverChange?.({ title: 'Connectivity restored', hint: 'Patch lead reseated, port verified, ping successful. Select again to replay.' });
    }

    // 1. Smooth Camera Transition
    if (this.cameraAnimating) {
      this.animProgress += delta / this.animDuration;
      if (this.animProgress >= 1) {
        this.animProgress = 1;
        this.cameraAnimating = false;
      }

      // Smooth EaseInOutCubic
      const t = this.animProgress;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.camera.position.lerpVectors(this.camStartPos, this.camEndPos, ease);
      this.controls.target.lerpVectors(this.targetStart, this.targetEnd, ease);
      this.controls.update();
    } else {
      this.controls.update();
    }

    // 2. Vinyl Turntable Spin
    if (this.turntableSpinning && this.vinylRecord && !this.reducedMotion) {
      this.vinylRecord.rotation.y += 0.045;
    }

    // 3. Smooth Chair Rotation Lerp
    if (this.chairGroup) {
      this.chairGroup.rotation.y += (this.chairTargetRotation - this.chairGroup.rotation.y) * 0.08;
    }

    // 4. Rising Steam Particles
    if (!this.reducedMotion) this.steamParticles.forEach(p => {
      p.mesh.position.y += p.speed;
      p.mesh.scale.multiplyScalar(1.008);
      if (p.mesh.position.y > p.maxY) {
        p.mesh.position.y = p.baseY;
        p.mesh.scale.set(1, 1, 1);
      }
    });

    // 5. Cisco Switch LED Blinking
    this.switchLeds.forEach(led => {
      led.timer += delta;
      if (led.timer > led.rate) {
        led.timer = 0;
        const isOn = led.mesh.material.color.r > 0.1;
        if (isOn) {
          led.mesh.material.color.setHex(0x052e16); // dim
        } else {
          led.mesh.material.color.setHex(0x10b981); // bright green
        }
      }
    });

    // 6. Monitor Telemetry Updates (Every 2 seconds)
    if (Math.floor(this.networkTime * (this.reducedMotion ? 1 : 12)) !== this.lastTelemetryTick) {
      this.lastTelemetryTick = Math.floor(this.networkTime * (this.reducedMotion ? 1 : 12));
      this.monitorGraphPoints.shift();
      const last = this.monitorGraphPoints[this.monitorGraphPoints.length - 1];
      const next = Math.max(10, Math.min(80, last + (Math.random() - 0.5) * 18));
      this.monitorGraphPoints.push(next);
      this.updateMonitorCanvas();
      if (this.monitorTexture) this.monitorTexture.needsUpdate = true;
    }

    // 7. Dust Motes Subtle Drift
    if (this.dustParticles && !this.reducedMotion) {
      this.dustParticles.rotation.y = elapsedTime * 0.015;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
