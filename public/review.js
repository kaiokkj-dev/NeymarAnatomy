// "Ajude a classificar": mostra um gol sem parte do corpo identificada e registra o voto do visitante.
// Só busca dados quando a seção se aproxima da tela.
(() => {
  const section = document.getElementById("review");
  if (!section) return;
  const panel = document.getElementById("review-panel");
  const parts = [
    ["right", "Pé direito"],
    ["left", "Pé esquerdo"],
    ["head", "Cabeça"],
  ];
  const skipped = [];
  let loading = false;

  function stat(id, value) {
    document.getElementById(id).textContent = value ?? "—";
  }
  function showStats(stats) {
    if (!stats) return;
    stat("review-pending", stats.pending);
    stat("review-consensus", stats.consensus);
    stat("review-votes", stats.votes);
  }
  function message(text, retry) {
    const box = textNode("div", "", "review-message");
    box.append(textNode("p", text));
    if (retry) {
      const button = textNode("button", "Tentar novamente", "review-next");
      button.type = "button";
      button.addEventListener("click", load);
      box.append(button);
    }
    panel.replaceChildren(box);
  }
  function link(text, href) {
    const a = textNode("a", text, "video-link");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  }

  async function load() {
    if (loading) return;
    loading = true;
    panel.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(`/api/review/next?skip=${skipped.join(",")}`);
      const data = await response.json();
      if (!response.ok) return message(data.error || "Não foi possível carregar um gol.", true);
      showStats(data.stats);
      if (!data.goal)
        return message(
          data.stats?.pending
            ? "Você já votou em todos os gols pendentes. Obrigado pela ajuda!"
            : "Nenhum gol pendente nesta base.",
        );
      renderGoal(data.goal);
    } catch {
      message("Sem conexão com o servidor.", true);
    } finally {
      loading = false;
      panel.removeAttribute("aria-busy");
    }
  }

  function renderGoal(goal) {
    const card = textNode("article", "", "review-card");
    const meta = textNode("div", "", "goal-meta");
    meta.append(
      teamIcon(goal.team),
      textNode("span", new Date(`${goal.date}T12:00:00`).toLocaleDateString("pt-BR")),
    );
    const info = textNode("div", "", "review-info");
    info.append(
      meta,
      textNode("h3", goal.title),
      textNode("p", `${goal.team} × ${goal.opponent} · ${goal.minute ?? "—"}′`),
      textNode("p", goal.competition),
    );
    if (goal.method && goal.method !== "Não informado") {
      const tags = textNode("div", "", "tags");
      tags.append(textNode("span", goal.method, "tag"));
      info.append(tags);
    }
    const links = textNode("div", "", "review-links");
    links.append(
      link(
        safeUrl(goal.highlight_url) ? "Assistir ao lance ↗" : "Buscar o lance no YouTube ↗",
        safeUrl(goal.highlight_url) ||
          `https://www.youtube.com/results?search_query=${encodeURIComponent(`Neymar ${goal.team} ${goal.opponent} ${goal.date} gol`)}`,
      ),
    );
    if (safeUrl(goal.source_url)) links.append(link("Fonte do registro ↗", safeUrl(goal.source_url)));
    info.append(links);

    const ask = textNode("div", "", "review-ask");
    const question = textNode("p", "Com que parte do corpo foi o gol?", "review-question");
    question.id = "review-question";
    const options = textNode("div", "", "review-options");
    options.setAttribute("role", "group");
    options.setAttribute("aria-labelledby", "review-question");
    for (const [part, label] of parts) {
      const button = textNode("button", "", "review-option");
      button.type = "button";
      button.dataset.part = part;
      button.append(textNode("span", "", "review-dot"), textNode("span", label));
      button.addEventListener("click", () => vote(goal, part, options));
      options.append(button);
    }
    const skip = textNode("button", "Não sei, pular este gol", "review-skip");
    skip.type = "button";
    skip.addEventListener("click", () => {
      skipped.push(goal.id);
      load();
    });
    ask.append(question, options, skip);
    card.append(info, ask);
    panel.replaceChildren(card);
  }

  async function vote(goal, part, options) {
    options.querySelectorAll("button").forEach((b) => (b.disabled = true));
    try {
      const response = await fetch(`/api/review/${goal.id}/vote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body_part: part }),
      });
      const data = await response.json();
      if (response.status === 201 || data.code === "duplicate") {
        showStats(data.stats);
        return renderResult(part, data.result, options.closest(".review-ask"));
      }
      if (data.code === "classified") return load();
      options.querySelectorAll("button").forEach((b) => (b.disabled = false));
      options.after(textNode("p", data.error || "Não foi possível registrar o voto.", "review-error"));
    } catch {
      options.querySelectorAll("button").forEach((b) => (b.disabled = false));
      options.after(textNode("p", "Sem conexão com o servidor.", "review-error"));
    }
  }

  function renderResult(mine, result, ask) {
    const box = textNode("div", "", "review-result");
    box.setAttribute("role", "status");
    box.append(textNode("p", "Voto registrado. Veja o que a comunidade respondeu:", "review-question"));
    for (const [part, label] of parts) {
      const count = result.votes[part];
      const row = textNode("div", "", "review-bar");
      row.dataset.part = part;
      const name = textNode("span", label);
      if (part === mine) name.append(textNode("small", "seu voto", "review-mine"));
      const track = textNode("span", "", "track");
      const fill = textNode("span", "", "fill");
      fill.style.width = `${result.total ? (count / result.total) * 100 : 0}%`;
      track.append(fill);
      row.append(name, track, textNode("b", count));
      box.append(row);
    }
    const status = textNode("p", "", "review-status");
    if (result.status === "consensus") {
      status.classList.add("done");
      status.append(
        textNode("span", "Consenso da comunidade: "),
        textNode("strong", parts.find(([p]) => p === result.leader)[1]),
      );
    } else {
      status.append(
        textNode("span", "Ainda sem consenso. Votos que faltam, no mínimo: "),
        textNode("strong", String(result.missing)),
      );
    }
    const next = textNode("button", "Próximo gol →", "review-next");
    next.type = "button";
    next.addEventListener("click", load);
    box.append(status, next);
    ask.replaceWith(box);
    next.focus({ preventScroll: true });
  }

  new IntersectionObserver(
    (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      load();
    },
    { rootMargin: "400px" },
  ).observe(section);
})();
