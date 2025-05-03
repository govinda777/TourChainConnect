# language: pt

Funcionalidade: Jornada de Otimização de Custos
  Como um gestor de viagens corporativas
  Quero explorar a jornada de otimização de custos do TourChain
  Para entender como a plataforma pode reduzir despesas e aumentar a eficiência

  Cenário: Iniciar jornada de otimização de custos
    Dado que estou na página inicial
    Quando eu clico no botão "Jornada de Otimização de Custos"
    Então devo ser redirecionado para a página de jornada
    E devo ver o título "Jornada de Otimização de Custos"
    E devo ver a barra de progresso iniciar em 0%

  Cenário: Completar a jornada de otimização de custos
    Dado que estou na página de jornada de otimização de custos
    Quando a barra de progresso atinge 100%
    Então devo ver a mensagem "Processo concluído!"
    E devo ver o botão "Continuar para Financiamento"
    Quando eu clico no botão "Continuar para Financiamento"
    Então devo ser redirecionado para a página de financiamento coletivo

  Cenário: Verificar recursos de IA para análise de despesas
    Dado que estou na página de jornada de otimização de custos
    Quando a jornada mostra informações sobre análise de despesas
    Então devo ver dados sobre como oracles de IA otimizam gastos
    E devo ver exemplos de economia através de smart contracts