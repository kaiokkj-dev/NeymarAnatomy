// A abertura anima uma vez, depois que os totais reais foram renderizados.
window.addEventListener(
  "anatomy-ready",
  () => {
    const nodes = [
      ...document.querySelectorAll("#overview-goals,.overview-mini strong"),
    ];
    const totals = nodes.map((node) => Number(node.textContent));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now(),
      duration = 1500;
    nodes.forEach((node, index) => {
      if (Number.isFinite(totals[index])) node.textContent = "0";
    });
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      nodes.forEach((node, index) => {
        if (node.isConnected && Number.isFinite(totals[index]))
          node.textContent = String(Math.round(totals[index] * eased));
      });
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  },
  { once: true },
);
