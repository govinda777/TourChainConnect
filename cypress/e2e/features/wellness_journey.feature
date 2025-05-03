# language: pt

Funcionalidade: Jornada de Bem-Estar
  Como um usuário corporativo
  Quero explorar a jornada de bem-estar do TourChain
  Para entender como a plataforma pode melhorar o bem-estar durante viagens

  Cenário: Iniciar jornada de bem-estar
    Dado que estou na página inicial
    Quando eu clico no botão "Jornada de Bem-Estar"
    Então devo ser redirecionado para a página de jornada
    E devo ver o título "Jornada de Bem-Estar"
    E devo ver a barra de progresso iniciar em 0%

  Cenário: Completar a jornada de bem-estar
    Dado que estou na página de jornada de bem-estar
    Quando a barra de progresso atinge 100%
    Então devo ver a mensagem "Processo concluído!"
    E devo ver o botão "Continuar para Financiamento"
    Quando eu clico no botão "Continuar para Financiamento"
    Então devo ser redirecionado para a página de financiamento coletivo

  Cenário: Pular para financiamento
    Dado que estou na página de jornada de bem-estar
    Quando eu clico no botão "Pular para Financiamento"
    Então devo ser redirecionado para a página de financiamento coletivo