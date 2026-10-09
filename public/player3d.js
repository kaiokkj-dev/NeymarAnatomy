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
  controls.minDistance = 1.1;
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
  const skin = mat('#b98260'), yellow = mat('#f9ce2e'), green = mat('#19724b');
  const blue = mat('#164bb0'), white = mat('#e8ede3'), black = mat('#20201d');
  const hair = mat('#211d19'), beard = mat('#413026');
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
  const torsoPoints=[[0,0],[.31,0],[.35,.12],[.36,.5],[.44,.88],[.4,1.03],[.21,1.12],[0,1.12]].map(([r,y])=>new THREE.Vector2(r,y));
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
    for(let i=0;i<22;i++) {
      const y=2.35-i*.022,x=side*(.612+(2.35-y)*.16);
      const mark=sphere(beard,[x,y,.1],[.025+(i%3)*.009,.01,.006]);mark.rotation.z=side*(i%4)*.3;
    }
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
  // Cabeça esculpida: maxilar mais estreito e maçãs do rosto marcadas.
  const head=new THREE.Group();head.position.set(0,3.43,0);body.add(head);
  const headGeometry=new THREE.SphereGeometry(1,64,48);
  const positions=headGeometry.attributes.position;
  for(let i=0;i<positions.count;i++) {
    let x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
    const jaw=y<-.22?1-(Math.abs(y)-.22)*.25:1;
    x*=jaw;
    if(z>0 && y>-.4 && y<.12)z+=.045*Math.cos(y*5)*Math.abs(x);
    positions.setXYZ(i,x*.265,y*.36,z*.248);
  }
  headGeometry.computeVertexNormals();
  mesh(headGeometry,skin,[0,0,0],[1,1,1],head,'head');
  function facialLine(points,radius,material) {
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),20,radius,8,false),material,[0,0,0],[1,1,1],head,'head');
  }
  const eyeWhite=mat('#e5dbca'), iris=mat('#654a2d'), lip=mat('#8f5847');
  for(const side of [-1,1]) {
    sphere(skin,[side*.266,-.005,-.006],[.045,.079,.038],head,'head');
    sphere(mat('#946145'),[side*.287,-.004,.021],[.018,.043,.012],head,'head');
    sphere(eyeWhite,[side*.105,.041,.232],[.05,.017,.014],head,'head');
    sphere(iris,[side*.104,.04,.244],[.018,.017,.008],head,'head');
    sphere(black,[side*.104,.04,.25],[.008,.012,.004],head,'head');
    sphere(white,[side*.099,.047,.253],[.0035,.0035,.002],head,'head');
    facialLine([[side*.057,.058,.239],[side*.1,.065,.242],[side*.152,.052,.231]],.006,beard);
    facialLine([[side*.052,.107,.235],[side*.099,.116,.237],[side*.16,.095,.211]],.011,hair);
    sphere(white,[side*.292,-.063,.022],[.009,.009,.006],head,'head');
  }
  sphere(skin,[0,.003,.252],[.024,.067,.025],head,'head');
  sphere(skin,[0,-.054,.278],[.039,.029,.034],head,'head');
  for(const side of [-1,1]) {
    sphere(skin,[side*.03,-.066,.263],[.021,.018,.022],head,'head');
    sphere(mat('#815338'),[side*.027,-.075,.275],[.009,.006,.007],head,'head');
  }
  // Barba curta acompanha o maxilar, com a região da boca livre.
  const beardGeometry=new THREE.SphereGeometry(1,64,24,0,Math.PI*2,Math.PI*.58,Math.PI*.42);
  const bp=beardGeometry.attributes.position;
  for(let i=0;i<bp.count;i++) {
    let x=bp.getX(i),y=bp.getY(i),z=bp.getZ(i);
    const jaw=1-(Math.abs(y)-.22)*.25;
    bp.setXYZ(i,x*jaw*.269,y*.362,z*.251);
  }
  beardGeometry.computeVertexNormals();
  mesh(beardGeometry,mat('#49372d'),[0,0,0],[1,1,1],head,'head');
  sphere(skin,[0,-.136,.231],[.107,.053,.036],head,'head');
  facialLine([[-.08,-.116,.247],[-.035,-.106,.26],[0,-.113,.266],[.035,-.106,.26],[.08,-.116,.247]],.009,beard);
  sphere(lip,[0,-.145,.265],[.073,.012,.009],head,'head');
  facialLine([[-.066,-.139,.267],[0,-.139,.275],[.066,-.139,.267]],.0035,mat('#593c30'));
  sphere(mat('#563b2d'),[0,-.194,.226],[.025,.036,.01],head,'head');
  // Laterais baixas e cachos escuros no topo, sem o cabelo loiro anterior.
  mesh(new THREE.SphereGeometry(1,48,24,0,Math.PI*2,0,Math.PI*.43),hair,[0,.1,-.026],[.271,.264,.25],head,'head');
  for(let i=0;i<115;i++) {
    const angle=i*2.39996,rad=.232*Math.sqrt((i+.5)/115);
    const x=Math.cos(angle)*rad,z=Math.sin(angle)*rad;
    const y=.1+.264*Math.sqrt(1-(rad/.271)**2);
    sphere(i%7===0?mat('#514332'):hair,[x,y,z-.026],[.032,.026+(i%3)*.005,.032],head,'head');
  }
  // Detalhe ilustrativo no pescoço; não é uma reprodução das tatuagens reais.
  const neckInk=mat('#51483b');
  for(let i=0;i<5;i++)sphere(neckInk,[.08+i*.011,3.13+i*.007,.13],[.005,.019,.004]);
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
  document.getElementById('face-camera').addEventListener('click',()=>{
    controls.target.set(0,3.43,0);camera.position.set(.12,3.49,1.7);controls.update();
  });
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
