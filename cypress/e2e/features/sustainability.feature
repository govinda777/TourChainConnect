Feature: Sustentabilidade Corporativa
  Como uma empresa focada em sustentabilidade
  Eu quero acompanhar a pegada de carbono das viagens
  Para reduzir meu impacto ambiental

  @sustainability @metrics
  Scenario: Visualização da pegada de carbono da empresa
    Given que estou logado como gerente de sustentabilidade
    When eu acesso o dashboard de sustentabilidade
    Then eu devo ver o total de emissões de carbono da empresa
    And eu devo ver um gráfico de tendência das emissões ao longo do tempo

  @sustainability @offsets
  Scenario: Aquisição de compensações de carbono
    Given que estou logado como gerente de sustentabilidade
    And existem "500" kg de emissões de CO2 não compensadas
    When eu inicio o processo de compensação de carbono
    And eu seleciono um projeto de reflorestamento
    And eu confirmo a compra de créditos de carbono
    Then eu devo ver uma confirmação da transação na blockchain
    And o balanço de emissões não compensadas deve ser "0" kg

  @sustainability @reporting
  Scenario: Geração de relatório de sustentabilidade
    Given que estou logado como gerente de sustentabilidade
    When eu solicito um relatório de sustentabilidade para o último trimestre
    Then eu devo receber um documento com o resumo das emissões
    And o relatório deve incluir gráficos comparativos com trimestres anteriores