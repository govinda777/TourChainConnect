Feature: Token Balance
  Como um usuário do TourChain
  Eu quero visualizar meu saldo de tokens TOUR
  Para que eu possa acompanhar minhas finanças

  @blockchain @tokens
  Scenario: Visualizar saldo de tokens
    Given que estou conectado com minha carteira
    When eu acesso a página principal
    Then eu devo ver meu saldo atual de tokens TOUR

  @blockchain @tokens @transactions
  Scenario: Atualização do saldo após uma transação
    Given que estou conectado com minha carteira
    And eu tenho um saldo inicial de "100" tokens
    When eu faço uma contribuição de "50" tokens
    Then meu saldo deve ser atualizado para "50" tokens
    And devo ver uma confirmação da transação