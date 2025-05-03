
import { ethers } from 'ethers';

export class BlockchainMock {
  private provider: ethers.JsonRpcProvider;
  private accounts: string[];

  constructor() {
    this.provider = new ethers.JsonRpcProvider('http://0.0.0.0:8545');
    this.accounts = [];
  }

  async setup() {
    this.accounts = await this.provider.listAccounts();
    return this.accounts[0];
  }

  async getBalance(address: string) {
    return await this.provider.getBalance(address);
  }

  async mockContractCall(contractAddress: string, method: string, returnValue: any) {
    // Implementar mock de chamadas de contrato
    cy.window().then((win) => {
      win.ethereum = {
        ...win.ethereum,
        mockContractCall: { [contractAddress]: { [method]: returnValue } }
      };
    });
  }
}

export const blockchainMock = new BlockchainMock();
