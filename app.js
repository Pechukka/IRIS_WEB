const cursorDot=document.querySelector('.cursor-dot'),cursorOutline=document.querySelector('.cursor-outline'),pupil=document.getElementById('pupil'),eyelids=document.querySelector('.eyelids'),pupilRings=document.querySelectorAll('.pupil-ring');
window.addEventListener('mousemove',(e)=>{cursorDot.style.left=`${e.clientX}px`;cursorDot.style.top=`${e.clientY}px`;cursorOutline.animate({left:`${e.clientX}px`,top:`${e.clientY}px`},{duration:500,fill:"forwards"});const x=(e.clientX-window.innerWidth/2)/(window.innerWidth/2),y=(e.clientY-window.innerHeight/2)/(window.innerHeight/2);gsap.to(pupil,{x:x*30,y:y*15,duration:.3,ease:"power2.out"});});
gsap.set("#iris-eye",{xPercent:-50,yPercent:-50}); gsap.to("#iris-eye",{scale:1.03,duration:4,repeat:-1,yoyo:true,ease:"sine.inOut"});
function blink(){const tl=gsap.timeline({onComplete:()=>{setTimeout(blink,Math.random()*4000+2000)}});tl.to(eyelids,{scaleY:.1,duration:.1,ease:"power4.inOut",transformOrigin:"center"}).to(eyelids,{scaleY:1,duration:.15,ease:"power4.inOut"});}setTimeout(blink,2000);
pupilRings.forEach((ring,i)=>{gsap.to(ring,{attr:{r:parseFloat(ring.getAttribute('r'))+5},opacity:.1,duration:2,repeat:-1,yoyo:true,ease:"power1.inOut",delay:i*.2})});

gsap.registerPlugin(ScrollTrigger); 
document.querySelectorAll(".reveal").forEach((el)=>{
    gsap.to(el,{opacity:1,y:0,duration:1,ease:"power3.out",scrollTrigger:{trigger:el,start:"top 85%"}});
});

const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x000000, 0.002);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 6000); camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true}); renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; 

const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

document.getElementById('canvas-container').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 3.0); 
sunLight.position.set(0, 50, 200);
scene.add(sunLight);
const fillLight = new THREE.DirectionalLight(0x0044ff, 0.8); 
fillLight.position.set(-100, -50, 100); 
scene.add(fillLight);

const starCount = 3000; const geo = new THREE.BufferGeometry(); const positions = new Float32Array(starCount * 6); const velocities = []; 
for(let i=0; i<starCount; i++) {
    const x = (Math.random() - 0.5) * 400; const y = (Math.random() - 0.5) * 400; const z = (Math.random() - 0.5) * 1000 - 500; 
    positions[i*6] = x; positions[i*6+1] = y; positions[i*6+2] = z; positions[i*6+3] = x; positions[i*6+4] = y; positions[i*6+5] = z; velocities.push(Math.random());
}
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const warpMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
const warpLines = new THREE.LineSegments(geo, warpMat);
scene.add(warpLines);

