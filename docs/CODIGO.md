# Guia do código

## Estrutura

O site tem uma única página: `public/index.html`. Os HTML em `work/` são cópias de fontes consultadas na pesquisa dos gols; não são páginas do site e não são servidos pelo Express.

| Arquivo                 | Responsabilidade                                                            |
| ----------------------- | --------------------------------------------------------------------------- |
| `server.js`             | Servir os arquivos públicos e as duas rotas de dados.                       |
| `public/index.html`     | Estrutura das seções, controles e contornos SVG clicáveis.                  |
| `public/core.js`        | Estado compartilhado, nomes das partes do corpo e auxiliares de DOM.        |
| `public/filters.js`     | Escudos e anos disponíveis por time.                                        |
| `public/references.js`  | Totais de referência, fontes, assistências e observações da classificação.  |
| `public/goals.js`       | Busca, tipo de finalização, cartões e paginação de 12 gols.                 |
| `public/app.js`         | Carregar os dados, conectar os controles e coordenar a atualização da tela. |
| `public/player2d.js`    | Fotos por time, transição, contornos e diálogo de ampliação.                |
| `public/trophies.js`    | Catálogo de títulos e cartões filtrados por time.                           |
| `public/counters.js`    | Animação dos números na primeira carga.                                     |
| `public/navigation.js`  | Destacar a seção atual na navegação.                                        |
| `public/preferences.js` | Idioma, tradução e tema persistido no navegador.                            |
| `public/style.css`      | Aparência base e ajustes acumulados, na ordem original da cascata.          |
| `public/responsive.css` | Ajustes finais de telas pequenas, cartões e modo claro.                     |
| `database/`             | Dados catalogados, verificações, esquema SQL e documentação das fontes.     |
| `work/`                 | Scripts de importação, pesquisa e evidências salvas.                        |
| `public/vendor/`        | Bibliotecas externas.                                                       |

`player3d.js` é uma implementação alternativa; a página atual carrega `player2d.js`.

## Fluxo da aplicação

1. O navegador carrega o HTML e executa os scripts com `defer`, na ordem indicada no cabeçalho.
2. `load()` consulta `/api/goals` e, no modo de banco, `/api/career-reference`.
3. Os dados ficam em `state`; os filtros locais de busca e paginação ficam em `goalListState`.
4. `render()` atualiza os números e barras, chama `renderGoalList()` e `renderReferences()` e comunica time e parte selecionados às outras seções.
5. Os controles alteram o estado e chamam `render()` novamente.

Os scripts são clássicos e compartilham os auxiliares de `core.js`. A ordem dos scripts importa: core → filters/references/goals → app. Não acrescente `type="module"` isoladamente, pois isso mudaria o escopo dessas dependências.

## Funções principais

| Função                           | O que faz                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| `el(id)`                         | Encontra um elemento pelo seu ID.                                                       |
| `textNode(tag, text, className)` | Cria um elemento com texto usando `textContent`.                                        |
| `safeUrl(value)`                 | Aceita somente URLs HTTPS válidas para links de fontes e vídeos.                        |
| `filtered()`                     | Seleciona os gols do time e ano atuais.                                                 |
| `syncYearFilter()`               | Atualiza os anos do time; volta para Todos se o ano selecionado deixar de existir.      |
| `teamIcon(team)`                 | Cria a imagem do escudo correspondente.                                                 |
| `buildClubFilters()`             | Monta os botões de escudos e conecta seus cliques.                                      |
| `renderReferences()`             | Apresenta os totais com fonte e diferencia referência de gols efetivamente catalogados. |
| `renderGoalList(selected)`       | Aplica busca e finalização, ordena os gols, calcula a página e monta os cartões.        |
| `render()`                       | Coordena a atualização das seções com a seleção atual.                                  |
| `load()`                         | Busca os dados, prepara filtros e trata falhas com botão para tentar novamente.         |
| `showTeam(team)`                 | Escolhe a foto e executa a troca visual do time.                                        |
| `fitEra(era)`                    | Ajusta foto e áreas clicáveis para a imagem da fase escolhida.                          |
| `updateSelection()`              | Atualiza o destaque da parte do corpo na foto.                                          |
| `updateCaption()`                | Atualiza a legenda da foto.                                                             |
| `trophySymbol(medal)`            | Cria o ícone SVG de taça ou medalha.                                                    |
| `renderTrophies()`               | Soma os títulos da seleção e monta os cartões e o botão de expansão.                    |
| `updateNavigation()`             | Atualiza o link ativo conforme a seção visível.                                         |
| `translate(value)`               | Busca a tradução do texto para o idioma escolhido.                                      |
| `applyLanguage()`                | Aplica traduções aos textos e atributos da página.                                      |
| `applyTheme(theme)`              | Aplica o tema e troca o ícone e o rótulo do botão.                                      |

## Eventos entre as seções

- `anatomy-select`: a foto solicita seleção de cabeça ou pé.
- `anatomy-state`: o painel informa a parte selecionada à foto.
- `anatomy-team`: informa o time à foto e aos troféus.
- `anatomy-ready`: indica que os dados iniciais chegaram e inicia os contadores.

## Onde fazer mudanças

- Layout e textos estáticos: `index.html`.
- Aparência: `style.css`; comportamento em telas pequenas e ajustes finais: `responsive.css`.
- Busca e quantidade por página: `goals.js` e `goalListState.size` em `core.js`.
- Regras dos anos e escudos: `filters.js`.
- Fotos e contornos: `player2d.js` e os SVG da página.
- Títulos: lista `trophies` em `trophies.js`; mantenha os critérios e fontes.
- Dados e classificação dos gols: consulte `database/DADOS.md` e os scripts de importação. Editar o catálogo local não atualiza sozinho o Neon.

A cascata CSS foi preservada para evitar alterações visuais. Os arquivos agora estão formatados, mas ainda contêm ajustes históricos que podem ser consolidados numa revisão específica de estilos.

## Mapa 2D dos lances

`public/shot-map.js` carrega `public/data/iconic-goals.json`. `renderShotMap()` filtra e monta os pontos; `chooseMoment()` seleciona um lance; `renderShotDetail()` monta seu cartão. Os estilos ficam em `public/shot-map.css`.

Os filtros são locais à seção. O catálogo inclui gols olímpicos e não participa da soma de gols da carreira. As coordenadas x/y representam regiões aproximadas num campo esquemático (100 × 80), com ataque para cima. Não são medições de tracking nem uma auditoria quadro a quadro dos vídeos. Pontos muito próximos podem ter um pequeno deslocamento visual para facilitar a seleção; a lista numerada oferece uma alternativa aos pontos.

Cada registro contém uma fonte do lance. O botão de vídeo abre uma busca específica no YouTube; não é um vídeo previamente validado. Antes de usar coordenadas como estatísticas de distância, elas precisam de revisão do vídeo e calibração do campo.

## Rodapé

O rodapé está no fim de `public/index.html`, com estilos em `public/footer.css`. Os links apontam para seções existentes. `#data-notes` é um painel nativo `details` com os critérios dos dados; o link correspondente em `navigation.js` abre o painel.

### Quiz do Neymar

public/quiz.js controla as cinco perguntas, a validação de cada resposta, as explicações com fontes e a pontuação final. renderQuiz monta a pergunta atual ou o resultado; o botão de jogar novamente reinicia a pontuação. public/quiz.css adapta as alternativas para desktop e celular. O quiz fica depois dos troféus e não exige conta.

