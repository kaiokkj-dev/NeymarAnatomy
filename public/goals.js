// Filtros locais, paginação e cartões dos gols.
function renderGoalList(selected) {
  for (const [target, source] of [
    ["goals-team", "team"],
    ["goals-year", "year"],
  ]) {
    el(target).replaceChildren(
      ...[...el(source).options].map((option) => option.cloneNode(true)),
    );
    el(target).value = state[source];
  }
  const normalize = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const results = selected
    .filter((g) => {
      const method = normalize(g.method || "");
      const matchesMethod =
        goalListState.method === "all" ||
        (goalListState.method === "penalty" && method.includes("penalti")) ||
        (goalListState.method === "free" && method.includes("falta")) ||
        (goalListState.method === "open" &&
          method &&
          !method.includes("penalti") &&
          !method.includes("falta") &&
          method !== "nao informado");
      return (
        matchesMethod &&
        normalize(g.opponent).includes(normalize(goalListState.search.trim()))
      );
    })
    .toSorted((a, b) => b.date.localeCompare(a.date));
  const key = JSON.stringify([
    state.team,
    state.year,
    state.part,
    goalListState.method,
    goalListState.search,
  ]);
  if (key !== goalListState.key) {
    goalListState.page = 1;
    goalListState.key = key;
  }
  const pages = Math.max(1, Math.ceil(results.length / goalListState.size));
  goalListState.page = Math.min(goalListState.page, pages);
  const start = (goalListState.page - 1) * goalListState.size;
  el("result-count").textContent = results.length
    ? `${start + 1}–${Math.min(start + goalListState.size, results.length)} de ${results.length} gols`
    : "Nenhum gol encontrado";
  el("goals-page").textContent = `Página ${goalListState.page} de ${pages}`;
  el("goals-prev").disabled = goalListState.page === 1;
  el("goals-next").disabled = goalListState.page === pages;
  el("goal-pagination").hidden = results.length <= goalListState.size;
  el("goal-list").replaceChildren();
  if (!results.length)
    el("goal-list").append(
      textNode(
        "p",
        "Nenhum gol encontrado. Experimente outro filtro.",
        "empty",
      ),
    );
  results.slice(start, start + goalListState.size).forEach((g) => {
    const card = textNode("article", "", "goal-card");
    const meta = textNode("div", "", "goal-meta");
    meta.append(
      teamIcon(g.team),
      textNode(
        "span",
        new Date(`${g.date}T12:00:00`).toLocaleDateString("pt-BR"),
      ),
    );
    card.append(
      meta,
      textNode("h3", g.title),
      textNode("p", `${g.team} × ${g.opponent} · ${g.minute ?? "—"}′`),
      textNode("p", g.competition),
    );
    const tags = textNode("div", "", "tags");
    if (g.body_part !== "unknown" && labels[g.body_part])
      tags.append(textNode("span", labels[g.body_part], "tag"));
    if (g.method && g.method !== "Não informado")
      tags.append(textNode("span", g.method, "tag"));
    if (tags.childElementCount) card.append(tags);
    const url = safeUrl(g.highlight_url);
    const link = textNode(
      "a",
      url ? "Assistir ao highlight ↗" : "Buscar highlight no YouTube ↗",
      "video-link",
    );
    link.href =
      url ||
      `https://www.youtube.com/results?search_query=${encodeURIComponent(`Neymar ${g.team} ${g.opponent} ${g.date} gol`)}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    card.append(link);
    const source = safeUrl(g.source_url);
    if (source) {
      const a = textNode("a", "Fonte do registro ↗", "video-link");
      a.href = source;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      card.append(a);
    }
    el("goal-list").append(card);
  });
}
