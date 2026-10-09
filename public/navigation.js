// A aba acompanha a seção visível e mantém o estado acessível para leitores de tela.
const sectionLinks=[...document.querySelectorAll('.site-header nav a')];
const navigationSections=sectionLinks.map(link=>document.querySelector(link.hash));
function updateNavigation(){
  const offset=document.querySelector('.site-header').getBoundingClientRect().height+100;
  let section=navigationSections[0];
  for(const candidate of navigationSections){if(candidate.getBoundingClientRect().top<=offset)section=candidate;}
  for(const link of sectionLinks){
    const active=link.hash===`#${section.id}`;
    link.classList.toggle('active',active);
    if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  }
}
let navigationTick=false;
window.addEventListener('scroll',()=>{if(navigationTick)return;navigationTick=true;requestAnimationFrame(()=>{updateNavigation();navigationTick=false;});},{passive:true});
window.addEventListener('resize',updateNavigation);
updateNavigation();
