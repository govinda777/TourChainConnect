# language: pt

Funcionalidade: Financiamento Coletivo
  Como um potencial investidor
  Quero explorar a página de financiamento coletivo do TourChain
  Para entender como posso apoiar o desenvolvimento da plataforma

  Cenário: Visualizar informações da campanha
    Dado que estou na página de financiamento coletivo
    Então devo ver as informações da campanha
    E devo ver a porcentagem de financiamento atual
    E devo ver o número de apoiadores
    E devo ver os dias restantes para o término da campanha

  Cenário: Explorar níveis de recompensa
    Dado que estou na página de financiamento coletivo
    Quando eu rolo até a seção "Recompensas"
    Então devo ver os diferentes níveis de recompensa disponíveis
    E cada nível deve mostrar o valor da contribuição
    E cada nível deve mostrar detalhes do smart contract associado

  Cenário: Fazer uma contribuição
    Dado que estou na página de financiamento coletivo
    Quando eu clico no botão "Apoiar Este Projeto"
    Então devo ver a janela de contribuição
    Quando eu preencho os detalhes da contribuição
    E seleciono um nível de recompensa
    E confirmo minha transação na carteira conectada
    Então devo ver uma confirmação de contribuição bem-sucedida
    E devo ver minha transação registrada na blockchain