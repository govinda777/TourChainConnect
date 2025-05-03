import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TourToken", function () {
  let tourToken: Contract;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  let addrs: HardhatEthersSigner[];

  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const GOVERNANCE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GOVERNANCE_ROLE"));
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

  beforeEach(async function () {
    // Deploy do contrato antes de cada teste
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const TourToken = await ethers.getContractFactory("TourToken");
    tourToken = await TourToken.deploy();
  });

  describe("Deployment", function () {
    it("Deve definir o nome e símbolo corretos", async function () {
      expect(await tourToken.name()).to.equal("TourChain Token");
      expect(await tourToken.symbol()).to.equal("TOUR");
    });

    it("Deve atribuir o fornecimento inicial ao deployer", async function () {
      const ownerBalance = await tourToken.balanceOf(owner.address);
      expect(await tourToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Deve ter 10 milhões de tokens inicialmente", async function () {
      expect(await tourToken.totalSupply()).to.equal(ethers.parseEther("10000000"));
    });

    it("Deve ter um fornecimento máximo de 100 milhões", async function () {
      expect(await tourToken.maxSupply()).to.equal(ethers.parseEther("100000000"));
    });

    it("Deve atribuir as funções corretas ao deployer", async function () {
      expect(await tourToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await tourToken.hasRole(MINTER_ROLE, owner.address)).to.equal(true);
      expect(await tourToken.hasRole(GOVERNANCE_ROLE, owner.address)).to.equal(true);
    });
  });

  describe("Transações", function () {
    it("Deve permitir transferência entre contas", async function () {
      // Transfere 50 tokens do owner para addr1
      await tourToken.transfer(addr1.address, ethers.parseEther("50"));
      const addr1Balance = await tourToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(ethers.parseEther("50"));

      // Transfere 20 tokens de addr1 para addr2
      await tourToken.connect(addr1).transfer(addr2.address, ethers.parseEther("20"));
      const addr2Balance = await tourToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(ethers.parseEther("20"));
    });

    it("Deve falhar se o remetente não tiver tokens suficientes", async function () {
      const initialOwnerBalance = await tourToken.balanceOf(owner.address);

      // Tenta transferir mais tokens do que tem o addr1
      await expect(
        tourToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWithCustomError(tourToken, "ERC20InsufficientBalance");

      // O saldo do owner não deve ter mudado
      expect(await tourToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Deve atualizar saldos após transferências", async function () {
      const initialOwnerBalance = await tourToken.balanceOf(owner.address);

      // Transfere 100 tokens do owner para addr1
      await tourToken.transfer(addr1.address, ethers.parseEther("100"));

      // Transfere outros 50 tokens do owner para addr2
      await tourToken.transfer(addr2.address, ethers.parseEther("50"));

      // Verifica os saldos finais
      const finalOwnerBalance = await tourToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - ethers.parseEther("150"));

      const addr1Balance = await tourToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(ethers.parseEther("100"));

      const addr2Balance = await tourToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(ethers.parseEther("50"));
    });
  });

  describe("Mint", function () {
    it("Deve permitir que um usuário com MINTER_ROLE crie novos tokens", async function () {
      await tourToken.mint(addr1.address, ethers.parseEther("1000"));
      expect(await tourToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));
    });

    it("Não deve permitir que usuários sem MINTER_ROLE criem novos tokens", async function () {
      await expect(
        tourToken.connect(addr1).mint(addr1.address, ethers.parseEther("1000"))
      ).to.be.reverted;
    });

    it("Deve permitir mint até o limite máximo", async function () {
      const maxSupply = await tourToken.maxSupply();
      const currentSupply = await tourToken.totalSupply();
      const remainingSupply = maxSupply - currentSupply;

      await tourToken.mint(addr1.address, remainingSupply);
      expect(await tourToken.totalSupply()).to.equal(maxSupply);

      // Tentar cunhar mais um token deve falhar
      await expect(
        tourToken.mint(addr1.address, 1)
      ).to.be.revertedWith("TourToken: max supply exceeded");
    });
  });

  describe("Burn", function () {
    it("Deve permitir que os detentores de tokens queimem seus próprios tokens", async function () {
      await tourToken.transfer(addr1.address, ethers.parseEther("1000"));
      
      // addr1 queima 500 tokens
      await tourToken.connect(addr1).burn(ethers.parseEther("500"));
      
      expect(await tourToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("500"));
      
      // Verifica o fornecimento total
      const initialSupply = ethers.parseEther("10000000");
      expect(await tourToken.totalSupply()).to.equal(initialSupply - ethers.parseEther("500"));
    });

    it("Não deve permitir queimar mais tokens do que o detentor possui", async function () {
      await tourToken.transfer(addr1.address, ethers.parseEther("1000"));
      
      await expect(
        tourToken.connect(addr1).burn(ethers.parseEther("1001"))
      ).to.be.revertedWithCustomError(tourToken, "ERC20InsufficientBalance");
    });
  });

  describe("Roles", function () {
    it("Deve permitir que o admin conceda funções", async function () {
      await tourToken.grantRole(MINTER_ROLE, addr1.address);
      expect(await tourToken.hasRole(MINTER_ROLE, addr1.address)).to.equal(true);
      
      // Agora addr1 deve poder cunhar tokens
      await tourToken.connect(addr1).mint(addr2.address, ethers.parseEther("100"));
      expect(await tourToken.balanceOf(addr2.address)).to.equal(ethers.parseEther("100"));
    });

    it("Deve permitir que o admin revogue funções", async function () {
      await tourToken.grantRole(MINTER_ROLE, addr1.address);
      expect(await tourToken.hasRole(MINTER_ROLE, addr1.address)).to.equal(true);
      
      await tourToken.revokeRole(MINTER_ROLE, addr1.address);
      expect(await tourToken.hasRole(MINTER_ROLE, addr1.address)).to.equal(false);
      
      // Agora addr1 não deve poder cunhar tokens
      await expect(
        tourToken.connect(addr1).mint(addr2.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Não deve permitir que não-admins gerenciem funções", async function () {
      await expect(
        tourToken.connect(addr1).grantRole(MINTER_ROLE, addr2.address)
      ).to.be.reverted;
    });
  });
});