import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

const host = document.getElementById('model-viewer');
const label = document.getElementById('model-label');
let selected = 'all';
let hovered = null;
const selectable = [];
const names = { head: 'Cabeça', right: 'Pé direito', left: 'Pé esquerdo' };

try {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 50);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.domElement.setAttribute('aria-label', 'Personagem 3D: arraste para girar, use a roda ou pinça para aproximar. Selecione cabeça ou chuteiras.');
  host.append(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.85, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 4.6;
  controls.maxDistance = 12;
  controls.minPolarAngle = .35;
  controls.maxPolarAngle = Math.PI * .68;
  camera.position.set(.4, 2.6, 8);
  controls.update();
  scene.add(new THREE.HemisphereLight(0xdcecff, 0x3c4023, 2.2));
  const key = new THREE.DirectionalLight(0xffecd5, 3.5); key.position.set(-3, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc6f65b, 2); rim.position.set(3, 4, -3); scene.add(rim);
  const body = new THREE.Group(); scene.add(body);
  const mat = color => new THREE.MeshStandardMaterial({ color, roughness: .72 });
  const skin = mat('#b67b54'), yellow = mat('#f9ce2e'), green = mat('#19724b');
  const blue = mat('#164bb0'), white = mat('#e8ede3'), black = mat('#20201d');
  const hair = mat('#28231d'), blond = mat('#ab8052'), beard = mat('#463229');
  function mesh(geometry, material, position, scale = [1,1,1], parent = body, part = null) {
    const obj = new THREE.Mesh(geometry, part ? material.clone() : material);
    obj.position.set(...position);obj.scale.set(...scale); parent.add(obj);
    if(part){obj.userData.part=part;selectable.push(obj);}
    return obj;
  }
  function sphere(material, position, scale, parent=body, part=null) {
    return mesh(new THREE.SphereGeometry(1,32,24),material,position,scale,parent,part);
  }
  function limb(a,b,r1,r2,material,parent=body) {
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);
    const obj=mesh(new THREE.CylinderGeometry(r2,r1,start.distanceTo(end),24),material,[0,0,0],[1,1,1],parent);
    obj.position.copy(start.add(end).multiplyScalar(.5));
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...b).sub(new THREE.Vector3(...a)).normalize());
    return obj;
  }
  // Cada região selecionável é uma superfície real do personagem.
  const torsoPoints=[[.31,0],[.37,.12],[.38,.5],[.47,.88],[.42,1.03],[.24,1.12]].map(([r,y])=>new THREE.Vector2(r,y));
  const torso=mesh(new THREE.LatheGeometry(torsoPoints,40),yellow,[0,1.9,0]);torso.scale.z=.62;
  limb([0,2.95,0],[0,3.22,0],.15,.15,skin);
  const collar=mesh(new THREE.TorusGeometry(.19,.04,10,40),green,[0,3.01,0]);collar.rotation.x=Math.PI/2;
  for(const side of [-1,1]) {
    limb([side*.38,2.89,0],[side*.55,2.58,0],.17,.155,yellow);
    limb([side*.55,2.6,0],[side*.59,2.51,0],.16,.15,green);
    limb([side*.58,2.52,0],[side*.66,2.15,.015],.13,.11,skin);
    sphere(skin,[side*.66,2.15,.015],[.115,.115,.115]);
    limb([side*.66,2.15,.015],[side*.72,1.81,.05],.105,.085,skin);
    sphere(skin,[side*.73,1.7,.045],[.095,.15,.075]);
    sphere(skin,[side*.66,1.72,.105],[.04,.075,.04]);
    // Faixas ilustrativas nos braços, inspiradas em tatuagens.
    for(let i=0;i<4;i++)limb([side*(.67+i*.011),2.04-i*.052,.01],[side*(.675+i*.011),2.026-i*.052,.01],.109-i*.003,.109-i*.003,beard);
    const x=side*.23;
    limb([x,1.98,0],[x,1.43,0],.225,.205,blue);
    limb([x,1.47,0],[x,1.02,.01],.16,.13,skin);
    sphere(skin,[x,1.02,.01],[.135,.14,.135]);
    limb([x,1.0,.01],[x,.28,0],.13,.09,white);
    limb([x,1.02,.01],[x,.96,.01],.138,.138,green);
    limb([x,.96,.01],[x,.91,.01],.136,.134,yellow);
    const footPart=side===-1?'right':'left';
    sphere(white,[x,.15,.13],[.14,.12,.29],body,footPart);
    sphere(black,[x,.068,.13],[.142,.035,.29],body,footPart);
    for(let z of [-.03,.26]) for(let dx of [-.07,.07]) sphere(yellow,[x+dx,.029,z],[.026,.035,.026],body,footPart);
    for(let i=0;i<4;i++) {
      const lace=limb([x-.065,.245,.12+i*.025],[x+.065,.245,.12+i*.025],.009,.009,green);
      lace.userData.part=footPart;
    }
  }
  const head=new THREE.Group();head.position.set(0,3.43,0);body.add(head);
  sphere(skin,[0,0,0],[.285,.35,.265],head,'head');
  for(const side of [-1,1]) {
    sphere(skin,[side*.282,-.01,0],[.065,.095,.055],head,'head');
    sphere(black,[side*.105,.035,.239],[.036,.024,.018],head,'head');
    sphere(white,[side*.098,.043,.251],[.008,.008,.005],head,'head');
    const brow=sphere(hair,[side*.11,.095,.229],[.071,.019,.024],head,'head');brow.rotation.z=side*.12;
    sphere(beard,[side*.14,-.175,.162],[.094,.083,.054],head,'head');
    sphere(white,[side*.31,-.05,.018],[.012,.012,.012],head,'head');
  }
  sphere(skin,[0,-.035,.27],[.042,.071,.045],head,'head');
  sphere(beard,[0,-.24,.117],[.16,.058,.096],head,'head');
  sphere(beard,[0,-.112,.249],[.091,.02,.02],head,'head');
  sphere(mat('#81503d'),[0,-.146,.256],[.071,.015,.013],head,'head');
  // Cabelo curto com mechas claras.
  mesh(new THREE.SphereGeometry(1,32,16,0,Math.PI*2,0,Math.PI*.48),hair,[0,.075,-.025],[.291,.29,.263],head,'head');
  for(let i=0;i<42;i++) {
    const angle=i*2.39996,rad=.21*Math.sqrt((i+.5)/42);
    const x=Math.cos(angle)*rad,z=Math.sin(angle)*rad;
    const y=.075+.29*Math.sqrt(1-(rad/.29)**2);
    sphere(i%3?blond:hair,[x,y,z-.025],[.048,.043,.047],head,'head');
  }
  function print(text,y,z,back=false) {
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#176c48';ctx.font='bold 160px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,128,135);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const obj=mesh(new THREE.PlaneGeometry(.4,.4),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}),[0,y,z]);
    if(back)obj.rotation.y=Math.PI;
  }
  print('10',2.47,.282); print('10',2.47,-.282,true);
  sphere(green,[.21,2.81,.265],[.047,.06,.009]);
  const pedestal=mesh(new THREE.CylinderGeometry(.85,.9,.055,64),mat('#293322'),[0,-.055,0]);
  const ring=mesh(new THREE.TorusGeometry(.88,.008,8,80),mat('#b2d66b'),[0,-.02,0]);ring.rotation.x=Math.PI/2;
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function hit(event) {
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    // A primeira superfície visível impede selecionar uma parte escondida.
    const first = raycaster.intersectObjects(body.children,true)[0];
    return first?.object.userData.part||null;
  }
  function highlight() {
    for(const obj of selectable){const part=obj.userData.part;obj.material.emissive.set(part===selected?'#80a92d':part===hovered?'#52711e':'#000000');obj.material.emissiveIntensity=part===selected?.65:.45;}
    renderer.domElement.style.cursor=hovered?'pointer':'grab';
    label.textContent=names[hovered]||names[selected]||'Cabeça e pés selecionáveis · arraste para girar';
  }
  let down=null;
  renderer.domElement.addEventListener('pointerdown',event=>{down={x:event.clientX,y:event.clientY,id:event.pointerId};});
  renderer.domElement.addEventListener('pointermove',event=>{hovered=hit(event);highlight();});
  renderer.domElement.addEventListener('pointerleave',()=>{hovered=null;highlight();});
  renderer.domElement.addEventListener('pointercancel',()=>{down=null;});
  renderer.domElement.addEventListener('pointerup',event=>{
    if(down&&down.id===event.pointerId&&Math.hypot(event.clientX-down.x,event.clientY-down.y)<6){const part=hit(event);if(part)window.dispatchEvent(new CustomEvent('anatomy-select',{detail:part}));}
    down=null;
  });
  window.addEventListener('anatomy-state',event=>{selected=event.detail;highlight();});
  document.getElementById('reset-camera').addEventListener('click',()=>{controls.reset();});
  controls.saveState();
  document.getElementById('rotate-left').addEventListener('click',()=>rotate(.45));
  document.getElementById('rotate-right').addEventListener('click',()=>rotate(-.45));
  function rotate(angle){const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),angle);camera.position.copy(controls.target).add(offset);controls.update();}
  new ResizeObserver(()=>{
    const width=host.clientWidth,height=host.clientHeight;
    renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();
    if(width<350&&camera.position.distanceTo(controls.target)<8){camera.position.set(.4,2.6,10);controls.update();controls.saveState();}
  }).observe(host);
  renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();label.textContent='Visualização interrompida. Recarregue ou use os controles do painel.';});
  label.textContent='3D ESTILIZADO · ARRASTE PARA GIRAR';
  host.classList.add('ready');
} catch(error) {
  label.textContent='3D indisponível neste navegador. Use os controles do painel.';
  host.classList.add('unavailable');
  console.error('Falha ao iniciar o personagem 3D',error);
}
