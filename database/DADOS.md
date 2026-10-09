# Pesquisa de dados reais — 09/10/2026

Critério: partidas oficiais de clubes e seleção principal contra seleções, incluindo amistosos internacionais reconhecidos. Seleção olímpica e Sub-20 ficam separadas. Disputas de pênaltis não contam como gols. Amistosos de clubes não entram.

## Totais de referência

| Time / período | Gols | Jogos | Cobertura |
|---|---:|---:|---|
| Barcelona 2013–2017 | 105 | 186 | Passagem encerrada, fonte do clube |
| PSG 2017–2023 | 118 | 173 | Passagem encerrada, fonte do clube |
| Al-Hilal 2023–2025 | 1 | 7 | Passagem encerrada, The National |
| Santos 2009–2013 | 136 | 225 | Primeira passagem, Prefeitura de Santos |
| Santos, duas passagens | 158 | 276 | Fotografia dos números em 30/07/2026, fonte do clube |
| Brasil principal | 80 | 130 | Referência de 30/07/2026, Folha; confirmação primária atual pendente |

URLs e datas estão em career-reference.json. Não somar a primeira passagem no Santos com o total das duas passagens. Não somar snapshots de datas diferentes e chamar o resultado de total atual.

## Pendências

- Atualizar Santos de 31/07 a 08/10/2026, verificando jogos e gols. Há dois gols na partida de 08/10 contra o Flamengo, mas faltam os jogos anteriores desse intervalo: https://www.santosfc.com.br/santos-fc-busca-empate-contra-o-flamengo-em-noite-de-festa-na-vila-belmiro/ .
- Confirmar o total atual da seleção principal em fonte primária. O antigo 79 da CBF refere-se a fevereiro de 2025.
- Conferir a classificação por parte do corpo. Pênalti e falta são métodos de gol, não partes do corpo.
- A consulta ao Transfermarkt produziu candidatos em work/transfermarkt-goal-candidates.json, não importados: a extração não reconcilia com os totais oficiais e precisa revisão. Não usar esses números como carreira completa.
- Statbunker tem cobertura parcial: Barcelona 90 gols, PSG 104 gols; a soma por corpo deve ser apresentada somente nesse recorte, nunca como total dessas passagens.
- NeymarStats apresenta dados desatualizados e categorias que não fecham o total. Não é fonte de importação.

Nenhuma linha sintética foi criada na tabela goals para representar totais. Os totais ficam separados dos registros de gols individuais.

Atualização de 09/10/2026: Santos ajustado para 160 gols conforme informação do responsável pelo projeto. A fonte do clube confirma os dois gols de Neymar no empate com o Flamengo em 08/10/2026. Número acumulado de partidas permanece pendente, sem reutilizar as 276 partidas da referência de julho.


Assistências do Santos: 79 pela soma de 278 partidas no Transfermarkt, até 08/10/2026 (67 entre 2009–2013, 4 em 2025 e 8 em 2026). Campo utilizado: goalStatistics.assists, apenas participação played pelo clube 221, sem seleções e sem IDs duplicados. Fonte: https://www.transfermarkt.com/neymar/leistungsdatenverein/spieler/68290 . Referências de assistências de clubes diferentes ainda usam critérios que podem divergir; soma 294 não deve ser rotulada como total oficial uniforme.


Partidas de referência: Santos atualizado para 278 pela contagem dos registros do Transfermarkt já usada nas assistências (225 na primeira passagem + 28 em 2025 + 25 em 2026). Soma das referências por time: 774, sem categorias de base ou seleção olímpica. Fontes e períodos diferentes; não rotular como total oficial universal.


## Catálogo de anatomia — 09/10/2026

Importados 461 eventos individuais em catalog-goals.json. A tabela de gols do Transfermarkt fornece o tipo de finalização; as datas e os totais de cada partida foram cruzados com sua ficha pública de desempenho. Os eventos usam a chave partida + placar, sem duplicatas. A importação é transacional e pode ser repetida sem criar novos gols.

