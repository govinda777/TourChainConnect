# language: pt

Funcionalidade: Calculadora de Sustentabilidade
  Como um gestor de viagens corporativas
  Eu quero calcular a pegada de carbono das viagens da minha empresa
  Para compensar o impacto ambiental e obter a certificação "TourChain Sustentável"

  Cenário: Calcular pegada de carbono de viagens aéreas
    Dado que estou na página da calculadora de sustentabilidade
    Quando eu preencho o número de voos como "10"
    E eu preencho a distância média como "5000"
    E eu seleciono a distribuição de classes como "70% Econômica, 20% Executiva, 10% Primeira Classe"
    E eu clico em calcular
    Então devo ver o resultado da pegada de carbono
    E devo ver a equivalência em carros por ano
    E devo ver o custo estimado de compensação

  Cenário: Obter certificação de sustentabilidade
    Dado que estou na página da calculadora de sustentabilidade
    Quando eu calculo a pegada de carbono da minha empresa
    E eu clico em "Compensar Emissões"
    Então devo ver o formulário de compensação
    Quando eu preencho os dados da empresa
    E eu seleciono o projeto de compensação
    E eu confirmo o pagamento
    Então devo ver a confirmação da certificação "TourChain Sustentável"
    E devo poder baixar o certificado em PDF