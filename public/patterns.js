// Relógio dos gols (linha do tempo da partida) e confronto entre fases. Usa os gols de state.goals.
// Os textos destas duas caixas são gerados aqui nos três idiomas (containers com data-i18n-self).
(() => {
  const clockBox = document.getElementById("clock-chart");
  const compareBox = document.getElementById("compare-body");
  if (!clockBox || !compareBox) return;

  const PARTS = [
    ["right", "#c6f65b"],
    ["left", "#5dc4ef"],
    ["head", "#f1b84e"],
    ["unknown", "#4a5246"],
  ];
  const TEXT = {
    pt: {
      all: "Todos", goals: "gols", goal: "gol",
      parts: { right: "Pé direito", left: "Pé esquerdo", head: "Cabeça", unknown: "Sem classificação" },
      headline: (r, n) => `O período mais forte é ${r}, com ${n} gols.`,
      first: "1º tempo", second: "2º tempo", extra: "Depois dos 90'", interval: "Intervalo",
      hint: "Passe o mouse ou use Tab nas colunas para ver o detalhe.",
      vs: "×", swap: "Inverter os times",
      rows: { right: "Pé direito", left: "Pé esquerdo", head: "Cabeça", penalty: "Pênaltis", second: "2º tempo" },
      small: (t, n) => `Amostra pequena: ${t} tem só ${n} ${n === 1 ? "gol classificado" : "gols classificados"}.`,
      same: "Os dois perfis são parecidos: nenhuma diferença passa de 5 pontos.",
      sameTeam: "Escolha dois times diferentes.",
      insight: {
        right: (hi, a, lo, b) => `${hi} usa mais o pé direito: ${a}% contra ${b}% no ${lo}.`,
        left: (hi, a, lo, b) => `${hi} usa mais o pé esquerdo: ${a}% contra ${b}% no ${lo}.`,
        head: (hi, a, lo, b) => `${hi} tem mais gols de cabeça: ${a}% contra ${b}% no ${lo}.`,
        penalty: (hi, a, lo, b) => `${hi} tem mais gols de pênalti: ${a}% contra ${b}% no ${lo}.`,
        second: (hi, a, lo, b) => `${hi} decide mais no 2º tempo: ${a}% contra ${b}% no ${lo}.`,
      },
      note: "Pé e cabeça em % dos gols com parte do corpo identificada. Pênaltis e 2º tempo em % de todos os gols do time.",
    },
    en: {
      all: "All", goals: "goals", goal: "goal",
      parts: { right: "Right foot", left: "Left foot", head: "Head", unknown: "Unclassified" },
      headline: (r, n) => `The strongest period is ${r}, with ${n} goals.`,
      first: "1st half", second: "2nd half", extra: "After 90'", interval: "Half-time",
      hint: "Hover or tab through the columns to see the detail.",
      vs: "×", swap: "Swap teams",
      rows: { right: "Right foot", left: "Left foot", head: "Head", penalty: "Penalties", second: "2nd half" },
      small: (t, n) => `Small sample: ${t} has only ${n} classified ${n === 1 ? "goal" : "goals"}.`,
      same: "Both profiles are similar: no difference exceeds 5 points.",
      sameTeam: "Pick two different teams.",
      insight: {
        right: (hi, a, lo, b) => `${hi} uses the right foot more: ${a}% against ${b}% for ${lo}.`,
        left: (hi, a, lo, b) => `${hi} uses the left foot more: ${a}% against ${b}% for ${lo}.`,
        head: (hi, a, lo, b) => `${hi} has more headers: ${a}% against ${b}% for ${lo}.`,
        penalty: (hi, a, lo, b) => `${hi} has more penalty goals: ${a}% against ${b}% for ${lo}.`,
        second: (hi, a, lo, b) => `${hi} decides more in the 2nd half: ${a}% against ${b}% for ${lo}.`,
      },
      note: "Foot and head as % of goals with an identified body part. Penalties and 2nd half as % of all the team's goals.",
    },
    es: {
      all: "Todos", goals: "goles", goal: "gol",
      parts: { right: "Pie derecho", left: "Pie izquierdo", head: "Cabeza", unknown: "Sin clasificar" },
      headline: (r, n) => `El período más fuerte es ${r}, con ${n} goles.`,
      first: "1.er tiempo", second: "2.º tiempo", extra: "Después del 90'", interval: "Descanso",
      hint: "Pasa el ratón o usa Tab en las columnas para ver el detalle.",
      vs: "×", swap: "Invertir los equipos",
      rows: { right: "Pie derecho", left: "Pie izquierdo", head: "Cabeza", penalty: "Penales", second: "2.º tiempo" },
      small: (t, n) => `Muestra pequeña: ${t} tiene solo ${n} ${n === 1 ? "gol clasificado" : "goles clasificados"}.`,
      same: "Los dos perfiles son parecidos: ninguna diferencia supera 5 puntos.",
      sameTeam: "Elige dos equipos diferentes.",
      insight: {
        right: (hi, a, lo, b) => `${hi} usa más el pie derecho: ${a}% frente a ${b}% en ${lo}.`,
        left: (hi, a, lo, b) => `${hi} usa más el pie izquierdo: ${a}% frente a ${b}% en ${lo}.`,
        head: (hi, a, lo, b) => `${hi} tiene más goles de cabeza: ${a}% frente a ${b}% en ${lo}.`,
        penalty: (hi, a, lo, b) => `${hi} tiene más goles de penal: ${a}% frente a ${b}% en ${lo}.`,
        second: (hi, a, lo, b) => `${hi} decide más en el 2.º tiempo: ${a}% frente a ${b}% en ${lo}.`,
      },
      note: "Pie y cabeza en % de los goles con parte del cuerpo identificada. Penales y 2.º tiempo en % de todos los goles del equipo.",
    },
  };
  const lang = () => (document.documentElement.lang || "pt").slice(0, 2);
  const T = () => TEXT[lang()] || TEXT.pt;
  const local = { clockTeam: "all", a: "Barcelona", b: "PSG", hover: null };
  // Nome do time no idioma atual (ex.: Brasil → Brazil), usando a tradução global do site.
  const tn = (name) => (typeof translate === "function" ? translate(name).trim() : name);
  const norm = (v) => (v || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
  const teams = () =>
    [...new Set(state.goals.map((g) => g.team))].sort(
      (x, y) => state.goals.filter((g) => g.team === y).length - state.goals.filter((g) => g.team === x).length,
    );
  const partOf = (g) => (["right", "left", "head"].includes(g.body_part) ? g.body_part : "unknown");

  /* ---------- Relógio: linha do tempo da partida ---------- */
  function teamChips() {
    const row = textNode("div", "", "clock-teams");
    row.setAttribute("role", "group");
    for (const team of ["all", ...teams()]) {
      const b = textNode("button", "", "clock-team");
      b.type = "button";
      b.setAttribute("aria-pressed", String(local.clockTeam === team));
      if (team === "all") b.append(textNode("span", T().all));
      else {
        b.append(teamIcon(team));
        b.title = tn(team);
        b.setAttribute("aria-label", tn(team));
      }
      b.addEventListener("click", () => { local.clockTeam = team; local.hover = null; renderClock(); });
      row.append(b);
    }
    return row;
  }
  function renderClock() {
    const t = T();
    const goals = state.goals.filter((g) => local.clockTeam === "all" || g.team === local.clockTeam);
    // 18 colunas de 5 minutos e uma coluna 90'+ (acréscimos e prorrogação).
    const cols = Array.from({ length: 19 }, (_, i) => ({
      from: i === 0 ? 0 : i * 5 + 1,
      to: i === 18 ? null : i * 5 + 5,
      parts: { right: 0, left: 0, head: 0, unknown: 0 },
      n: 0,
    }));
    for (const g of goals) {
      const m = Number(g.minute);
      if (!Number.isFinite(m)) continue;
      const i = m > 90 ? 18 : Math.min(17, Math.max(0, Math.ceil(m / 5) - 1));
      cols[i].parts[partOf(g)]++;
      cols[i].n++;
    }
    const label = (c) => (c.to == null ? "90'+" : `${c.from}'–${c.to}'`);
    // O período mais forte em blocos de 15 minutos dá uma frase mais fácil de ler.
    const blocks = [0, 3, 6, 9, 12, 15].map((s) => ({
      label: `${cols[s].from}'–${cols[s + 2].to}'`,
      n: cols[s].n + cols[s + 1].n + cols[s + 2].n,
    }));
    const best = blocks.reduce((p, x) => (x.n > p.n ? x : p), blocks[0]);
    const first = cols.slice(0, 9).reduce((s, c) => s + c.n, 0);
    const second = cols.slice(9, 18).reduce((s, c) => s + c.n, 0);
    const max = Math.max(1, ...cols.map((c) => c.n));

    const chart = textNode("div", "", "timeline");
    const bars = textNode("div", "", "timeline-bars");
    cols.forEach((c, i) => {
      const col = textNode("button", "", "timeline-col" + (i === 18 ? " extra" : "") + (i === 9 ? " after-break" : ""));
      col.type = "button";
      col.setAttribute("aria-label", `${label(c)}: ${c.n} ${c.n === 1 ? t.goal : t.goals}`);
      const stack = textNode("span", "", "timeline-stack");
      stack.style.height = `${(c.n / max) * 100}%`;
      for (const [part, color] of PARTS) {
        if (!c.parts[part]) continue;
        const seg = textNode("span", "", "timeline-seg");
        seg.style.flexGrow = c.parts[part];
        seg.style.background = color;
        stack.append(seg);
      }
      col.append(stack);
      const show = () => { local.hover = i; detail(); };
      col.addEventListener("mouseenter", show);
      col.addEventListener("focus", show);
      col.addEventListener("mouseleave", () => { local.hover = null; detail(); });
      col.addEventListener("blur", () => { local.hover = null; detail(); });
      bars.append(col);
    });
    // Marcas do eixo nas fronteiras das colunas (cada 15 minutos = 3 colunas de 19).
    const breakLine = textNode("span", t.interval, "timeline-break");
    breakLine.style.left = `${(9 / 19) * 100}%`;
    const axis = textNode("div", "", "timeline-axis");
    ["0'", "15'", "30'", "45'", "60'", "75'", "90'"].forEach((m, i) => {
      const tick = textNode("span", m);
      tick.style.left = `${((i * 3) / 19) * 100}%`;
      axis.append(tick);
    });
    const plus = textNode("span", "+", "plus");
    plus.style.left = `${(18.5 / 19) * 100}%`;
    axis.append(plus);
    chart.append(bars, breakLine, axis);

    const info = textNode("div", "", "timeline-detail");
    function detail() {
      bars.querySelectorAll(".timeline-col").forEach((b, i) => b.classList.toggle("active", i === local.hover));
      const c = local.hover == null ? null : cols[local.hover];
      info.replaceChildren();
      if (!c) {
        info.append(textNode("span", t.hint, "muted"));
        return;
      }
      info.append(textNode("strong", `${label(c)} · ${c.n} ${c.n === 1 ? t.goal : t.goals}`));
      for (const [part, color] of PARTS) {
        if (!c.parts[part]) continue;
        const s = textNode("span", "", "detail-part");
        const dot = textNode("i", "");
        dot.style.background = color;
        s.append(dot, textNode("span", `${t.parts[part]} ${c.parts[part]}`));
        info.append(s);
      }
    }
    detail();

    const legend = textNode("div", "", "timeline-legend");
    for (const [part, color] of PARTS) {
      const s = textNode("span", "");
      const dot = textNode("i", "");
      dot.style.background = color;
      s.append(dot, textNode("span", t.parts[part]));
      legend.append(s);
    }
    const stats = textNode("div", "", "timeline-stats");
    for (const [value, name] of [
      [`${pct(first, goals.length)}%`, t.first],
      [`${pct(second, goals.length)}%`, t.second],
      [String(cols[18].n), t.extra],
    ]) {
      const d = textNode("div", "");
      d.append(textNode("strong", value), textNode("span", name));
      stats.append(d);
    }
    clockBox.replaceChildren(
      teamChips(),
      textNode("p", best.n ? t.headline(best.label, best.n) : "—", "patterns-headline"),
      chart,
      info,
      legend,
      stats,
    );
  }

  /* ---------- Confronto entre fases ---------- */
  function profile(team) {
    const g = state.goals.filter((x) => x.team === team);
    const c = g.filter((x) => ["right", "left", "head", "other"].includes(x.body_part));
    return {
      total: g.length,
      classified: c.length,
      right: pct(c.filter((x) => x.body_part === "right").length, c.length),
      left: pct(c.filter((x) => x.body_part === "left").length, c.length),
      head: pct(c.filter((x) => x.body_part === "head").length, c.length),
      penalty: pct(g.filter((x) => norm(x.method).includes("penalti")).length, g.length),
      second: pct(g.filter((x) => Number(x.minute) > 45).length, g.length),
    };
  }
  function side(key, team, p) {
    const t = T();
    const box = textNode("div", "", `versus-side side-${key}`);
    const crest = textNode("div", "", "versus-crest");
    crest.append(teamIcon(team));
    const select = document.createElement("select");
    select.setAttribute("aria-label", key === "a" ? "Time A" : "Time B");
    for (const name of teams()) {
      const o = textNode("option", tn(name));
      o.value = name;
      select.append(o);
    }
    select.value = team;
    select.addEventListener("change", () => { local[key] = select.value; renderCompare(); });
    box.append(crest, select, textNode("span", `${p.total} ${t.goals}`, "versus-total"));
    return box;
  }
  function renderCompare() {
    const t = T();
    const A = profile(local.a), B = profile(local.b);
    const head = textNode("div", "", "versus-head");
    const swap = textNode("button", "⇄", "versus-swap");
    swap.type = "button";
    swap.title = t.swap;
    swap.setAttribute("aria-label", t.swap);
    swap.addEventListener("click", () => { [local.a, local.b] = [local.b, local.a]; renderCompare(); });
    const mid = textNode("div", "", "versus-mid");
    mid.append(textNode("span", t.vs, "versus-x"), swap);
    head.append(side("a", local.a, A), mid, side("b", local.b, B));
    if (local.a === local.b) return compareBox.replaceChildren(head, textNode("p", t.sameTeam, "compare-note"));

    // Gráfico espelhado: barras do time A crescem para a esquerda, do time B para a direita.
    const butterfly = textNode("div", "", "butterfly");
    for (const k of ["right", "left", "head", "penalty", "second"]) {
      const row = textNode("div", "", "butterfly-row");
      const cell = (v, other, cls) => {
        const c = textNode("div", "", `bf-side ${cls}`);
        const track = textNode("span", "", "bf-track");
        const fill = textNode("span", "", "bf-fill");
        fill.style.width = `${v}%`;
        track.append(fill);
        const value = textNode("b", `${v}%`);
        if (v > other) value.classList.add("lead");
        c.append(value, track);
        return c;
      };
      row.append(cell(A[k], B[k], "bf-a"), textNode("span", t.rows[k], "bf-label"), cell(B[k], A[k], "bf-b"));
      butterfly.append(row);
    }

    const insights = textNode("ul", "", "compare-insights");
    const diffs = ["left", "head", "right", "penalty", "second"]
      .map((k) => ({ k, d: A[k] - B[k] }))
      .filter((x) => Math.abs(x.d) >= 5)
      .sort((x, y) => Math.abs(y.d) - Math.abs(x.d))
      .slice(0, 2);
    for (const { k, d } of diffs) {
      const [hi, lo, a, b, cls] = d > 0 ? [local.a, local.b, A[k], B[k], "a"] : [local.b, local.a, B[k], A[k], "b"];
      const li = textNode("li", t.insight[k](tn(hi), a, tn(lo), b), `from-${cls}`);
      insights.append(li);
    }
    if (!diffs.length) insights.append(textNode("li", t.same));
    for (const [name, p] of [[local.a, A], [local.b, B]])
      if (p.classified < 20) insights.append(textNode("li", t.small(tn(name), p.classified), "warn"));

    compareBox.replaceChildren(head, butterfly, insights, textNode("p", t.note, "compare-note"));
  }

  function renderAll() {
    if (!state.goals.length) return;
    const list = teams();
    if (!list.includes(local.a)) local.a = list[0];
    if (!list.includes(local.b) || local.b === local.a) local.b = list.find((x) => x !== local.a) || local.a;
    renderClock();
    renderCompare();
  }
  window.addEventListener("anatomy-ready", renderAll);
  if (state.goals.length) renderAll();
  // Só redesenha quando o idioma muda de fato (preferences.js regrava o atributo lang a cada mudança no DOM).
  let lastLang = lang();
  new MutationObserver(() => {
    if (lang() === lastLang) return;
    lastLang = lang();
    renderAll();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
