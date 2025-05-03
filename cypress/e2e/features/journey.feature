# language: pt

Funcionalidade: Jornada de descoberta do usuário
  Como um potencial cliente corporativo
  Eu quero explorar as diferentes jornadas oferecidas pela TourChain
  Para entender como a plataforma pode beneficiar minha empresa

  Cenário: Iniciar uma jornada de bem-estar
    Dado que estou na página inicial
    Quando eu clico no cartão de jornada "Bem-Estar"
    Então devo ser redirecionado para a página de jornada de bem-estar
    E devo ver os estágios da jornada

  Cenário: Progredir através de uma jornada
    Dado que estou em uma jornada de bem-estar
    Quando eu completo o estágio atual
    Então meu progresso deve ser atualizado
    E devo ver o próximo estágio da jornada

  Cenário: Completar uma jornada e ser direcionado para o financiamento coletivo
    Dado que estou no último estágio de uma jornada
    Quando eu completo o último estágio
    Então devo ver uma mensagem de parabéns
    E devo ver um botão para apoiar o projeto
    Quando eu clico no botão para apoiar
    Então devo ser redirecionado para a página de financiamento coletivo