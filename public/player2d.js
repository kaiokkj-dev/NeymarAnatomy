// Cada foto tem suas próprias coordenadas; clique e destaque usam o mesmo SVG.
const photoRegions = [...document.querySelectorAll(".body-region")];
const regionNames = {
  head: "Cabeça",
  right: "Pé direito",
  left: "Pé esquerdo",
};
const initialEra = {
  image: "neymar-croacia-2022.png",
  width: 1024,
  height: 1536,
  viewport: [0, 160, 1024, 1200],
  frameWidth: 550,
  alt: "Neymar comemorando o gol contra a Croácia em 2022, recorte preparado por IA a partir de fotografia",
  title: "NEYMAR JR. · TODOS OS TIMES",
  context: "Selecione um time para explorar cada fase.",
  regions: Object.fromEntries(
    photoRegions.map((r) => [r.dataset.part, { d: r.getAttribute("d") }]),
  ),
  detailBounds: {
    head: [340, 160, 310, 270],
    right: [60, 1080, 250, 270],
    left: [390, 940, 225, 275],
  },
};
let selectedRegion = "all",
  selectedTeam = "all",
  currentEra = initialEra,
  eras = {},
  imageRequest = 0;
const detailDialog = document.getElementById("detail-dialog");
const eraTitle = document.getElementById("era-title"),
  eraContext = document.getElementById("era-context");
function updateSelection() {
  photoRegions.forEach((r) =>
    r.setAttribute("aria-pressed", String(r.dataset.part === selectedRegion)),
  );
  document.getElementById("photo-label").textContent =
    regionNames[selectedRegion] || "Cabeça e chuteiras selecionáveis";
}
function updateCaption() {
  const pending = selectedTeam !== "all" && !eras[selectedTeam];
  eraTitle.textContent = pending
    ? selectedTeam.toUpperCase() + " · IMAGEM EM PREPARAÇÃO"
    : currentEra.title;
  eraContext.textContent = pending
    ? "Exibindo a imagem principal. Vamos preparar esta fase em seguida."
    : currentEra.context;
}
function fitEra(era) {
  const frame = document.querySelector(".player-frame");
  const photo = document.querySelector(".player");
  const viewport = era.viewport || [0, 0, era.width, era.height];
  frame.style.width = `min(100%,${era.frameWidth || 400}px)`;
  frame.style.aspectRatio = `${viewport[2]}/${viewport[3]}`;
  frame.style.overflow = "hidden";
  photo.style.transform = viewport[1]
    ? `translateY(-${(viewport[1] / era.height) * 100}%)`
    : "";
  document
    .querySelector(".body-map")
    .setAttribute("viewBox", viewport.join(" "));
}
fitEra(initialEra);
async function showTeam(team) {
  selectedTeam = team;
  const era = eras[team] || initialEra;
  const request = ++imageRequest;
  const area = document.querySelector(".player-area");
  if (currentEra === era) {
    area.removeAttribute("aria-busy");
    updateCaption();
    return;
  }
  area.setAttribute("aria-busy", "true");
  try {
    const preload = new Image();
    preload.src = era.image;
    await preload.decode();
    if (request !== imageRequest) return;
    if (detailDialog.open) detailDialog.close();
    currentEra = era;
    const stage = document.querySelector(".anatomy");
    if (era.background)
      stage.style.setProperty("--moment-image", `url("${era.background}")`);
    else stage.style.removeProperty("--moment-image");
    stage.style.setProperty(
      "--moment-position",
      era.backgroundPosition || "42% 35%",
    );
    stage.style.setProperty("--moment-size", era.backgroundSize || "cover");
    stage.style.setProperty("--moment-opacity", era.backgroundOpacity || ".18");
    const photo = document.querySelector(".player");
    photo.src = era.image;
    photo.alt = era.alt;
    fitEra(era);
    photoRegions.forEach((r) =>
      r.setAttribute("d", era.regions[r.dataset.part].d),
    );
    const detailImage = document.querySelector("#detail-svg image");
    detailImage.setAttribute("href", era.image);
    detailImage.setAttribute("width", era.width);
    detailImage.setAttribute("height", era.height);
    document.querySelector(".watermark").textContent = era.number || "10";
    updateCaption();
    updateSelection();
    // Anima o conjunto foto + regiões, mantendo os contornos alinhados.
    const frame = document.querySelector(".player-frame");
    frame.getAnimations().forEach((animation) => animation.cancel());
    stage.classList.remove("era-enter");
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame.animate(
        [
          { opacity: 0, transform: "translateY(18px) scale(.975)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        { duration: 560, easing: "cubic-bezier(.22,1,.36,1)" },
      );
      void stage.offsetWidth;
      stage.classList.add("era-enter");
    }
  } catch {
    if (request === imageRequest)
      eraContext.textContent =
        "Não foi possível carregar esta foto. Selecione o time novamente para tentar.";
  } finally {
    if (request === imageRequest) area.removeAttribute("aria-busy");
  }
}
photoRegions.forEach((region) => {
  region.addEventListener("click", () =>
    window.dispatchEvent(
      new CustomEvent("anatomy-select", { detail: region.dataset.part }),
    ),
  );
  region.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      region.dispatchEvent(new MouseEvent("click"));
    }
  });
  region.addEventListener("pointerenter", () => {
    document.getElementById("photo-label").textContent =
      regionNames[region.dataset.part];
  });
  region.addEventListener("pointerleave", updateSelection);
});
window.addEventListener("anatomy-state", (event) => {
  selectedRegion = event.detail;
  updateSelection();
});
window.addEventListener("anatomy-team", (event) => {
  showTeam(event.detail);
});
document.getElementById("inspect-part").addEventListener("click", () => {
  const part = selectedRegion === "all" ? "right" : selectedRegion;
  const region = photoRegions.find((r) => r.dataset.part === part);
  if (!region) return;
  document
    .getElementById("detail-svg")
    .setAttribute("viewBox", currentEra.detailBounds[part].join(" "));
  document
    .getElementById("detail-path")
    .setAttribute("d", region.getAttribute("d"));
  document.getElementById("detail-title").textContent =
    regionNames[part] + " · contorno em detalhe";
  detailDialog.showModal();
});
document
  .getElementById("close-detail")
  .addEventListener("click", () => detailDialog.close());
detailDialog.addEventListener("click", (event) => {
  if (event.target === detailDialog) {
    const r = detailDialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      detailDialog.close();
  }
});
updateCaption();
fetch("eras.json")
  .then((response) => {
    if (!response.ok) throw new Error();
    return response.json();
  })
  .then((data) => {
    eras = data;
    showTeam(selectedTeam);
  })
  .catch(() => {
    eraContext.textContent =
      "As fotos por time não carregaram. Recarregue a página para tentar novamente.";
  });
