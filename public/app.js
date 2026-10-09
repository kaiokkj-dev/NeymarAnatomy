// O estado guarda a seleção atual; os números sempre vêm dos mesmos gols filtrados.
const labels = {right:'Pé direito',left:'Pé esquerdo',head:'Cabeça',other:'Outra parte',unknown:'Não informado'};
const state = {goals:[],references:[],part:'all',team:'all',year:'all'};
const el = id => document.getElementById(id);
const filtered = () => state.goals.filter(g => (state.team==='all'||g.team===state.team)&&(state.year==='all'||g.date.slice(0,4)===state.year));
function textNode(tag, text, className) {
  const node=document.createElement(tag); node.textContent=text;
  if(className) node.className=className;
  return node;
}
function safeUrl(value) {try {const url=new URL(value);return url.protocol==='https:'?url.href:null;} catch{return null;}}
const teamIcons={Santos:'club-santos-coroa.png',Barcelona:'club-barcelona.png',PSG:'club-psg.png',Brasil:'club-brasil.png','Al-Hilal':'club-al-hilal.svg'};
function teamIcon(team){if(!teamIcons[team])return textNode('span',team);const img=document.createElement('img');img.src=teamIcons[team];img.alt=team;img.title=team;img.width=32;img.height=32;return img;}
function buildClubFilters(){
 el('club-filters').replaceChildren();
 for(const team of ['all',...new Set([...state.goals.map(g=>g.team),...state.references.map(r=>r.team)])]){
 const button=textNode('button','','club-filter');button.type='button';button.dataset.team=team;button.setAttribute('aria-label',team==='all'?'Todos os times':`Filtrar ${team}`);button.title=team==='all'?'Todos os times':team;
 button.append(team==='all'?textNode('span','Todos'):teamIcon(team));button.addEventListener('click',()=>{state.team=team;el('team').value=team;render();});el('club-filters').append(button);
 }
}
function renderReferences(){
 if(!state.references.length)return;
 const refs=state.references;
 const total=refs.reduce((sum,r)=>sum+r.goals,0);
 el('overview-goals').textContent=total;
 document.querySelector('.career-total .metric-label').textContent='GOLS NAS REFERÊNCIAS';
 el('base-badge').textContent='TOTAIS COM FONTE';
 const colors=['#c6f65b','#5dc4ef','#f1b84e','#bb93ed','#858f9e'];
 el('overview-distribution').replaceChildren();
 document.querySelector('.distribution-legend').replaceChildren();
 el('overview-distribution').setAttribute('aria-label','Distribuição dos totais de referência por time');
 const cards=document.querySelector('.overview-mini-grid');cards.classList.add('reference-grid');cards.replaceChildren();
 refs.forEach((r,i)=>{
  const segment=textNode('span','');segment.style.width=`${r.goals/total*100}%`;segment.style.background=colors[i%colors.length];segment.title=`${r.team}: ${r.goals}`;el('overview-distribution').append(segment);
  const legend=textNode('span',r.team);const dot=document.createElement('i');dot.style.background=colors[i%colors.length];legend.prepend(dot);document.querySelector('.distribution-legend').append(legend);
  const card=textNode('a','','overview-mini reference-mini');card.href=safeUrl(r.source_url);card.target='_blank';card.rel='noopener noreferrer';
  const title=textNode('span','');if(teamIcons[r.team])title.append(teamIcon(r.team));title.append(textNode('span',r.team));
  card.append(title,textNode('strong',r.goals),textNode('small',r.complete_period?`${r.period} · Fonte ↗`:`Até ${r.as_of.split('-').reverse().join('/')} · Fonte ↗`));cards.append(card);
 });
 el('status').textContent='Soma das referências por time, com datas diferentes. Ainda não é o total atualizado da carreira. Divisão por pé direito, esquerdo e cabeça em conferência.';
 const selected=state.team==='all'?refs:refs.filter(r=>r.team===state.team);
 if(!state.goals.length && state.year==='all' && selected.length){
  const sum=selected.reduce((n,r)=>n+r.goals,0);
  el('total').textContent=sum;el('teams').textContent=selected.length;el('matches').textContent=selected.every(r=>r.matches!==null)?selected.reduce((n,r)=>n+r.matches,0):'—';
  document.querySelector('.summary > div:first-child span').textContent='GOLS DE REFERÊNCIA';
  document.querySelector('.summary > div:last-child span').textContent='JOGOS NAS FONTES';
  el('selected-count').textContent=state.part==='all'?sum:'—';
  el('selected-percent').textContent=state.part==='all'?'Total de referência · fonte e data na visão geral':'Classificação por parte do corpo em conferência';
  el('bars').querySelectorAll('b').forEach(n=>n.textContent='—');
  document.querySelector('.fineprint').textContent='Totais de referência. Gols individuais e partes do corpo em catalogação.';
  el('result-count').textContent='Gols individuais em catalogação';
  el('goal-list').replaceChildren(textNode('p','Os totais já estão disponíveis. Os lances individuais ainda estão sendo conferidos.','empty'));
 }
}
function render() {
 el('selected-team').textContent=state.team==='all'?'Todos os times':state.team;
 document.querySelectorAll('.club-filter').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.team===state.team)));
  const all=state.goals;
  if(!state.references.length){
   el('overview-goals').textContent=all.length;
   el('overview-teams').textContent=new Set(all.map(g=>g.team)).size;
   el('overview-matches').textContent=new Set(all.map(g=>`${g.date}|${g.team}|${g.opponent}|${g.competition}`)).size;
   el('overview-left').textContent=all.filter(g=>g.body_part==='left').length;
   el('overview-head').textContent=all.filter(g=>g.body_part==='head').length;
  }
  el('overview-distribution').replaceChildren();
  for(const [part,color] of [['right','#c6f65b'],['left','#5dc4ef'],['head','#f1b84e'],['other','#858f9e'],['unknown','#596273']]){
    const count=all.filter(g=>g.body_part===part).length;
    if(!count)continue;
    const segment=document.createElement('span');segment.style.width=`${count/all.length*100}%`;segment.style.background=color;segment.title=`${labels[part]}: ${count}`;
    el('overview-distribution').append(segment);
  }
  const base=filtered();
  const selected=base.filter(g=>state.part==='all'||g.body_part===state.part);
  el('total').textContent=base.length;
  el('teams').textContent=new Set(base.map(g=>g.team)).size;
  el('matches').textContent=new Set(base.map(g=>`${g.date}|${g.team}|${g.opponent}|${g.competition}`)).size;
  el('part-title').textContent=state.part==='all'?'Todos os gols':labels[state.part];
  el('selected-count').textContent=selected.length;
  el('selected-percent').textContent=base.length?`${Math.round(selected.length/base.length*100)}% dos gols neste filtro`:'Nenhum gol neste filtro';
  window.dispatchEvent(new CustomEvent('anatomy-state', {detail: state.part}));
  window.dispatchEvent(new CustomEvent('anatomy-team', {detail: state.team}));
  el('bars').replaceChildren();
  Object.entries(labels).forEach(([part,label])=>{
    const count=base.filter(g=>g.body_part===part).length;
    if(!count && !['right','left','head'].includes(part))return;
    const button=document.createElement('button');button.className='bar-button';button.setAttribute('aria-pressed',String(state.part===part));
    button.append(textNode('span',label));
    const track=textNode('span','','track'),fill=textNode('span','','fill');fill.style.width=`${base.length?count/base.length*100:0}%`;track.append(fill);button.append(track,textNode('b',count));
    button.addEventListener('click',()=>{state.part=part;render();});el('bars').append(button);
  });
  el('result-count').textContent=`${selected.length} ${selected.length===1?"gol encontrado":"gols encontrados"}`;
  el('goal-list').replaceChildren();
  if(!selected.length)el('goal-list').append(textNode('p','Nenhum gol encontrado. Experimente outro filtro.','empty'));
  selected.toSorted((a,b)=>b.date.localeCompare(a.date)).forEach(g=>{
    const card=textNode('article','','goal-card');
    const meta=textNode('div','','goal-meta');meta.append(teamIcon(g.team),textNode('span',new Date(`${g.date}T12:00:00`).toLocaleDateString('pt-BR')));
    card.append(meta,textNode('h3',g.title),textNode('p',`${g.team} × ${g.opponent} · ${g.minute??'—'}′`),textNode('p',g.competition));
    const tags=textNode('div','','tags');tags.append(textNode('span',labels[g.body_part]||'Não informado','tag'),textNode('span',g.method,'tag'));card.append(tags);
    const url=safeUrl(g.highlight_url);
    const link=textNode('a',url?'Assistir ao highlight ↗':'Buscar highlight no YouTube ↗','video-link');
    link.href=url||`https://www.youtube.com/results?search_query=${encodeURIComponent(`Neymar ${g.team} ${g.opponent} ${g.date} gol`)}`;link.target='_blank';link.rel='noopener noreferrer';card.append(link);
    const source=safeUrl(g.source_url);if(source){const a=textNode('a','Fonte do registro ↗','video-link');a.href=source;a.target='_blank';a.rel='noopener noreferrer';card.append(a);}
    el('goal-list').append(card);
  });
  renderReferences();
}
window.addEventListener('anatomy-select', event => {
  if (['head', 'right', 'left'].includes(event.detail)) {state.part = event.detail; render();}
});
el('reset').addEventListener('click',()=>{state.part='all';render();});
document.querySelectorAll('[data-overview-part]').forEach(button=>button.addEventListener('click',()=>{
  state.part=button.dataset.overviewPart;state.team='all';state.year='all';el('team').value='all';el('year').value='all';render();
  document.getElementById('anatomy').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  document.getElementById('part-title').setAttribute('tabindex','-1');document.getElementById('part-title').focus({preventScroll:true});
}));
['team','year'].forEach(id=>el(id).addEventListener('change',event=>{state[id]=event.target.value;render();}));
async function load() {
  try {
    const response=await fetch('/api/goals');if(!response.ok)throw new Error();
    const data=await response.json();state.goals=data.goals;
    if(data.mode==='database'){
      const referenceResponse=await fetch('/api/career-reference');
      if(!referenceResponse.ok)throw new Error();
      const referenceData=await referenceResponse.json();
      const latest=new Map();
      for(const r of referenceData.records){if(!latest.has(r.team)||r.as_of>latest.get(r.team).as_of)latest.set(r.team,r);}
      state.references=[...latest.values()].sort((a,b)=>b.goals-a.goals);
    }
    el('base-badge').textContent=data.mode==='demo'?'BASE DEMONSTRATIVA':'REGISTROS CADASTRADOS';
    for(const [id,values] of [['team',[...new Set([...state.goals.map(g=>g.team),...state.references.map(r=>r.team)])].sort()],['year',[...new Set(state.goals.map(g=>g.date.slice(0,4)))].sort().reverse()]]){
      values.forEach(value=>{const option=textNode('option',value);option.value=value;el(id).append(option);});
    }
    el('status').textContent=data.mode==='demo'?'DEMONSTRAÇÃO · Amostra de 8 registros ilustrativos. Não são os totais da carreira; classificações ainda não verificadas.':'BASE CONECTADA · Gols catalogados; a base ainda não representa toda a carreira.';
    buildClubFilters();render();
  } catch {
    el('base-badge').textContent='BASE INDISPONÍVEL';
    el('status').replaceChildren(textNode('span','Não foi possível carregar os dados. '));
    const retry=textNode('button','Tentar novamente');retry.addEventListener('click',load);el('status').append(retry);
  }
}
load();
