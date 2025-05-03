# language: pt

Funcionalidade: Jornada Tecnológica Blockchain
  Como um profissional interessado em inovação
  Quero explorar a jornada tecnológica do TourChain
  Para entender como a tecnologia blockchain transforma viagens corporativas

  Cenário: Iniciar jornada tecnológica
    Dado que estou na página inicial
    Quando eu clico no botão "Jornada Tecnológica"
    Então devo ser redirecionado para a página de jornada
    E devo ver o título "Jornada Tecnológica"
    E devo ver a barra de progresso iniciar em 0%

  Cenário: Completar a jornada tecnológica
    Dado que estou na página de jornada tecnológica
    Quando a barra de progresso atinge 100%
    Então devo ver a mensagem "Processo concluído!"
    E devo ver o botão "Continuar para Financiamento"
    Quando eu clico no botão "Continuar para Financiamento"
    Então devo ser redirecionado para a página de financiamento coletivo

  Cenário: Verificar elementos de tecnologia EVM
    Dado que estou na página de jornada tecnológica
    Quando a jornada mostra informações sobre a tecnologia EVM
    Então devo ver informações sobre smart contracts
    E devo ver explicações sobre implementação ERC-4337
    E devo ver como oracles conectam dados off-chain com a blockchain