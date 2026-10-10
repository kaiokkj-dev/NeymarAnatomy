// Perguntas editoriais sobre fatos conferidos; pontuação apenas nesta sessão.
(() => {
  const questions = [
    {
      question: "Qual gol rendeu a Neymar o prêmio Puskás de 2011?",
      options: [
        "Contra o Flamengo, pelo Santos",
        "Contra o PSG, pelo Barcelona",
        "Contra a Croácia, pelo Brasil",
      ],
      correct: 0,
      explanation:
        "O lance contra o Flamengo, em julho de 2011, rendeu o prêmio Puskás.",
      source:
        "https://inside.fifa.com/news/a-decade-of-the-very-best-puskas-goals",
    },
    {
      question:
        "Com qual parte do corpo Neymar marcou na final contra a Espanha em 2013?",
      options: ["Cabeça", "Pé direito", "Pé esquerdo"],
      correct: 2,
      explanation:
        "Neymar finalizou de esquerda na vitória do Brasil na final da Copa das Confederações.",
      source:
        "https://www.transfermarkt.co.uk/neymar/alletore/spieler/68290/plus/",
    },
    {
      question:
        "Por qual clube ele fez o gol do chapéu contra o Villarreal em 2015?",
      options: ["PSG", "Barcelona", "Santos"],
      correct: 1,
      explanation:
        "O chapéu e a finalização aconteceram pelo Barcelona, em novembro de 2015.",
      source:
        "https://www.fcbarcelona.com/en/videos/771009/what-a-goal-from-neymar-against-villarreal",
    },
    {
      question: "Como Neymar abriu o placar da final olímpica de 2016?",
      options: [
        "Pênalti durante o jogo",
        "Cabeçada após escanteio",
        "Cobrança de falta",
      ],
      correct: 2,
      explanation:
        "Ele marcou de falta durante o jogo. O pênalti decisivo veio depois, na disputa de desempate.",
      source:
        "https://www.uefa.com/uefachampionsleague/news/0230-0e94bd68d3b7-aa46e5284e07-1000--neymar-and-brazil-strike-olympic-gold-on-penalties/",
    },
    {
      question: "Qual clube conquistou a Libertadores de 2011 com Neymar?",
      options: ["Santos", "Barcelona", "Al-Hilal"],
      correct: 0,
      explanation:
        "O Santos venceu o Peñarol na final e conquistou seu terceiro título da Libertadores.",
      source:
        "https://www.santosfc.com.br/memoria-santos-fc-conquistava-o-tricampeonato-da-libertadores-da-america-2/",
    },
  ];
  let index = 0,
    score = 0,
    answered = false;
  const panel = document.getElementById("quiz-panel");

  function renderQuiz(moveFocus = false) {
    panel.replaceChildren();
    if (index === questions.length) {
      const result = textNode(
        "h3",
        `${score} de ${questions.length} acertos`,
        "quiz-question",
      );
      result.tabIndex = -1;
      const restart = textNode("button", "Jogar novamente ↗", "quiz-action");
      restart.type = "button";
      restart.addEventListener("click", () => {
        index = 0;
        score = 0;
        answered = false;
        renderQuiz(true);
      });
      panel.append(
        textNode("p", "DESAFIO CONCLUÍDO", "eyebrow"),
        result,
        textNode(
          "p",
          score === questions.length
            ? "Você conhece os lances! Que tal revisitar seus favoritos no mapa?"
            : "Agora você conhece mais histórias por trás dos gols. Explore os lances e tente outra vez.",
          "quiz-description",
        ),
        restart,
      );
      document.getElementById("quiz-progress").textContent = "Resultado final";
      if (moveFocus) result.focus({ preventScroll: true });
      return;
    }
    const current = questions[index];
    document.getElementById("quiz-progress").textContent =
      `Pergunta ${index + 1} de ${questions.length}`;
    const title = textNode("h3", current.question, "quiz-question");
    title.tabIndex = -1;
    const options = textNode("div", "", "quiz-options");
    options.setAttribute("role", "group");
    options.setAttribute("aria-label", "Escolha uma resposta");
    const feedback = textNode("div", "", "quiz-feedback");
    feedback.setAttribute("role", "status");
    current.options.forEach((label, optionIndex) => {
      const button = textNode("button", "", "quiz-option");
      button.type = "button";
      button.append(
        textNode("span", String.fromCharCode(65 + optionIndex), "quiz-letter"),
        textNode("span", label),
      );
      button.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const correct = optionIndex === current.correct;
        if (correct) score++;
        [...options.children].forEach((choice, i) => {
          choice.disabled = true;
          if (i === current.correct) choice.classList.add("quiz-correct");
        });
        if (!correct) button.classList.add("quiz-wrong");
        const source = textNode("a", "Conferir fonte ↗");
        source.href = safeUrl(current.source);
        source.target = "_blank";
        source.rel = "noopener noreferrer";
        const next = textNode(
          "button",
          index === questions.length - 1
            ? "Ver resultado →"
            : "Próxima pergunta →",
          "quiz-action",
        );
        next.type = "button";
        next.addEventListener("click", () => {
          index++;
          answered = false;
          renderQuiz(true);
        });
        feedback.append(
          textNode(
            "strong",
            correct
              ? "Acertou!"
              : `Resposta certa: ${current.options[current.correct]}`,
          ),
          textNode("p", current.explanation),
          source,
          next,
        );
      });
      options.append(button);
    });
    panel.append(title, options, feedback);
    if (moveFocus) title.focus({ preventScroll: true });
  }
  renderQuiz();
})();
