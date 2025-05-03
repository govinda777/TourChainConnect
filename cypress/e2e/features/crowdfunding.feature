# language: pt

Funcionalidade: Financiamento coletivo do projeto
  Como um usuário entusiasmado com o projeto TourChain
  Eu quero apoiar financeiramente o desenvolvimento da plataforma
  Para que ela possa ser lançada e beneficiar viagens corporativas

  Cenário: Visualizar detalhes da campanha de financiamento
    Dado que estou na página de financiamento coletivo
    Então devo ver o título da campanha
    E devo ver o progresso da arrecadação
    E devo ver o número de apoiadores
    E devo ver as recompensas disponíveis

  Cenário: Fazer uma contribuição anônima
    Dado que estou na página de financiamento coletivo
    Quando eu clico no botão "Apoiar Este Projeto"
    Então devo ver o diálogo de apoio
    Quando eu preencho o valor da contribuição
    E eu marco a opção de contribuição anônima
    E eu preencho o email "apoiador@exemplo.com"
    E eu submeto o formulário
    Então devo ver uma mensagem de agradecimento
    E a contribuição deve aparecer como anônima na lista de apoiadores

  Cenário: Escolher uma recompensa específica
    Dado que estou na página de financiamento coletivo
    Quando eu clico no botão "Selecionar" de uma recompensa
    Então devo ver o diálogo de apoio com o valor pré-preenchido
    Quando eu preencho meu nome como "João Silva"
    E eu preencho o email "joao@exemplo.com"
    E eu adiciono um comentário "Estou ansioso para ver o projeto completo!"
    E eu submeto o formulário
    Então devo ver uma mensagem de sucesso
    E minha contribuição deve aparecer na lista de apoiadores