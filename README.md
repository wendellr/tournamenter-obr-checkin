# tournamenter-obr-checkin

Plugin para o Tournamenter baseado no plugin regional da OBR.

Esta variante usa o OBR Checkin como fonte:

- Importacao de equipes: `https://obr.ioda.com.br/api/events/steps/participants`
- Envio de notas: `https://obr.ioda.com.br/api/events/steps/score`

## Fluxo operacional

1. Cadastre o token da modalidade na aba Olimpo do OBR Checkin.
2. Sincronize o token com o Olimpo para preservar os IDs originais das equipes.
3. Realize o check-in dos participantes/equipes presentes.
4. No Tournamenter, abra a tela de configuracao do plugin e informe o mesmo token.
5. O plugin importara somente as equipes presentes no OBR Checkin.

Se uma equipe presente nao tiver sido sincronizada previamente com o Olimpo, o OBR Checkin gera um ID local de contingencia. Para uso oficial, prefira sincronizar o token antes da importacao no Tournamenter.
