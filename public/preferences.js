// Preferências locais: o idioma também acompanha os dados renderizados pelos filtros.
const translations = {
 'Visão geral':'Overview','Anatomia':'Anatomy','Gols & momentos':'Goals & moments','Gols & momentos.':'Goals & moments.',
 'Anatomia dos gols':'Goal anatomy','O jogo, parte por parte.':'The game, part by part.',
 'CLUBE ATUAL':'CURRENT CLUB','GOLS CADASTRADOS':'RECORDED GOALS','Registros disponíveis para explorar':'Available records to explore',
 'Perfil':'Profile','Atacante':'Forward','Seleção':'National team','Experiência':'Experience','Anatomia dos gols':'Goal anatomy',
 'Explorar o jogador':'Explore the player','CAMISA 10':'NUMBER 10','◎ VISÃO GERAL DOS GOLS':'◎ GOALS OVERVIEW',
 'BASE DEMONSTRATIVA':'DEMO DATA','REGISTROS CADASTRADOS':'RECORDED DATA','CARREGANDO BASE':'LOADING DATA','BASE INDISPONÍVEL':'DATA UNAVAILABLE',
 'GOLS NA BASE':'GOALS IN DATASET','Explore a distribuição por parte do corpo.':'Explore goals by body part.',
 'Direito':'Right','Esquerdo':'Left','Cabeça':'Head','Partidas na base':'Matches in dataset','Ver os registros ↗':'View records ↗',
 'Times na base':'Teams in dataset','Clubes e seleção ↗':'Clubs and national team ↗','Gols com o pé esquerdo':'Left-foot goals',
 'Gols de cabeça':'Headers','Explorar região ↗':'Explore region ↗','Explorar anatomia':'Explore anatomy',
 'Selecione uma parte. Explore os gols.':'Select a body part. Explore the goals.',
 'DEMONSTRAÇÃO · Amostra de 8 registros ilustrativos. Não são os totais da carreira; classificações ainda não verificadas.':'DEMO · Sample of 8 illustrative records. These are not career totals; classifications are not yet verified.',
 'BASE CONECTADA · Estatísticas dos registros cadastrados no Supabase.':'CONNECTED DATA · Statistics from records stored in Supabase.',
 'TIME ·':'TEAM ·','Todos os times':'All teams','Todos':'All','PERÍODO':'PERIOD','Todos os anos':'All years','TIMES':'TEAMS','PARTIDAS NA BASE':'MATCHES IN DATASET',
 'ANATOMIA DO GOL':'GOAL ANATOMY','Todos os gols':'All goals','Pé direito':'Right foot','Pé esquerdo':'Left foot','Outra parte':'Other body part','Não informado':'Unknown',
 'Ver todas as partes':'View all body parts','O JOGO EM REGISTROS':'THE GAME IN RECORDS',
 'Cabeça e chuteiras selecionáveis':'Selectable head and boots','Ver contorno de perto ↗':'Inspect outline ↗',
 'Clique diretamente na cabeça ou em uma chuteira':'Click directly on the head or a boot',
 'Contagens calculadas sobre os registros disponíveis.':'Counts calculated from available records.',
 'Parte do corpo e tipo de jogada são classificações diferentes.':'Body part and play type are different classifications.',
 'Buscar highlight no YouTube ↗':'Find highlight on YouTube ↗','Assistir ao highlight ↗':'Watch highlight ↗','Fonte do registro ↗':'Record source ↗',
 'Bola rolando':'Open play','Falta':'Free kick','Pênalti':'Penalty','Contorno em detalhe':'Outline detail',
 'A linha acompanha a borda da imagem. O limite da região é definido na meia ou no pescoço.':'The outline follows the image edge. The region ends at the sock or neck.',
 'PROJETO INDEPENDENTE · PORTFÓLIO':'INDEPENDENT PROJECT · PORTFOLIO','Voltar ao topo ↑':'Back to top ↑',
 'Nenhum gol encontrado. Experimente outro filtro.':'No goals found. Try another filter.','Nenhum gol neste filtro':'No goals in this filter',
 'NEYMAR · IMAGEM DO PROTÓTIPO':'NEYMAR · PROTOTYPE IMAGE','Explore Barcelona 2015 ou Brasil 2016 no filtro de time.':'Explore Barcelona 2015 or Brazil 2016 using the team filter.',
 'A fase da tríplice coroa. Recorte preparado a partir de uma foto da final da Champions.':'The treble season. Cutout prepared from a Champions League final photograph.',
 'Selecionar Pé direito':'Select right foot','Selecionar Pé esquerdo':'Select left foot','Selecionar Cabeça':'Select head','Filtrar Santos':'Filter Santos','Filtrar Barcelona':'Filter Barcelona','Filtrar PSG':'Filter PSG','Filtrar Brasil':'Filter Brazil','Time':'Team','Fechar detalhe':'Close detail','Escudo do Santos':'Santos crest','Demonstração':'Demo','Jogos Olímpicos':'Olympic Games','Exemplo com o pé esquerdo':'Left-foot goal example','Exemplo de gol de cabeça':'Header example','Acreditar até o fim':'Believe until the end','A remontada continua':'The comeback continues','Um país em festa':'A nation celebrates','A noite da conquista':'A night of triumph','No lugar certo':'In the right place','Drible, magia e gol':'Dribbling, magic and a goal','Exibindo a imagem-base do Brasil. Vamos preparar esta fase em seguida.':'Showing the base Brazil image. This era will be prepared next.',
 'SANTOS · LIBERTADORES, 2011':'SANTOS · LIBERTADORES, 2011','A comemoração do gol na final contra o Peñarol. Recorte preparado a partir da fotografia de Marcos Ribolli.':'Celebrating the goal in the final against Peñarol. Cutout prepared from a photograph by Marcos Ribolli.',
 'Estatísticas dos registros disponíveis.':'Statistics from available records.',
 'A comemoração após a classificação contra o Dortmund no Parc des Princes.':'Celebrating qualification against Dortmund at the Parc des Princes.',
 'Atacante · Brasil · Camisa 10':'Forward · Brazil · Number 10',
 'NEYMAR JR. · TODOS OS TIMES':'NEYMAR JR. · ALL TEAMS','Selecione um time para explorar cada fase.':'Select a team to explore each era.',
 'O pênalti decisivo do primeiro ouro olímpico. Maracanã, 20 de agosto de 2016.':'The decisive penalty for the first Olympic gold. Maracanã, August 20, 2016.',
 'Idioma':'Language','Ativar modo claro':'Switch to light mode','Ativar modo escuro':'Switch to dark mode'
};
const spanishTranslations={
 'O pênalti decisivo do primeiro ouro olímpico. Maracanã, 20 de agosto de 2016.':'El penalti decisivo del primer oro olímpico. Maracanã, 20 de agosto de 2016.',
'NEYMAR JR. · TODOS OS TIMES':'NEYMAR JR. · TODOS LOS EQUIPOS','Selecione um time para explorar cada fase.':'Selecciona un equipo para explorar cada etapa.',
'Visão geral':'Resumen','Anatomia':'Anatomía','Gols & momentos':'Goles y momentos','Gols & momentos.':'Goles y momentos.','Anatomia dos gols':'Anatomía de los goles','Atacante · Brasil · Camisa 10':'Delantero · Brasil · Dorsal 10','CLUBE ATUAL':'CLUB ACTUAL','◎ VISÃO GERAL DOS GOLS':'◎ RESUMEN DE GOLES','BASE DEMONSTRATIVA':'DATOS DE EJEMPLO','REGISTROS CADASTRADOS':'REGISTROS GUARDADOS','CARREGANDO BASE':'CARGANDO DATOS','BASE INDISPONÍVEL':'DATOS NO DISPONIBLES','GOLS NA BASE':'GOLES REGISTRADOS','Direito':'Derecho','Esquerdo':'Izquierdo','Cabeça':'Cabeza','Partidas na base':'Partidos registrados','Ver os registros ↗':'Ver registros ↗','Times na base':'Equipos registrados','Clubes e seleção ↗':'Clubes y selección ↗','Gols com o pé esquerdo':'Goles con el pie izquierdo','Gols de cabeça':'Goles de cabeza','Explorar região ↗':'Explorar zona ↗','Explorar anatomia':'Explorar anatomía','Selecione uma parte. Explore os gols.':'Selecciona una parte. Explora los goles.',
'DEMONSTRAÇÃO · Amostra de 8 registros ilustrativos. Não são os totais da carreira; classificações ainda não verificadas.':'EJEMPLO · Muestra de 8 registros ilustrativos. No son los totales de su carrera; clasificaciones aún no verificadas.',
'TIME ·':'EQUIPO ·','Todos os times':'Todos los equipos','Todos':'Todos','PERÍODO':'PERÍODO','Todos os anos':'Todos los años','Time':'Equipo','TIMES':'EQUIPOS','PARTIDAS NA BASE':'PARTIDOS REGISTRADOS','ANATOMIA DO GOL':'ANATOMÍA DEL GOL','Todos os gols':'Todos los goles','Pé direito':'Pie derecho','Pé esquerdo':'Pie izquierdo','Outra parte':'Otra parte','Não informado':'Sin información','Ver todas as partes':'Ver todas las partes','Estatísticas dos registros disponíveis.':'Estadísticas de los registros disponibles.','O JOGO EM REGISTROS':'EL JUEGO EN REGISTROS','Cabeça e chuteiras selecionáveis':'Cabeza y botas seleccionables','Ver contorno de perto ↗':'Ver contorno de cerca ↗','Clique diretamente na cabeça ou em uma chuteira':'Haz clic en la cabeza o en una bota','Selecionar Pé direito':'Seleccionar pie derecho','Selecionar Pé esquerdo':'Seleccionar pie izquierdo','Selecionar Cabeça':'Seleccionar cabeza','Filtrar Santos':'Filtrar Santos','Filtrar Barcelona':'Filtrar Barcelona','Filtrar PSG':'Filtrar PSG','Filtrar Brasil':'Filtrar Brasil','Contorno em detalhe':'Contorno en detalle','Fechar detalhe':'Cerrar detalle','Escudo do Santos':'Escudo del Santos','Idioma':'Idioma','Ativar modo claro':'Activar modo claro','Ativar modo escuro':'Activar modo oscuro','Buscar highlight no YouTube ↗':'Buscar resumen en YouTube ↗','Assistir ao highlight ↗':'Ver resumen ↗','Fonte do registro ↗':'Fuente del registro ↗','Bola rolando':'Jugada','Falta':'Tiro libre','Pênalti':'Penalti','Voltar ao topo ↑':'Volver arriba ↑','PROJETO INDEPENDENTE · PORTFÓLIO':'PROYECTO INDEPENDIENTE · PORTAFOLIO','Nenhum gol encontrado. Experimente outro filtro.':'No se encontraron goles. Prueba otro filtro.','Nenhum gol neste filtro':'Sin goles en este filtro','Exemplo com o pé esquerdo':'Ejemplo de gol con el pie izquierdo','Exemplo de gol de cabeça':'Ejemplo de gol de cabeza','Acreditar até o fim':'Creer hasta el final','A remontada continua':'La remontada continúa','Um país em festa':'Un país de fiesta','A noite da conquista':'La noche de la conquista','No lugar certo':'En el lugar correcto','Drible, magia e gol':'Regate, magia y gol','Demonstração':'Ejemplo','Jogos Olímpicos':'Juegos Olímpicos','NEYMAR · IMAGEM DO PROTÓTIPO':'NEYMAR · IMAGEN DEL PROTOTIPO','Explore Barcelona 2015 ou Brasil 2016 no filtro de time.':'Explora Barcelona 2015 o Brasil 2016 con el filtro de equipo.','A fase da tríplice coroa. Recorte preparado a partir de uma foto da final da Champions.':'La temporada del triplete. Recorte preparado a partir de una foto de la final de la Champions.','A comemoração do gol na final contra o Peñarol. Recorte preparado a partir da fotografia de Marcos Ribolli.':'La celebración del gol en la final contra Peñarol. Recorte preparado a partir de la fotografía de Marcos Ribolli.','A comemoração após a classificação contra o Dortmund no Parc des Princes.':'La celebración tras la clasificación contra Dortmund en el Parc des Princes.','A linha acompanha a borda da imagem. O limite da região é definido na meia ou no pescoço.':'La línea sigue el borde de la imagen. La zona termina en el calcetín o en el cuello.'
};
const reverseTranslations=Object.fromEntries(Object.entries(translations).map(([pt,en])=>[en,pt]));
let language='pt';
try{const saved=localStorage.getItem('anatomy-language');language=['pt','es','en'].includes(saved)?saved:'pt';}catch{}
const languageSelect=document.getElementById('language');
const themeToggle=document.getElementById('theme-toggle');
const reverseSpanish=Object.fromEntries(Object.entries(spanishTranslations).map(([pt,es])=>[es,pt]));
function translate(value){
 const trimmed=value.trim();let canonical=reverseTranslations[trimmed]||reverseSpanish[trimmed]||trimmed;
 canonical=canonical.replace(/^(\d+) goals found$/,'$1 gols encontrados').replace(/^(\d+) goal found$/,'$1 gol encontrado').replace(/^(\d+)% of goals in this filter$/,'$1% dos gols neste filtro').replace(/^(\d+) goles encontrados$/,'$1 gols encontrados').replace(/^(\d+) gol encontrado$/,'$1 gol encontrado').replace(/^(\d+)% de los goles en este filtro$/,'$1% dos gols neste filtro');
 let result=language==='en'?(translations[canonical]||canonical):language==='es'?(spanishTranslations[canonical]||canonical):canonical;
 if(language==='en')result=result.replace(/^(\d+) gols encontrados$/,'$1 goals found').replace(/^(\d+) gol encontrado$/,'$1 goal found').replace(/^(\d+)% dos gols neste filtro$/,'$1% of goals in this filter');
 if(language==='es')result=result.replace(/^(\d+) gols encontrados$/,'$1 goles encontrados').replace(/^(\d+) gol encontrado$/,'$1 gol encontrado').replace(/^(\d+)% dos gols neste filtro$/,'$1% de los goles en este filtro');
 return value.replace(trimmed,result);
}
function applyLanguage(){
 observer.disconnect();document.documentElement.lang=language==='pt'?'pt-BR':language;languageSelect.value=language;document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){const node=walker.currentNode;if(node.parentElement.closest('script,style,#language,.profile-brand-text strong,.footer-identity'))continue;const value=translate(node.nodeValue);if(value!==node.nodeValue)node.nodeValue=value;}
 document.querySelectorAll('[aria-label],[title]').forEach(node=>{for(const attr of ['aria-label','title'])if(node.hasAttribute(attr))node.setAttribute(attr,translate(node.getAttribute(attr)));});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
}
const observer=new MutationObserver(applyLanguage);
function applyTheme(theme){
 document.documentElement.dataset.theme=theme;
 themeToggle.setAttribute('aria-pressed',String(theme==='light'));
 const label=theme==='light'?'Ativar modo escuro':'Ativar modo claro';themeToggle.setAttribute('aria-label',translate(label));themeToggle.title=translate(label);
}
let savedTheme='dark';try{savedTheme=localStorage.getItem('anatomy-theme')==='light'?'light':'dark';}catch{}
applyTheme(savedTheme);applyLanguage();
themeToggle.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='light'?'dark':'light';applyTheme(theme);try{localStorage.setItem('anatomy-theme',theme);}catch{}});
languageSelect.addEventListener('change',()=>{language=languageSelect.value;try{localStorage.setItem('anatomy-language',language);}catch{}applyLanguage();});

document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{languageSelect.value=button.dataset.language;languageSelect.dispatchEvent(new Event('change'));}));