function generateAlienTexture() {
    const size = 512; const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d');
    const baseHue = Math.random() * 360; const grdBase = ctx.createLinearGradient(0, 0, size, size);
    grdBase.addColorStop(0, `hsl(${baseHue}, 40%, 20%)`); grdBase.addColorStop(1, `hsl(${baseHue + 30}, 30%, 50%)`);
    ctx.fillStyle = grdBase; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * size; const y = Math.random() * size; const radius = Math.random() * size * 0.5 + 50;
        const lightness = Math.random() > 0.5 ? Math.random() * 20 + 10 : Math.random() * 60 + 40; const opacity = Math.random() * 0.15 + 0.05;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, radius); grd.addColorStop(0, `hsla(${baseHue + Math.random()*40-20}, 40%, ${lightness}%, ${opacity})`); grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, size, size);
    }
    return new THREE.CanvasTexture(canvas);
}
function generateRingTexture() {
    const size = 256; const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,size,size); const cx = size/2; const cy = size/2;
    for(let i=60; i<128; i+=1) { 
        if(Math.random() > 0.2) {
            ctx.beginPath(); ctx.arc(cx, cy, i, 0, Math.PI*2);
            const alpha = Math.random()*0.5 + 0.1;
            ctx.strokeStyle = `rgba(200, 220, 255, ${alpha})`; ctx.lineWidth = 1; ctx.stroke();
        }
    }
    return new THREE.CanvasTexture(canvas);
}
function generateSunTexture() {
    const size = 512; const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size; const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, '#ffdd00'); gradient.addColorStop(0.5, '#ff8800'); gradient.addColorStop(1, '#cc4400');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 300; i++) {
        ctx.beginPath(); ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 20 + 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${Math.floor(Math.random() * 200)}, 0, ${Math.random() * 0.5})`; ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

const activeBodies = []; let planetTimer = null; const MAX_BODIES = 5; 
function addRings(planetMesh, planetRadius) {
    const ringGeo = new THREE.RingGeometry(planetRadius * 1.3, planetRadius * 2.2, 64);
    const ringTex = generateRingTexture();
    const pos = ringGeo.attributes.position; const v3 = new THREE.Vector3(); 
    for (let i = 0; i < pos.count; i++){ v3.fromBufferAttribute(pos, i); ringGeo.attributes.uv.setXY(i, (v3.x/200)+0.5, (v3.y/200)+0.5); }
    const ringMat = new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, side: THREE.DoubleSide, opacity: 0.8, blending: THREE.AdditiveBlending });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * (0.2 + Math.random() * 0.3); ring.rotation.z = Math.random() * Math.PI * 2;
    planetMesh.add(ring); 
}
function spawnBody() {
    if (hasLaunched) return; 
    if (activeBodies.length >= MAX_BODIES) { planetTimer = setTimeout(spawnBody, 1000); return; }
    const isSun = Math.random() < 0.15; let bodyGeo, bodyMat, radius; let speed = Math.random() * 2 + 1; 
    if (isSun) {
        radius = Math.random() * 70 + 80; bodyGeo = new THREE.SphereGeometry(radius, 64, 64);
        const sunTexture = generateSunTexture();
        bodyMat = new THREE.MeshStandardMaterial({ map: sunTexture, emissive: 0xffaa00, emissiveMap: sunTexture, emissiveIntensity: 2, roughness: 1, metalness: 0 }); speed *= 1.5; 
    } else {
        radius = Math.random() * 35 + 5; const texture = generateAlienTexture();
        bodyGeo = new THREE.SphereGeometry(radius, 64, 64);
        bodyMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6, bumpMap: texture, bumpScale: Math.random()*0.3 + 0.05 });
    }
    const mesh = new THREE.Mesh(bodyGeo, bodyMat);
    if (!isSun && Math.random() < 0.4) { addRings(mesh, radius); }
    const side = Math.random() > 0.5 ? 1 : -1; const startX = side * (180 + Math.random() * 250); const startY = (Math.random() - 0.5) * 300; const startZ = - (Math.random() * 1200 + 1000); 
    mesh.position.set(startX, startY, startZ); mesh.userData.speed = speed; mesh.userData.radius = radius;
    scene.add(mesh); activeBodies.push(mesh);
    planetTimer = setTimeout(spawnBody, Math.random() * 3000 + 3000);
}
planetTimer = setTimeout(spawnBody, 2000); 
function clearAllBodies() { activeBodies.forEach(body => { scene.remove(body); body.geometry.dispose(); body.material.dispose(); }); activeBodies.length = 0; if (planetTimer) clearTimeout(planetTimer); }

const textureLoader = new THREE.TextureLoader();
function loadTexture(url) { const tex = textureLoader.load(url); tex.anisotropy = maxAnisotropy; return tex; }
const earthMap = loadTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
const earthBump = loadTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
const earthSpecular = loadTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
const cloudMap = loadTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_2048.png');

const earthGeo = new THREE.SphereGeometry(300, 64, 64); 
const earthMat = new THREE.MeshPhongMaterial({ 
    map: earthMap, bumpMap: earthBump, bumpScale: 5, 
    specularMap: earthSpecular, specular: new THREE.Color(0x555555), shininess: 25
});
const earthMesh = new THREE.Mesh(earthGeo, earthMat);

earthMesh.position.set(0, 0, -3000); 
earthMesh.rotation.y = Math.PI * 1.2; 
earthMesh.material.opacity = 0; 
earthMesh.material.transparent = true; 
earthMesh.visible = false; 

const cloudGeo = new THREE.SphereGeometry(302, 64, 64);
const cloudMat = new THREE.MeshPhongMaterial({ map: cloudMap, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
earthMesh.add(cloudMesh);
scene.add(earthMesh); 

let warpSpeed = { val: 0.05 }; let hasLaunched = false; let hasArrived = false;

function animate() {
    requestAnimationFrame(animate);

    if (!hasArrived) {
        const pos = warpLines.geometry.attributes.position.array;
        for(let i=0; i<starCount; i++) {
            const idx = i*6; pos[idx+2] += warpSpeed.val * (1 + velocities[i]); const streakLength = warpSpeed.val * 8; 
            pos[idx+5] = pos[idx+2] - streakLength; pos[idx+3] = pos[idx]; pos[idx+4] = pos[idx+1];
            if(pos[idx+2] > 50) {
                const newZ = -1000; const newX = (Math.random() - 0.5) * 400; const newY = (Math.random() - 0.5) * 400;
                pos[idx] = newX; pos[idx+1] = newY; pos[idx+2] = newZ; pos[idx+3] = newX; pos[idx+4] = newY; pos[idx+5] = newZ;
            }
        }
        warpLines.geometry.attributes.position.needsUpdate = true;
        for (let i = activeBodies.length - 1; i >= 0; i--) {
            const body = activeBodies[i]; body.position.z += body.userData.speed; body.rotation.y += 0.005 / (body.userData.radius / 20);
            if (body.position.z > 400) { scene.remove(body); body.geometry.dispose(); body.material.dispose(); activeBodies.splice(i, 1); }
        }
    }

    if (earthMesh.visible) {
        earthMesh.rotation.y += 0.0008; 
        cloudMesh.rotation.y += 0.0005;
    }
    renderer.render(scene, camera);
}
animate();

function handleFormSubmit(e) {
    e.preventDefault();
    if(hasLaunched) return;
    hasLaunched = true;
    clearAllBodies(); 

    const btn = document.getElementById('submitBtn'); btn.innerHTML = "JUMP COORDINATES LOCKED"; btn.style.background = "white"; btn.style.color = "black";
    document.body.style.overflow = "hidden"; 
    
    gsap.to("#site-wrapper", { opacity: 0, duration: 1, pointerEvents: "none" });
    gsap.to(".cursor-dot, .cursor-outline", { opacity: 0, duration: 0.5 });

    const tl = gsap.timeline();
    tl.to(warpSpeed, { val: 80, duration: 3.5, ease: "expo.in" }); 
    tl.to({}, { duration: 1.5 }); 
    tl.to(warpSpeed, { 
        val: 0.001, duration: 2.5, ease: "power4.out",
        onStart: () => { gsap.to(warpMat, { opacity: 0, duration: 2 }); }
    });
    tl.add(() => {
        hasArrived = true; 
        
        gsap.to(earthMesh.position, { x: -500, z: -900, duration: 4, ease: "power2.out", onStart: () => { earthMesh.visible = true; } });
        gsap.to(earthMesh.material, { opacity: 1, duration: 3, ease: "power2.out" });
        gsap.to(cloudMat, { opacity: 0.9, duration: 3, ease: "power2.out", delay: 0.5 });

        gsap.to("#final-screen", { opacity: 1, duration: 3 });
        gsap.to(".final-logo", { opacity: 1, scale: 1, duration: 1.5, ease: "back.out(1.7)" });
        gsap.to(".final-line", { y: 0, opacity: 1, stagger: 0.2, duration: 1.5, ease: "power3.out" });
    }, "-=1.5"); 
}

window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});
