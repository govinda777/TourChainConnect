// Este arquivo simula o import.meta.env do Vite para os testes Jest
global.import = {};
global.import.meta = {
  env: {
    VITE_BLOCKCHAIN_NETWORK: 'localhost',
    VITE_INFURA_API_KEY: 'test-infura-key',
    VITE_ALCHEMY_API_KEY: 'test-alchemy-key',
    VITE_CHAIN_ID: '0x539',
    VITE_API_URL: 'http://localhost:5000',
    VITE_DEVELOPMENT_MODE: 'true'
  }
};