const trophySources = {
  santos:
    "https://www.santosfc.com.br/santos-de-neymar-conquista-o-tri-e-entra-para-a-historia/",
  barca: "https://www.fcbarcelona.com/en/news/3925551/neymar-da-silva",
  psg: "https://en.psg.fr/teams/first-team/content/paris-saint-germain-thank-neymar-jr-a-club-legend",
  hilal:
    "https://alhilal.com/en/news/al-hilal-crowned-saudi-kings-cup-champion-and-the-history-makers-confirm-the-domestic-treble",
};
// Referência de 30 títulos adotada pelo projeto: Santos 6, Barcelona 8,
// PSG 13, Al-Hilal 1 e Brasil 2, incluindo o ouro olímpico.
// Outras contagens usam critérios diferentes para elenco e seleção de base.
const trophies = [
  {
    team: "Santos",
    name: "Copa Libertadores",
    years: ["2011"],
    source: trophySources.santos,
  },
  {
    team: "Barcelona",
    name: "UEFA Champions League",
    years: ["2014/15"],
    source: trophySources.barca,
  },
  {
    team: "Brasil",
    name: "Ouro olímpico",
    years: ["Rio 2016"],
    source:
      "https://www.cob.org.br/time-brasil/medalhistas-olimpicos/neymar-da-silva-santos-junior",
    medal: true,
  },
  {
    team: "PSG",
    name: "Ligue 1",
    years: ["2017/18", "2018/19", "2019/20", "2021/22", "2022/23"],
    source: trophySources.psg,
  },
  {
    team: "Santos",
    name: "Copa do Brasil",
    years: ["2010"],
    source: trophySources.santos,
  },
  {
    team: "Brasil",
    name: "Copa das Confederações",
    years: ["2013"],
    source:
      "https://www.uefa.com/european-qualifiers/news/020b-0e141a43d019-00a3ce81738b-1000--spain-lose-confederations-cup-final-to-brazil/",
  },
  {
    team: "Santos",
    name: "Campeonato Paulista",
    years: ["2010", "2011", "2012"],
    source: trophySources.santos,
  },
  {
    team: "Santos",
    name: "Recopa Sul-Americana",
    years: ["2012"],
    source:
      "https://www.santosfc.com.br/recopa-2012-o-craque-decidiu-novamente/",
  },
  {
    team: "Barcelona",
    name: "Copa del Rey",
    years: ["2014/15", "2015/16", "2016/17"],
    source:
      "https://www.fcbarcelona.com/en/football/first-team/news/763933/fc-barcelonas-copa-del-rey-triumph-by-the-numbers",
  },
  {
    team: "Barcelona",
    name: "Mundial de Clubes",
    years: ["2015"],
    source:
      "https://barcaacademy.fcbarcelona.com/en/news/643923/200820-the-best-years-in-our-history",
  },
  {
    team: "PSG",
    name: "Copa da França",
    years: ["2017/18", "2019/20", "2020/21"],
    source: trophySources.psg,
  },
  {
    team: "PSG",
    name: "Copa da Liga Francesa",
    years: ["2017/18", "2019/20"],
    source: trophySources.psg,
  },
  {
    team: "PSG",
    name: "Troféu dos Campeões",
    years: ["2018", "2020", "2022"],
    source: trophySources.psg,
  },
  {
    team: "Al-Hilal",
    name: "Campeonato Saudita",
    years: ["2023/24"],
    source:
      "https://www.spl.com.sa/en/news/neymar-hails-title-winning-al-hilal-teammates",
  },
  {
    team: "Barcelona",
    name: "La Liga",
    years: ["2014/15", "2015/16"],
    source: trophySources.barca,
  },
  {
    team: "Barcelona",
    name: "Supercopa da Espanha",
    years: ["2013"],
    source: trophySources.barca,
  },
];
let trophyTeam = "all",
  trophyExpanded = false;
function trophySymbol(medal) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(svg.namespaceURI, "path");
  path.setAttribute(
    "d",
    medal
      ? "M8 2l4 7 4-7M5 2l5 9m9-9-5 9M17 15a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"
      : "M7 3h10v5a5 5 0 0 1-10 0V3ZM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 1v5m-4 3h8m-7-3h6v3",
  );
  svg.append(path);
  return svg;
}
function renderTrophies() {
  const chosen = trophies.filter(
    (t) => trophyTeam === "all" || t.team === trophyTeam,
  );
  let total = el("trophy-total");
  if (!total) {
    total = textNode("div", "", "trophy-total");
    total.id = "trophy-total";
    el("trophies-context").before(total);
  }
  const count = chosen.reduce((sum, trophy) => sum + trophy.years.length, 0);
  total.replaceChildren(
    textNode("strong", String(count)),
    textNode("span", "Títulos coletivos"),
  );
  const shown = trophyExpanded ? chosen : chosen.slice(0, 6);
  el("trophies-context").textContent =
    trophyTeam === "all" ? "Todos os times" : trophyTeam;
  el("trophy-list").replaceChildren(
    ...shown.map((t) => {
      const card = textNode("article", "", "trophy-card");
      const top = textNode("div", "", "trophy-top"),
        symbol = textNode("span", "", "trophy-symbol");
      symbol.append(trophySymbol(t.medal));
      top.append(
        symbol,
        textNode("span", `×${t.years.length}`, "trophy-count"),
      );
      const team = textNode("div", "", "trophy-team");
      team.append(teamIcon(t.team), textNode("span", t.team));
      const years = textNode("div", "", "trophy-years");
      t.years.forEach((year) => years.append(textNode("span", year)));
      const source = textNode("a", "Fonte ↗", "trophy-source");
      source.href = t.source;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.setAttribute("aria-label", `Fonte: ${t.name}, ${t.team}`);
      card.append(top, team, textNode("h3", t.name), years);
      if (t.note) card.append(textNode("p", t.note, "trophy-note"));
      card.append(source);
      return card;
    }),
  );
  document
    .querySelectorAll("#trophy-filters button")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.team === trophyTeam),
      ),
    );
  el("trophies-more").hidden = chosen.length <= 6;
  el("trophies-more").textContent = trophyExpanded
    ? "Mostrar destaques ↑"
    : "Ver mais conquistas ↓";
  el("trophies-more").setAttribute("aria-expanded", String(trophyExpanded));
}
for (const team of [
  "all",
  "Santos",
  "Barcelona",
  "PSG",
  "Brasil",
  "Al-Hilal",
]) {
  const button = textNode("button", "", "club-filter");
  button.type = "button";
  button.dataset.team = team;
  button.setAttribute(
    "aria-label",
    team === "all" ? "Todos os troféus" : `Troféus: ${team}`,
  );
  button.title = team === "all" ? "Todos os times" : team;
  button.append(team === "all" ? textNode("span", "Todos") : teamIcon(team));
  button.addEventListener("click", () => {
    el("team").value = team;
    el("team").dispatchEvent(new Event("change"));
  });
  el("trophy-filters").append(button);
}
window.addEventListener("anatomy-team", (event) => {
  if (trophyTeam !== event.detail) trophyExpanded = false;
  trophyTeam = event.detail;
  renderTrophies();
});
el("trophies-more").addEventListener("click", () => {
  trophyExpanded = !trophyExpanded;
  renderTrophies();
});
renderTrophies();
