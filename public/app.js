// Coordena o carregamento e a atualização das seções.
function render() {
  syncYearFilter();
  el("teams").parentElement.hidden = state.team !== "all";
  el("selected-team").textContent =
    state.team === "all" ? "Todos os times" : state.team;
  document
    .querySelectorAll(".club-filter")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.team === state.team),
      ),
    );
  const all = state.goals;
  if (!state.references.length) {
    el("overview-goals").textContent = all.length;
    el("overview-teams").textContent = new Set(all.map((g) => g.team)).size;
    el("overview-matches").textContent = new Set(
      all.map((g) => `${g.date}|${g.team}|${g.opponent}|${g.competition}`),
    ).size;
    el("overview-left").textContent = all.filter(
      (g) => g.body_part === "left",
    ).length;
    el("overview-head").textContent = all.filter(
      (g) => g.body_part === "head",
    ).length;
  }
  el("overview-distribution").replaceChildren();
  for (const [part, color] of [
    ["right", "#c6f65b"],
    ["left", "#5dc4ef"],
    ["head", "#f1b84e"],
    ["other", "#858f9e"],
    ["unknown", "#596273"],
  ]) {
    const count = all.filter((g) => g.body_part === part).length;
    if (!count) continue;
    const segment = document.createElement("span");
    segment.style.width = `${(count / all.length) * 100}%`;
    segment.style.background = color;
    segment.title = `${labels[part]}: ${count}`;
    el("overview-distribution").append(segment);
  }
  const base = filtered();
  const selected = base.filter(
    (g) => state.part === "all" || g.body_part === state.part,
  );
  el("total").textContent = base.length;
  el("teams").textContent = new Set(base.map((g) => g.team)).size;
  el("matches").textContent = new Set(
    base.map((g) => `${g.date}|${g.team}|${g.opponent}|${g.competition}`),
  ).size;
  el("part-title").textContent =
    state.part === "all" ? "Todos os gols" : labels[state.part];
  el("selected-count").textContent = selected.length;
  el("selected-percent").textContent = base.length
    ? `${Math.round((selected.length / base.length) * 100)}% dos gols catalogados neste filtro`
    : "Nenhum gol catalogado neste filtro";
  window.dispatchEvent(
    new CustomEvent("anatomy-state", { detail: state.part }),
  );
  window.dispatchEvent(new CustomEvent("anatomy-team", { detail: state.team }));
  el("bars").replaceChildren();
  Object.entries(labels).forEach(([part, label]) => {
    if (part === "unknown") return;
    const count = base.filter((g) => g.body_part === part).length;
    if (!count && !["right", "left", "head"].includes(part)) return;
    const button = document.createElement("button");
    button.className = "bar-button";
    button.setAttribute("aria-pressed", String(state.part === part));
    button.append(textNode("span", label));
    const track = textNode("span", "", "track"),
      fill = textNode("span", "", "fill");
    fill.style.width = `${base.length ? (count / base.length) * 100 : 0}%`;
    track.append(fill);
    button.append(track, textNode("b", count));
    button.addEventListener("click", () => {
      state.part = part;
      render();
    });
    el("bars").append(button);
  });
  renderGoalList(selected);
  renderReferences();
}
window.addEventListener("anatomy-select", (event) => {
  if (["head", "right", "left"].includes(event.detail)) {
    state.part = event.detail;
    render();
  }
});
el("reset").addEventListener("click", () => {
  state.part = "all";
  render();
});
document.querySelectorAll("[data-overview-part]").forEach((button) =>
  button.addEventListener("click", () => {
    state.part = button.dataset.overviewPart;
    state.team = "all";
    state.year = "all";
    el("team").value = "all";
    el("year").value = "all";
    render();
    document
      .getElementById("anatomy")
      .scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    document.getElementById("part-title").setAttribute("tabindex", "-1");
    document.getElementById("part-title").focus({ preventScroll: true });
  }),
);
["team", "year"].forEach((id) =>
  el(id).addEventListener("change", (event) => {
    state[id] = event.target.value;
    render();
  }),
);
for (const [target, source] of [
  ["goals-team", "team"],
  ["goals-year", "year"],
])
  el(target).addEventListener("change", (event) => {
    state[source] = event.target.value;
    el(source).value = state[source];
    render();
  });
el("goals-method").addEventListener("change", (event) => {
  goalListState.method = event.target.value;
  render();
});
el("goals-search").addEventListener("input", (event) => {
  goalListState.search = event.target.value;
  render();
});
for (const [id, step] of [
  ["goals-prev", -1],
  ["goals-next", 1],
])
  el(id).addEventListener("click", () => {
    goalListState.page += step;
    render();
    el("goals").scrollIntoView({ behavior: "instant", block: "start" });
  });
async function load() {
  try {
    const response = await fetch("/api/goals");
    if (!response.ok) throw new Error();
    const data = await response.json();
    state.goals = data.goals;
    if (data.mode === "database") {
      const referenceResponse = await fetch("/api/career-reference");
      if (!referenceResponse.ok) throw new Error();
      const referenceData = await referenceResponse.json();
      const latest = new Map();
      for (const r of referenceData.records) {
        if (!latest.has(r.team) || r.as_of > latest.get(r.team).as_of)
          latest.set(r.team, r);
      }
      state.references = [...latest.values()].sort((a, b) => b.goals - a.goals);
    }
    el("base-badge").textContent =
      data.mode === "demo" ? "BASE DEMONSTRATIVA" : "REGISTROS CADASTRADOS";
    for (const [id, values] of [
      [
        "team",
        [
          ...new Set([
            ...state.goals.map((g) => g.team),
            ...state.references.map((r) => r.team),
          ]),
        ].sort(),
      ],
      [
        "year",
        [...new Set(state.goals.map((g) => g.date.slice(0, 4)))]
          .sort()
          .reverse(),
      ],
    ]) {
      values.forEach((value) => {
        const option = textNode("option", value);
        option.value = value;
        el(id).append(option);
      });
    }
    el("status").textContent =
      data.mode === "demo"
        ? "DEMONSTRAÇÃO · Amostra de 8 registros ilustrativos. Não são os totais da carreira; classificações ainda não verificadas."
        : "BASE CONECTADA · Gols catalogados; a base ainda não representa toda a carreira.";
    buildClubFilters();
    render();
    window.dispatchEvent(new Event("anatomy-ready"));
  } catch {
    el("base-badge").textContent = "BASE INDISPONÍVEL";
    el("status").replaceChildren(
      textNode("span", "Não foi possível carregar os dados. "),
    );
    const retry = textNode("button", "Tentar novamente");
    retry.addEventListener("click", load);
    el("status").append(retry);
  }
}
load();
