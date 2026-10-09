from pathlib import Path
p=Path('public/index.html');s=p.read_text(encoding='utf-8')
a=s.index('<header class="topbar">');b=s.index('</header>',a)+9
s=s[:a]+'''<header class="site-header"><div class="topbar">
<a class="profile-brand" href="#overview" aria-label="Neymar Anatomy — início"><span class="profile-avatar" aria-hidden="true"><img class="avatar-mark" src="anatomy-mark.svg" alt=""></span><span class="profile-brand-text"><strong>Neymar<span>Anatomy</span></strong><span class="profile-subtitle">Anatomia dos gols · perfil 01</span></span></a>
<nav aria-label="Navegação principal"><a href="#overview" class="active" aria-current="location">Visão geral</a><a href="#anatomy">Anatomia</a><a href="#goals">Gols &amp; momentos</a><a href="#about">O projeto</a></nav>
<div class="header-tools"><span class="prototype-badge"><span aria-hidden="true"></span> Protótipo</span><a class="base-link" href="#about">Sobre a base <span aria-hidden="true">↗</span></a></div>
</div></header>''' +s[b:]
s=s.replace('<section class="intro" aria-labelledby="intro-title">','<section id="overview" class="intro" aria-labelledby="intro-title">')
s=s.replace('<script src="player2d.js" defer></script>','<script src="player2d.js" defer></script><script src="navigation.js" defer></script>')
p.write_text(s,encoding='utf-8')
