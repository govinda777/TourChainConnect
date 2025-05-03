# language: pt

Funcionalidade: Programas de Bem-Estar em Viagens
  Como um gestor de recursos humanos
  Eu quero oferecer programas de bem-estar aos colaboradores em viagens
  Para garantir sua saúde física e mental durante os deslocamentos

  Cenário: Acessar o catálogo de programas de bem-estar
    Dado que estou autenticado no sistema
    Quando eu navego para a seção de Bem-Estar
    Então devo ver o catálogo de programas disponíveis
    E devo ver as categorias "Saúde física", "Saúde mental" e "Relaxamento"
    E cada programa deve mostrar uma descrição detalhada

  Cenário: Atribuir um programa de bem-estar a um colaborador
    Dado que estou na seção de Bem-Estar
    Quando eu seleciono o programa "Suporte Psicológico Remoto"
    E eu clico em "Atribuir a Colaborador"
    Então devo ver a lista de colaboradores com viagens agendadas
    Quando eu seleciono um colaborador da lista
    E eu confirmo a atribuição
    Então devo ver uma mensagem de confirmação
    E o colaborador deve receber uma notificação sobre o programa

  Cenário: Acompanhar a utilização de programas de bem-estar
    Dado que estou na seção de Relatórios de Bem-Estar
    Quando eu seleciono o período de análise
    Então devo ver estatísticas de utilização dos programas
    E devo ver métricas de satisfação dos colaboradores
    E devo poder exportar o relatório em formato PDF