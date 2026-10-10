// Curadoria independente dos totais: coordenadas esquemáticas, sem tracking.
(() => {
  const mapState = { goals: [], team: "all", method: "all", selected: null };
  const methods = { open: "Bola rolando", free: "Falta", penalty: "Pênalti" };

  function chooseMoment(id) {
    mapState.selected = id;
    renderShotMap();
    animateShot(mapState.goals.find((goal) => goal.id === id));
  }

  // Trajetória ilustrativa: não representa tracking do chute real.
  function animateShot(goal) {
    if (!goal || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pitch = document.querySelector(".shot-map-pitch");
    const point = pitch.querySelector('.shot-map-point[aria-pressed="true"]');
    if (!point) return;
    const bounds = pitch.getBoundingClientRect();
    const headerHeight = document
      .querySelector(".site-header")
      .getBoundingClientRect().height;
    const needsScroll =
      bounds.top < headerHeight || bounds.bottom > innerHeight;
    if (needsScroll)
      pitch.scrollIntoView({ behavior: "smooth", block: "center" });
    const startX = parseFloat(point.style.left);
    const startY = parseFloat(point.style.top);
    const endX = 50,
      endY = 4;
    const curveX = (startX + endX) / 2 + (goal.method === "free" ? 14 : 0);
    const curveY = (startY + endY) / 2;
    const ball = textNode("span", "⚽", "shot-map-ball");
    ball.style.left = `${startX}%`;
    ball.style.top = `${startY}%`;
    ball.style.transform = 'translate(-50%, -50%)';
    ball.setAttribute("aria-hidden", "true");
    pitch.append(ball);
    const frames = Array.from({ length: 41 }, (_, index) => {
      const t = index / 40,
        u = 1 - t;
      return {
        left: `${u * u * startX + 2 * u * t * curveX + t * t * endX}%`,
        top: `${u * u * startY + 2 * u * t * curveY + t * t * endY}%`,
        transform: `translate(-50%, -50%) rotate(${t * 540}deg) scale(${1 - t * 0.2})`,
        opacity: t > 0.95 ? (1 - t) / 0.05 : 1,
      };
    });
    const animation = ball.animate(frames, {
      duration: goal.method === "free" ? 1150 : 900,
      delay: needsScroll ? 450 : 0,
      easing: "cubic-bezier(.2,.65,.4,1)",
      fill: "forwards",
    });
    animation.onfinish = () => ball.remove();
  }

  function renderShotDetail(goal) {
    const detail = el("shot-map-detail");
    detail.replaceChildren();
    if (!goal) {
      detail.append(
        textNode("h3", "Nenhum lance nesta seleção"),
        textNode("p", "Experimente outro time ou tipo de jogada."),
      );
      return;
    }
    const meta = textNode("div", "", "shot-map-meta");
    meta.append(
      teamIcon(goal.team),
      textNode("span", `${goal.team} × ${goal.opponent}`),
    );
    const tags = textNode("div", "", "tags");
    tags.append(
      textNode("span", labels[goal.body_part], "tag"),
      textNode("span", methods[goal.method], "tag"),
    );
    const facts = textNode(
      "p",
      `${new Date(`${goal.date}T12:00:00`).toLocaleDateString("pt-BR")} · ${goal.minute}′`,
      "shot-map-facts",
    );
    const links = textNode("div", "", "shot-map-links");
    const watch = textNode("a", "Buscar vídeo do lance ↗", "shot-map-watch");
    watch.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(`Neymar ${goal.team} ${goal.opponent} ${goal.date} ${goal.title} gol`)}`;
    const source = textNode("a", "Fonte do lance ↗", "video-link");
    source.href = safeUrl(goal.source_url);
    for (const link of [watch, source]) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    links.append(watch, source);
    detail.append(
      meta,
      textNode("p", goal.competition, "eyebrow"),
      textNode("h3", goal.title),
      facts,
      tags,
      textNode("p", goal.context, "shot-map-context"),
      textNode(
        "p",
        "Posição aproximada · sem coordenadas de rastreamento",
        "shot-map-accuracy",
      ),
      links,
    );
  }

  function renderShotMap() {
    const visible = mapState.goals.filter(
      (goal) =>
        (mapState.team === "all" || goal.team === mapState.team) &&
        (mapState.method === "all" || goal.method === mapState.method),
    );
    if (!visible.some((goal) => goal.id === mapState.selected))
      mapState.selected = visible[0]?.id ?? null;
    el("shot-map-count").textContent =
      `${visible.length} de ${mapState.goals.length} lances`;
    el("shot-map-team").value = mapState.team;
    el("shot-map-methods")
      .querySelectorAll("button")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.method === mapState.method),
        ),
      );
    const points = el("shot-map-points"),
      moments = el("shot-map-moments");
    document.querySelectorAll(".shot-map-ball").forEach((ball) => {
      ball.getAnimations().forEach((animation) => animation.cancel());
      ball.remove();
    });
    points.replaceChildren();
    moments.replaceChildren();
    // Desloca somente a representação quando dois alvos ficam muito próximos.
    // A posição original permanece no catálogo; todos os lances têm botão na lista.
    const placed = visible
      .filter((goal) => goal.method === "penalty")
      .map((goal) => ({ x: goal.x, y: goal.y }));
    visible.forEach((goal) => {
      const number = mapState.goals.indexOf(goal) + 1;
      const point = textNode("button", number, "shot-map-point");
      point.type = "button";
      point.dataset.method = goal.method;
      point.setAttribute(
        "aria-label",
        `${goal.title}, ${goal.team} contra ${goal.opponent}, ${goal.date}`,
      );
      point.setAttribute("aria-pressed", String(goal.id === mapState.selected));
      point.title = `${goal.title} · ${goal.opponent}`;
      let x = goal.x;
      while (
        goal.method !== "penalty" &&
        placed.some((p) => Math.abs(p.x - x) < 7 && Math.abs(p.y - goal.y) < 6)
      )
        x += 7;
      placed.push({ x, y: goal.y });
      point.style.left = `${x}%`;
      point.style.top = `${(goal.y / 80) * 100}%`;
      point.addEventListener("click", () => chooseMoment(goal.id));
      points.append(point);
      const button = textNode("button", "", "shot-map-moment");
      button.type = "button";
      button.setAttribute(
        "aria-pressed",
        String(goal.id === mapState.selected),
      );
      button.append(
        textNode("span", String(number).padStart(2, "0"), "shot-map-number"),
        textNode("span", `${goal.title} · ${goal.opponent}`),
      );
      button.addEventListener("click", () => chooseMoment(goal.id));
      moments.append(button);
    });
    renderShotDetail(visible.find((goal) => goal.id === mapState.selected));
  }

  el("shot-map-team").addEventListener("change", (event) => {
    mapState.team = event.target.value;
    renderShotMap();
  });
  el("shot-map-methods")
    .querySelectorAll("button")
    .forEach((button) =>
      button.addEventListener("click", () => {
        mapState.method = button.dataset.method;
        renderShotMap();
      }),
    );

  async function loadShotMap() {
    try {
      const response = await fetch("data/iconic-goals.json");
      if (!response.ok) throw new Error("Mapa indisponível");
      mapState.goals = await response.json();
      el("shot-map-team").replaceChildren(textNode("option", "Todos os times"));
      el("shot-map-team").firstElementChild.value = "all";
      for (const team of [
        ...new Set(mapState.goals.map((goal) => goal.team)),
      ]) {
        const option = textNode("option", team);
        option.value = team;
        el("shot-map-team").append(option);
      }
      renderShotMap();
    } catch {
      el("shot-map-count").textContent = "Mapa indisponível";
      const retry = textNode("button", "Tentar carregar o mapa");
      retry.type = "button";
      retry.addEventListener("click", loadShotMap);
      el("shot-map-detail").replaceChildren(retry);
    }
  }
  loadShotMap();
})();
