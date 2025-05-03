# language: pt

Funcionalidade: Otimização de Despesas com IA
  Como um gestor financeiro de uma empresa
  Eu quero analisar o histórico de viagens e despesas usando IA
  Para identificar oportunidades de economia e obter recomendações personalizadas

  Cenário: Análise de despesas de viagens
    Dado que estou autenticado no sistema
    Quando eu acesso o dashboard de Otimização de Despesas
    Então devo ver um resumo das despesas recentes
    E devo ver gráficos comparativos por categoria
    E devo ver indicadores de tendência de gastos

  Cenário: Receber recomendações de economia da IA
    Dado que estou visualizando o dashboard de Otimização de Despesas
    Quando eu clico em "Gerar Recomendações"
    Então o sistema deve processar os dados históricos
    E devo receber uma lista de recomendações personalizadas
    E cada recomendação deve mostrar a potencial economia estimada

  Cenário: Utilizar o sistema de gamificação para economia
    Dado que estou na seção de Gamificação de Economia
    Quando eu visualizo as metas de economia para minha empresa
    Então devo ver o ranking dos colaboradores mais econômicos
    E devo ver as recompensas disponíveis por atingir metas
    Quando eu clico em "Definir Desafio de Economia"
    Então devo poder configurar um novo desafio para minha equipe
    E devo poder definir as regras e recompensas do desafio