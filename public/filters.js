function syncYearFilter() {
  const years = [
    ...new Set(
      state.goals
        .filter((g) => state.team === "all" || g.team === state.team)
        .map((g) => g.date.slice(0, 4)),
    ),
  ]
    .sort()
    .reverse();
  if (state.year !== "all" && !years.includes(state.year)) state.year = "all";
  const select = el("year");
  const values = ["all", ...years];
  if (
    [...select.options].map((option) => option.value).join("|") !==
    values.join("|")
  ) {
    const all = textNode("option", "Todos os anos");
    all.value = "all";
    select.replaceChildren(
      all,
      ...years.map((year) => {
        const option = textNode("option", year);
        option.value = year;
        return option;
      }),
    );
  }
  select.value = state.year;
}
const teamIcons = {
  Santos: "club-santos-coroa.png",
  Barcelona: "club-barcelona.png",
  PSG: "club-psg.png",
  Brasil: "club-brasil.png",
  "Al-Hilal": "club-al-hilal.svg",
};
function teamIcon(team) {
  if (!teamIcons[team]) return textNode("span", team);
  const img = document.createElement("img");
  img.src = teamIcons[team];
  img.alt = team;
  img.title = team;
  img.width = 32;
  img.height = 32;
  return img;
}
function buildClubFilters() {
  el("club-filters").replaceChildren();
  for (const team of [
    "all",
    ...new Set([
      ...state.goals.map((g) => g.team),
      ...state.references.map((r) => r.team),
    ]),
  ]) {
    const button = textNode("button", "", "club-filter");
    button.type = "button";
    button.dataset.team = team;
    button.setAttribute(
      "aria-label",
      team === "all" ? "Todos os times" : `Filtrar ${team}`,
    );
    button.title = team === "all" ? "Todos os times" : team;
    button.append(team === "all" ? textNode("span", "Todos") : teamIcon(team));
    button.addEventListener("click", () => {
      state.team = team;
      el("team").value = team;
      render();
    });
    el("club-filters").append(button);
  }
}