| Time | Catalogados | Direito | Esquerdo | Cabeça | Outra parte | Sem classificação |
|---|---:|---:|---:|---:|---:|---:|
| Santos |157|57|22|6|1|71|
| Barcelona |105|76|22|7|0|0|
| PSG |118|80|33|5|0|0|
| Brasil |80|62|11|3|0|4|
| Al-Hilal |1|0|1|0|0|0|

Pênaltis, faltas e outros tipos que não informam o membro permanecem unknown. O único gol do Al-Hilal, contra Nassaji em 03/10/2023 aos 58 minutos, tem confirmação independente da Anadolu de finalização com o pé esquerdo. Santos mantém 160 na referência agregada fornecida pelo usuário, mas só 157 eventos individuais foram encontrados nesta fonte. Não fabricar os três registros faltantes.

Executar: node --env-file=.env work/import-catalog-goals.mjs

As divisões por parte do corpo são contagens identificadas no catálogo, não totais definitivos de carreira. Próximo trabalho: conferir em vídeo os 75 eventos desconhecidos e reconciliar a diferença de três gols do Santos.


### Conferência do Barcelona

22 eventos antes sem membro foram identificados por comentários de gols da ESPN (21 direito e 1 esquerdo). Dois registros já classificados foram corrigidos com confirmação adicional: Real Sociedad em 28/11/2015 aos 53 minutos (esquerdo) e Villarreal em 06/05/2017 aos 21 minutos (direito). Fontes e alterações estão em barcelona-anatomy-verifications.json. Duas divergências continuam em revisão: Real Sociedad aos 22 minutos e Alavés em 11/02/2017 aos 40 minutos. Mantida a classificação original nesses dois casos; 76/22/7 é a divisão atual do catálogo, ainda sujeita a essas conferências.


### Conferência da seleção brasileira

27 dos 31 registros pendentes tiveram o membro identificado em comentários de gols da ESPN, dados do Statbunker e reportagem do Korea JoongAng Daily. Divisão atual: 62 direito, 11 esquerdo, 3 cabeça e 4 pendentes, em 80 gols da seleção principal. Os quatro lances restantes são Argentina (19/09/2012), Japão (16/10/2012), Colômbia (05/09/2014) e o terceiro gol contra Japão (14/10/2014; data original no catálogo 13/10). Reprodução de vídeo no GE foi interrompida por publicidade; YouTube exigiu CAPTCHA. Não inferir membro pelo tipo pênalti/falta. Proveniência em brasil-anatomy-verifications.json.


### Conferência do PSG

44 gols pendentes classificados por descrição explícita nos comentários da ESPN. 117 dos 118 eventos encontraram correspondência de partida e placar para conferência. Não houve divergência com as classificações anteriores nos eventos correspondentes. Divisão: 80 direito, 33 esquerdo e 5 cabeça. Proveniência: psg-anatomy-verifications.json. Total 118 confirmado pelo comunicado oficial do PSG: https://en.psg.fr/teams/first-team/content/paris-saint-germain-thank-neymar-jr-a-club-legend .


### Conferência do Santos

27 gols pendentes classificados: 16 com descrições explícitas da ESPN e 11 em relatos das partidas. Divisão identificada: 57 direito, 22 esquerdo, 6 cabeça e 1 outra parte; 71 dos 157 eventos continuam pendentes. Todos os 21 gols catalogados de 2025 e 2026 agora têm parte do corpo. Os 71 restantes são da primeira passagem. Não estimar membros a partir de pênaltis, faltas ou pé dominante. Proveniência e lista de pendências em santos-anatomy-verifications.json.

O catálogo contém 136 gols de 2009–2013, 11 em 2025 e 10 em 2026. O Santos publica 138 na primeira passagem, com critérios mais amplos que a lista competitiva. Essa diferença responde por dois gols; o terceiro da diferença entre 157 e a referência de 160 ainda não foi reconciliado. Nenhum evento foi inventado para fechar a soma.
