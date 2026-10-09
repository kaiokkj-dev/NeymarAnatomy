from pathlib import Path
p=Path('public/index.html');s=p.read_text(encoding='utf-8-sig')
s=s.replace('<title>Neymar Anatomy · Cada gol tem uma história</title>','<title>Neymar Anatomy · O jogo, parte por parte</title><meta name="description" content="Explore os gols de Neymar por parte do corpo, time e período. Um perfil interativo de futebol."><link rel="icon" type="image/svg+xml" href="anatomy-mark.svg">')
a=s.index('<header class="topbar">');b=s.index('</header>',a)+len('</header>')
s=s[:a]+'''<header class="topbar">
<a class="brand identity" href="#" aria-label="Neymar Anatomy — início"><img src="anatomy-mark.svg" width="46" height="46" alt=""><span class="identity-type"><strong>ANATOMY<span class="brand-dot">.</span></strong><span class="identity-edition">NEYMAR JR. / PLAYER PROFILE</span></span></a>
<nav aria-label="Navegação"><a href="#anatomy" class="active">Anatomia</a><a href="#goals">Gols &amp; momentos</a><a href="#about">O projeto</a></nav>
<span class="edition"><span class="edition-dot" aria-hidden="true"></span> PERFIL 01 <span class="edition-divider">/</span> BRA</span>
</header>''' +s[b:]
a=s.index('<section class="intro">');b=s.index('</section>',a)+len('</section>')
s=s[:a]+'''<section class="intro" aria-labelledby="intro-title">
<div class="intro-heading"><p class="eyebrow"><span class="intro-index">01 /</span> NEYMAR JR. <span class="eyebrow-divider">—</span> PERFIL INTERATIVO</p><h1 id="intro-title">O jogo de Neymar.<br><em>Parte por parte.</em></h1></div>
<div class="intro-side"><p class="intro-copy">Pé direito, pé esquerdo, cabeça.<br>Selecione no jogador e descubra os gols, os times e os momentos de cada fase.</p><a class="explore-link" href="#anatomy">Explorar anatomia <span aria-hidden="true">↘</span></a></div>
</section>''' +s[b:]
s=s.replace('<h2>Por trás de cada gol.</h2>','<h2>Gols &amp; momentos.</h2>').replace('MAIS QUE UM NÚMERO','O JOGO EM REGISTROS')
s=s.replace('<a class="brand" href="#">NEYMAR<span>ANATOMY</span></a>','<a class="footer-identity" href="#" aria-label="Anatomy — início"><img src="anatomy-mark.svg" width="28" height="28" alt=""><strong>ANATOMY.</strong></a>')
p.write_text(s,encoding='utf-8')
p=Path('public/style.css');s=p.read_text(encoding='utf-8-sig');s=s.replace("family=DM+Sans:wght@400;500;600;700", "family=DM+Sans:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700")
p.write_text(s,encoding='utf-8')
