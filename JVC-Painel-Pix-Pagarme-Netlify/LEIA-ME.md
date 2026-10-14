# JVC PAY — Painel Pix Pagar.me + Netlify

## O que está implementado
- Tela de login com sessão assinada em cookie `HttpOnly` (8h) e navegação administrativa.
- Geração de pedido Pix pela API Core V5 com dados do comprador, QR Code e Copia e Cola.
- Status por ID do pedido e listagem dos 25 últimos pedidos retornados pela API.
- Split opcional entre **dois recebedores aprovados**, percentuais fixados no servidor.
- Nome comercial configurável na interface (`PIX_DISPLAY_NAME`). **Não altera o recebedor exibido no aplicativo do banco e não modifica o Pix oficial.**

## Implantação
1. Descompacte o ZIP e envie **os arquivos internos para a raiz** do repositório GitHub, incluindo a pasta `netlify/` e o arquivo `netlify.toml`. Não envie outra pasta envoltória.
2. No Netlify, conecte esse repositório em **Add new project > Import an existing project**, ou abra o projeto existente e configure o repositório. Defina base directory vazia, build command vazio e publish directory `.`.
3. Em **Project configuration > Environment variables**, defina as variáveis:

| Variável | Valor |
|---|---|
| `PAGARME_SECRET_KEY` | Nova chave secreta da conta Pagar.me (marcar como secret) |
| `ADMIN_USER` | Usuário administrador escolhido por você |
| `ADMIN_PASSWORD` | Senha forte exclusiva, com mais de 16 caracteres |
| `SESSION_SECRET` | String longa aleatória (mínimo 32 caracteres recomendados) |
| `PIX_DISPLAY_NAME` | `JVC Auto Peças` (ou nome comercial legítimo) |
| `SPLIT_RECIPIENT_MAIN` | ID do recebedor principal aprovado, exemplo `rp_...` (opcional) |
| `SPLIT_RECIPIENT_PARTNER` | ID do parceiro aprovado, exemplo `rp_...` (opcional) |
| `SPLIT_PARTNER_PERCENT` | Percentual inteiro de 1 a 99 para o parceiro (opcional) |

Defina as variáveis no contexto Functions (ou All), salve e faça **Trigger deploy** novamente.

4. Acesse `https://SEU-SITE.netlify.app/login` e entre usando `ADMIN_USER` e `ADMIN_PASSWORD`.
5. Use **Gerar Pix** com dados verdadeiros do comprador e preço real. Só marque Split depois de confirmar os IDs aprovados e acordo de divisão.

## Cuidados
- **Não compartilhe chaves secretas no chat nem as coloque em GitHub, JavaScript ou HTML.** Como uma chave foi compartilhada anteriormente, revogue-a e crie outra no painel Pagar.me.
- Ao criar pedidos Pix em produção, há possibilidade de cobrança real. Não experimente com comprador inventado.
- Uma conta PSP pode exigir endereço e outros dados cadastrais do comprador. Este painel demonstra nome, CPF/CNPJ, e-mail e telefone. Se a API exigir endereço, amplie o formulário e o payload, seguindo a documentação oficial.
- Este é um **painel inicial funcional de integração**, não uma plataforma SaaS de produção: não inclui banco de dados próprio, múltiplos usuários, auditoria completa, proteção avançada contra tentativa de senha ou webhook. Para operação em escala, implemente essas camadas e monitore logs.
- O histórico mostra os últimos 25 pedidos da API e não necessariamente somente os criados por esta aplicação.
- `qr_code_url` é fornecido pela Pagar.me. Alguns links podem exigir autenticação, e o navegador pode não exibir a imagem; o código Copia e Cola é independente disso.
- A divisão Split só distribui fundos conforme regras autorizadas; não serve para ocultar o beneficiário do cliente.

## Referências
- https://docs.pagar.me/reference/criar-pedido-2
- https://docs.pagar.me/reference/pix-2
- https://docs.pagar.me/reference/listar-pedidos

## Estrutura
`index.html`, `app.js`, `netlify.toml` e `netlify/functions/*.js`.
