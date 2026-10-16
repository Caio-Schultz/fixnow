# 🛠️ FixNow: A Plataforma de Serviços de Manutenção On-Demand

**FixNow** é um aplicativo **mobile-first** de marketplace que conecta clientes que precisam de serviços de manutenção (encanadores, eletricistas, pintores, etc.) a profissionais autônomos e verificados. O projeto é desenvolvido com foco em usabilidade (UX), experiência mobile e segurança.

## ✨ Visão Geral do Projeto

O FixNow resolve dois problemas principais:

- **Para Clientes**: a dificuldade de encontrar profissionais de manutenção qualificados, confiáveis e próximos.
- **Para Prestadores**: a baixa visibilidade e a dependência de indicações para conseguir novos serviços, além da impresivibilidade de atendimentos e gaps na agenda diária, o que limita o crescimento do negócio.

O app adota um formato de marketplace de serviços, com forte ênfase em **avaliações por estrelas (0–5)** e **geolocalização** para otimizar a experiência de agendamento e orçamento.

## 🏆 Diferencial Competitivo

- **Orçamento Ágil:** estimativas e fechamento instantâneos direto na plataforma, eliminando a fricção da longa negociação de propostas e as triagens demoradas.
- **Risco Zero de Aquisição:** o profissional não compra moedas ou "leads cegos" para disputar clientes, nem paga taxa de adesão. Ele só paga uma taxa sobre o serviço efetivamente fechado.
- **Match Geográfico:** um algoritmo inteligente de proximidade direciona os serviços para o prestador mais próximo, reduzindo custos de deslocamento urbano e maximizando a rentabilidade do técnico.
- **Consumo Sob Demanda:** sem mensalidades recorrentes ou taxas de franquia obrigatórias. O cliente solicita e paga estritamente pelo reparo pontual de que precisa.

## 🚀 Estrutura e Tecnologias

O FixNow é um aplicativo **mobile-first**, com arquitetura cliente-servidor e banco de dados relacional.

### Tabela de Tecnologias Utilizadas

| Componente | Função | Tecnologias Utilizadas |
| --- | --- | --- |
| **Front-end** | Interfaces do usuário e interatividade (mobile-first) | React (JavaScript, HTML, CSS) |
| **Back-end** | API, regras de negócio e autenticação | Node.js (Express) |
| **Banco de Dados** | Persistência de perfis, agendamentos e avaliações | PostgreSQL (Prisma ORM) |

### Principais Fluxos do App

1. **Interface do Cliente:** fluxo do Cliente, da busca e filtragem de profissionais até a solicitação de orçamento, com navegação fixa e interativa.
2. **Interface do Prestador:** fluxo do Prestador, incluindo o cadastro do perfil e o painel para gerenciar e responder a pedidos de orçamento.

## 🎨 Identidade Visual

A identidade visual do FixNow foi definida para transmitir **confiança, praticidade e profissionalismo**, com a paleta consolidada como variáveis-base do CSS do app.

### Tabela de Estilos

| Elemento | Cor / Característica | Propósito |
| --- | --- | --- |
| **Cor Principal** | Verde Floresta (`#059669`) | Ações e CTAs. É a cor da marca FixNow. |
| **Cor de Texto / Logo** | Grafite Escuro (`#1F2937`) | Tipografia, logotipo e textos principais. |
| **Cor de Fundo / Destaque** | Menta Claro (`#D1FAE5`) | Fundos suaves, selos e destaques. |
| **Containers** | Branco Puro (`#FFFFFF`) | Cards e contêineres de conteúdo. |
| **Tipografia (Marca)** | Outfit | Logotipo, títulos e splash screens. |
| **Estilo UX** | Cantos arredondados, botões com sombras, layout mobile-first | Facilidade de toque e visual agradável no celular. |

## 💡 Próximos Passos de Desenvolvimento

Para evoluir o FixNow rumo a uma aplicação completa, as seguintes funcionalidades seriam priorizadas nas próximas versões:

1. **Validação de Identidade:** biometria facial e validação do documento de identidade.
2. **Sistema de Geolocalização:** integrar APIs de mapa para calcular a distância real entre Cliente e Prestador.
3. **Chat em Tempo Real:** mensagens entre as partes para negociação e detalhes do serviço.
4. **Sistema de Pagamento:** integrar um gateway de pagamento para gerenciar transações e a taxa de comissão sobre serviços fechados.