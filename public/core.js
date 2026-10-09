// O estado guarda a seleção atual; os números sempre vêm dos mesmos gols filtrados.
const labels = {
  right: "Pé direito",
  left: "Pé esquerdo",
  head: "Cabeça",
  other: "Outra parte",
  unknown: "Não informado",
};
const state = {
  goals: [],
  references: [],
  part: "all",
  team: "all",
  year: "all",
};
const goalListState = { page: 1, size: 12, method: "all", search: "", key: "" };
const el = (id) => document.getElementById(id);
const filtered = () =>
  state.goals.filter(
    (g) =>
      (state.team === "all" || g.team === state.team) &&
      (state.year === "all" || g.date.slice(0, 4) === state.year),
  );
function textNode(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}
function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
