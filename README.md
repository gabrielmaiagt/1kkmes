# 1KK — controle da oferta

Web app simples para uma única oferta, com gastos de anúncios, BM, domínio, serviços e outros; faturamento diário; responsável; edição/exclusão; filtros de período e busca; exportação CSV; dashboard de receitas, despesas, resultado e ROAS. Valores são armazenados em centavos para evitar erros de arredondamento.

## Rodar localmente

Requer Node.js 22.12 ou superior.

```sh
npm install
npm run dev
```

Abra o endereço informado pelo Vite. Na prévia local, entre com a senha **1kk123**. Esse bloqueio é apenas demonstrativo, não protege os dados locais. Sem configuração Firebase, os dados ficam no `localStorage` deste navegador, sem compartilhamento. Limpar os dados do navegador apaga os registros locais; exporte CSV para guardar uma cópia. Nenhum dado fictício é inserido.

## Conectar Firebase / Firestore

1. Crie um projeto no console Firebase e registre um aplicativo Web.
2. Copie `.env.example` para `.env.local`. Preencha a configuração do aplicativo Web (API key, auth domain, project ID e app ID). Configure `VITE_SHARED_LOGIN_EMAIL` com o e-mail da conta compartilhada (padrão: `acesso@planilha1kk.local`). Esse e-mail é utilizado internamente; a tela pede somente a senha. Mantenha o mesmo `VITE_OFFER_ID` para todos os sócios. A senha não deve ser colocada em variáveis `VITE_*` nem no código de produção.
3. Ative **Authentication → Método de login → E-mail/senha**. Em **Usuários**, crie uma única conta com o e-mail configurado e defina a senha compartilhada. Copie seu UID. Vocês usarão a mesma senha, validada pelo Firebase, sem cadastrar contas individuais.
4. Crie um banco **Cloud Firestore**. Na aba Dados, crie a coleção `offers` e o documento `oferta-principal` (ou o valor de `VITE_OFFER_ID`). Adicione `memberUids`, do tipo array, com o UID da conta compartilhada como string. O documento de membros é gerenciado pelo console; o app não altera permissões.
5. Na aba Regras, publique o conteúdo de `firestore.rules`. As regras restringem leitura/escrita aos membros dessa oferta e validam os lançamentos. Não use regras públicas.
6. Reinicie `npm run dev`. O app exibirá o login. Os membros autorizados passam a compartilhar os lançamentos em tempo real. O modo local não importa registros automaticamente; os dois ambientes ficam separados.

Estrutura dos registros: `offers/{offerId}/entries/{entryId}`. Os sócios têm as mesmas permissões de criar, editar e excluir lançamentos. “Responsável” é um campo descritivo opcional, não uma trilha de auditoria. A senha compartilhada é alterada no console Firebase nesta versão inicial. Todos usam a mesma identidade; não há identificação individual automática. A sessão Firebase persiste entre visitas; use Sair em dispositivos compartilhados. Na prévia local, a sessão dura nesta aba até sair ou fechá-la.

Configuração incompleta mantém o app em modo local, com aviso na interface. Após configurar, falhas de permissão ou conexão são exibidas como erros; o app não muda silenciosamente para dados locais.

Referências: [configuração Web](https://firebase.google.com/docs/web/setup), [autenticação por e-mail/senha](https://firebase.google.com/docs/auth/web/password-auth), [atualizações em tempo real](https://firebase.google.com/docs/firestore/query-data/listen).

## Cálculos

- Resultado = faturamento − todos os gastos.
- ROAS = faturamento ÷ gastos na categoria Anúncios. Sem gastos com anúncios, aparece “—”. Não representa atribuição de vendas por campanha.
- “Este mês” usa o calendário local do navegador; datas dos registros não são convertidas para UTC.
- O gráfico mostra os últimos 14 dias com movimentação dentro do filtro. O total de indicadores considera todo o período selecionado. Faturamentos diários adicionais somam entre si; para corrigir um valor, edite o registro existente.
- Exportação reflete os filtros ativos e inclui todos os resultados, mesmo quando o dashboard exibe apenas os seis mais recentes.

## Verificação e publicação

```sh
npm test
npm run build
```

O build estático fica em `dist/`. Para publicar no Firebase Hosting, instale/use a CLI oficial, autentique-se e execute `firebase use --add` para selecionar seu projeto. Com `.env.local` preenchido, execute `npm run build` e `firebase deploy --only hosting,firestore:rules`. A hospedagem utiliza o projeto `kkmes-7cf72`. Para atualizar o site, execute o build e o deploy acima; um push no GitHub, sozinho, não dispara publicação automática. As variáveis `VITE_*` compõem o bundle público; nunca coloque chave de conta de serviço ou credenciais administrativas nelas.

## Domínios e criativos validados

- **Domínios:** cadastro do endereço, status Ativo/Rejeitado, data do registro e observações (incluindo motivo da rejeição). Filtros por status e busca. Editar permite mudar o status sem recadastrar.
- **Criativos validados:** nome, link opcional do material (vídeo, imagem ou pasta externa), data da validação e observações. Não faz upload de arquivos.
- Ambas as abas permitem editar e excluir. Esses cadastros não alteram os indicadores financeiros; custos de domínio continuam sendo registrados em Lançamentos.
- Dados no Firestore: `offers/{offerId}/domains/{id}` e `offers/{offerId}/creatives/{id}`, com as mesmas permissões da oferta. **Republique `firestore.rules`** para habilitar as novas coleções em um projeto já configurado.
- No modo local, as abas usam chaves próprias no navegador e preservam os lançamentos anteriores.

Endereço principal: https://1kkmes.web.app. O site Hosting `1kkmes` usa o mesmo projeto Firebase `kkmes-7cf72`, login e Firestore. O endereço anterior continua disponível.
