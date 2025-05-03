# language: pt

Funcionalidade: Jornada de Sustentabilidade
  Como um usuário corporativo
  Quero explorar a jornada de sustentabilidade do TourChain
  Para entender como a plataforma pode reduzir o impacto ambiental das viagens corporativas

  Cenário: Iniciar jornada de sustentabilidade
    Dado que estou na página inicial
    Quando eu clico no botão "Jornada de Sustentabilidade"
    Então devo ser redirecionado para a página de jornada
    E devo ver o título "Jornada de Sustentabilidade"
    E devo ver a barra de progresso iniciar em 0%

  Cenário: Completar a jornada de sustentabilidade
    Dado que estou na página de jornada de sustentabilidade
    Quando a barra de progresso atinge 100%
    Então devo ver a mensagem "Processo concluído!"
    E devo ver o botão "Continuar para Financiamento"
    Quando eu clico no botão "Continuar para Financiamento"
    Então devo ser redirecionado para a página de financiamento coletivo

  Cenário: Verificar cálculo de compensação de carbono
    Dado que estou na página de jornada de sustentabilidade
    Quando a jornada mostra informações sobre compensação de carbono
    Então devo ver dados sobre tokenização de certificados de carbono
    E devo ver como smart contracts validam a compensação de emissões