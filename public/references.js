function renderReferences() {
  if (!state.references.length) return;
  const refs = state.references;
  const total = refs.reduce((sum, r) => sum + r.goals, 0);
  el("overview-goals").textContent = total;
  document.querySelector(".career-total .metric-label").textContent =
    "GOLS NAS REFERÊNCIAS";
  el("base-badge").textContent = "TOTAIS COM FONTE";
  const colors = ["#c6f65b", "#5dc4ef", "#f1b84e", "#bb93ed", "#858f9e"];
  el("overview-distribution").replaceChildren();
  document.querySelector(".distribution-legend").replaceChildren();
  el("overview-distribution").setAttribute(
    "aria-label",
    "Distribuição dos totais de referência por time",
  );
  const cards = document.querySelector(".overview-mini-grid");
  cards.classList.add("reference-grid");
  cards.replaceChildren();
  refs.forEach((r, i) => {
    const segment = textNode("span", "");
    segment.style.width = `${(r.goals / total) * 100}%`;
    segment.style.background = colors[i % colors.length];
    segment.title = `${r.team}: ${r.goals}`;
    el("overview-distribution").append(segment);
    const legend = textNode("span", r.team);
    const dot = document.createElement("i");
    dot.style.background = colors[i % colors.length];
    legend.prepend(dot);
    document.querySelector(".distribution-legend").append(legend);
    const card = textNode("div", "", "overview-mini reference-mini");
    const title = textNode("span", "");
    if (teamIcons[r.team]) title.append(teamIcon(r.team));
    title.append(textNode("span", r.team));
    const goalsSource = textNode(
      "a",
      r.complete_period
        ? `${r.period} · Gols ↗`
        : `Até ${r.as_of.split("-").reverse().join("/")} · Gols ↗`,
      "reference-source",
    );
    goalsSource.href = safeUrl(r.source_url);
    goalsSource.target = "_blank";
    goalsSource.rel = "noopener noreferrer";
    card.append(title, textNode("strong", r.goals), goalsSource);
    const assists = textNode(
      r.assists == null ? "span" : "a",
      r.assists == null
        ? "Assistências · Em conferência"
        : `${r.assists} assistências ↗`,
      "assist-reference",
    );
    if (r.assists != null) {
      assists.href = safeUrl(r.assists_source_url);
      assists.target = "_blank";
      assists.rel = "noopener noreferrer";
      assists.title = r.assists_period;
    }
    card.append(assists);
    cards.append(card);
  });
  el("status").textContent =
    `Soma das referências por time, com datas diferentes. Anatomia: ${state.goals.filter((g) => g.body_part !== "unknown").length} gols com parte do corpo identificada em ${state.goals.length} registros catalogados.`;
  const selected =
    state.team === "all" ? refs : refs.filter((r) => r.team === state.team);
  const catalog = filtered(),
    classified = catalog.filter((g) => g.body_part !== "unknown").length;
  const referenceTotal = selected.reduce((sum, r) => sum + r.goals, 0);
  document.querySelector(".summary > div:first-child span").textContent =
    "GOLS CATALOGADOS";
  document.querySelector(".summary > div:last-child span").textContent =
    "JOGOS CATALOGADOS";
  const completeAnatomy =
    state.year === "all" &&
    catalog.length === referenceTotal &&
    classified === catalog.length;
  document.querySelector(".fineprint").textContent = completeAnatomy
    ? "Todos os gols desta seleção estão catalogados e classificados."
    : `${classified} de ${catalog.length} gols com parte do corpo identificada · ${catalog.length - classified} sem classificação. ${state.year === "all" ? `Total de referência: ${referenceTotal}.` : "Recorte do ano selecionado."} Contagens parciais.`;
  if (state.team === "Barcelona")
    document.querySelector(".fineprint").textContent +=
      " Duas finalizações têm divergência entre fontes e seguem em revisão.";
  if (state.part !== "all")
    el("selected-percent").textContent =
      `${el("selected-count").textContent} gols identificados neste filtro${completeAnatomy ? "" : " · classificação parcial"}`;
  let extra = document.getElementById("assist-summary");
  if (!extra) {
    extra = textNode("div", "", "assist-summary");
    extra.id = "assist-summary";
    document.querySelector(".summary").after(extra);
  }
  const complete =
    selected.length > 0 && selected.every((r) => r.assists != null);
  const assists = selected.reduce((sum, r) => sum + (r.assists || 0), 0);
  extra.replaceChildren();
  for (const [label, value] of [
    ["ASSISTÊNCIAS", complete ? assists : "—"],
    [
      "GOLS + ASSISTÊNCIAS",
      complete ? selected.reduce((sum, r) => sum + r.goals, 0) + assists : "—",
    ],
    [
      "PARTIDAS NAS REFERÊNCIAS",
      selected.length && selected.every((r) => r.matches != null)
        ? selected.reduce((sum, r) => sum + r.matches, 0)
        : "—",
    ],
  ]) {
    const metric = textNode("div", "");
    metric.append(textNode("span", label), textNode("strong", value));
    extra.append(metric);
  }
  extra.append(
    textNode(
      "small",
      complete
        ? "Soma das referências · critérios podem variar entre fontes"
        : "Total em conferência · referências incompletas",
    ),
  );
  if (!state.goals.length && state.year === "all" && selected.length) {
    const sum = selected.reduce((n, r) => n + r.goals, 0);
    el("total").textContent = sum;
    el("teams").textContent = selected.length;
    el("matches").textContent = selected.every((r) => r.matches !== null)
      ? selected.reduce((n, r) => n + r.matches, 0)
      : "—";
    document.querySelector(".summary > div:first-child span").textContent =
      "GOLS DE REFERÊNCIA";
    document.querySelector(".summary > div:last-child span").textContent =
      "JOGOS NAS FONTES";
    el("selected-count").textContent = state.part === "all" ? sum : "—";
    el("selected-percent").textContent =
      state.part === "all"
        ? "Total de referência · fonte e data na visão geral"
        : "Classificação por parte do corpo em conferência";
    el("bars")
      .querySelectorAll("b")
      .forEach((n) => (n.textContent = "—"));
    document.querySelector(".fineprint").textContent =
      "Totais de referência. Gols individuais e partes do corpo em catalogação.";
    el("result-count").textContent = "Gols individuais em catalogação";
    el("goal-list").replaceChildren(
      textNode(
        "p",
        "Os totais já estão disponíveis. Os lances individuais ainda estão sendo conferidos.",
        "empty",
      ),
    );
  }
}
