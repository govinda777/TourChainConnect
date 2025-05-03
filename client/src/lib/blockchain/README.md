# Integração Frontend-Blockchain

Esta pasta contém todos os componentes necessários para integrar o frontend React com os smart contracts do TourChain.

## Estrutura de Arquivos

```
blockchain/
├── abis/                  # JSON ABIs dos contratos compilados
│   ├── TourToken.json
│   ├── TourStaking.json
│   ├── TourCrowdfunding.json
│   ├── TourOracle.json
│   └── CarbonOffset.json
├── addresses/             # Endereços dos contratos por rede
│   └── contracts.ts       # Mapeamento de endereços de contratos por rede
├── hooks/                 # React hooks para interagir com os contratos
│   ├── useContract.ts     # Hook genérico para instanciar contratos
│   ├── useTourToken.ts    # Hook para TourToken
│   ├── useTourStaking.ts  # Hook para TourStaking
│   └── ...
├── contexts/              # Contextos React para estado global de blockchain
│   ├── Web3Context.tsx    # Contexto para conexão web3
│   └── ContractsContext.tsx # Contexto para instâncias de contratos
├── providers/             # Provedores de contexto
│   └── Web3Provider.tsx   # Provedor para conexão de carteira
├── utils/                 # Utilitários para blockchain
│   ├── chains.ts          # Configurações de redes
│   ├── format.ts          # Formatação de valores blockchain
│   └── transactions.ts    # Helpers para transações
└── index.ts               # Exporta tudo para uso no aplicativo
```

## Fluxo de Dados

1. `Web3Provider` conecta carteira e mantém estado de conexão
2. Hooks utilizam o contexto para interagir com contratos
3. Componentes UI consomem hooks para realizar ações blockchain
4. Eventos de contratos são escutados para atualizações em tempo real