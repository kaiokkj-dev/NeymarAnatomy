# ⚽ Neymar Anatomy

Um site interativo para explorar a carreira de Neymar Jr. por meio de seus gols, assistências, títulos e momentos marcantes.

Projeto independente desenvolvido por **Kaio Henrique**.

## ✨ Funcionalidades

- **Visão geral da carreira** — totais de gols, assistências e partidas com fontes.
- **Anatomia dos gols** — distribuição por pé direito, pé esquerdo, cabeça e outras partes do corpo.
- **Filtros por time e ano** — explore diferentes fases da carreira.
- **Relógio dos gols** — em que faixa de 5 minutos Neymar mais marca, com filtro por time.
- **Comparar fases** — dois times lado a lado, com frases automáticas sobre as maiores diferenças (pé, cabeça, pênaltis, faltas, 2º tempo, reta final).
- **Mapa 2D interativo** — lances icônicos com animações ilustrativas dos chutes.
- **Gols e momentos** — registros paginados com filtros por adversário e tipo de jogada.
- **Troféus e títulos** — conquistas organizadas por time e temporada.
- **Quiz do Neymar** — perguntas com pontuação, explicações e fontes.
- **Ajude a classificar** — visitantes votam na parte do corpo dos gols ainda sem classificação; o consenso fica separado da classificação oficial até ser conferido com fonte.
- **Três idiomas** — português, inglês e espanhol.
- **Design responsivo** — interface adaptada para computador e celular.
- **Tema claro e escuro**.

## 🛠️ Tecnologias

- HTML, CSS e JavaScript
- Node.js e Express
- PostgreSQL hospedado no Neon
- Vercel

## 🚀 Como executar

Requer **Node.js 22 ou superior**.

### 1. Clone o repositório

```bash
git clone https://github.com/kaiokkj-dev/NeymarAnatomy.git
cd NeymarAnatomy
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco

Copie `.env.example` para `.env` e preencha a variável `DATABASE_URL` com a conexão do Neon.

O arquivo `.env` deve permanecer fora do Git.

Para ativar o **Ajude a classificar** com o banco, preencha também `VOTE_SECRET` com um valor longo e aleatório e rode `node --env-file=.env work/setup-neon.mjs` para criar a tabela `goal_votes`.

### 4. Inicie o servidor

```bash
npm start
```

Acesse **http://localhost:3000**.

Sem conexão com o banco, a aplicação utiliza registros de demonstração.

### Testes

```bash
npm test
```

Os testes cobrem a regra de consenso, as rotas de votação (voto duplicado, entrada inválida, gol já classificado, limite por hora) e o SQL real num Postgres em memória (PGlite), sem precisar do Neon.

## 📊 Sobre os dados

Os totais da carreira apresentam fontes e datas de referência. A classificação dos gols por parte do corpo está em conferência e pode conter registros ainda não classificados.

Por isso, os totais de referência podem diferir da quantidade de gols catalogados.

As posições e trajetórias do mapa são ilustrativas e aproximadas. Os botões de vídeos abrem buscas no YouTube.

A contagem de títulos segue os critérios documentados no projeto.

## 📁 Organização do projeto

| Arquivo ou pasta | Função |
| --- | --- |
| `public/` | Interface, estilos, scripts e imagens |
| `server.js` | Servidor Express e rotas de consulta ao banco |
| `lib/review.js` | Regras, armazenamento e rotas do Ajude a classificar |
| `test/` | Testes automatizados (`npm test`) |
| `showcase/` | Vídeo e imagens de divulgação |
| `database/` | Documentação dos dados e arquivos de pesquisa |
| `docs/CODIGO.md` | Explicação do código e das funções |
| `work/` | Evidências e materiais de apoio da pesquisa |

## ☁️ Publicação na Vercel

Importe o repositório utilizando o preset **Express** e a raiz do projeto.

Configure `DATABASE_URL` nas variáveis de ambiente antes de publicar. Não é necessário definir Build Command ou Output Directory.

## 👨‍💻 Autor

Desenvolvido por **Kaio Henrique**.

[Meu GitHub](https://github.com/kaiokkj-dev)

Projeto independente criado para explorar o futebol por meio de dados e experiências interativas.
