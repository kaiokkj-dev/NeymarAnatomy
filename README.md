# Neymar Anatomy

Site de estatísticas e anatomia dos gols de Neymar, com Express, JavaScript e PostgreSQL no Neon.

## Executar

Requer Node.js 22 ou superior.

```sh
npm install
npm start
```

Abra http://localhost:3000. A configuração privada fica em `.env`, na raiz; `.env.example` é apenas o modelo. Sem banco configurado, o servidor usa `demo-goals.json`.

## Entender e editar

- [Guia do código e das funções](docs/CODIGO.md)
- [Dados, fontes e classificação](database/DADOS.md)

O HTML do site está em `public/index.html`. Os numerosos HTML de `work/` são evidências da pesquisa, não páginas da aplicação. Veja [a finalidade de work](work/README.md).

Para manter a formatação dos arquivos da aplicação:

```sh
npx prettier@3.6.2 --write "public/*.js" public/index.html public/style.css public/responsive.css server.js package.json
```

## Assistências por time

A interface mostra fontes independentes para gols e assistências. Os critérios podem divergir entre fontes; consulte `database/DADOS.md` para o estado atual da conferência. O script `work/import-assists-reference.mjs` importa as referências de `database/assists-research.json` e altera o banco.
