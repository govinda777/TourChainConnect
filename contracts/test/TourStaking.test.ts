import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("TourStaking", function () {
  let tourToken: Contract;
  let tourStaking: Contract;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;
  let addrs: HardhatEthersSigner[];

  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
  const REWARDS_DISTRIBUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REWARDS_DISTRIBUTOR_ROLE"));
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

  // Configurações de staking
  const minimumStakingPeriod = 30 * 24 * 60 * 60; // 30 dias em segundos
  const earlyWithdrawalFee = 500; // 5% (base 10000)

  beforeEach(async function () {
    // Deploy dos contratos antes de cada teste
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy do token
    const TourToken = await ethers.getContractFactory("TourToken");
    tourToken = await TourToken.deploy();

    // Deploy do contrato de staking
    const TourStaking = await ethers.getContractFactory("TourStaking");
    tourStaking = await TourStaking.deploy(
      await tourToken.getAddress(),
      minimumStakingPeriod,
      earlyWithdrawalFee
    );

    // Transfere tokens para os testadores
    await tourToken.transfer(addr1.address, ethers.parseEther("10000"));
    await tourToken.transfer(addr2.address, ethers.parseEther("10000"));

    // Aprova o contrato de staking para gastar tokens do owner para recompensas
    await tourToken.approve(await tourStaking.getAddress(), ethers.parseEther("1000000"));
    
    // Aprova o contrato de staking para gastar tokens dos testadores para staking
    await tourToken.connect(addr1).approve(await tourStaking.getAddress(), ethers.parseEther("10000"));
    await tourToken.connect(addr2).approve(await tourStaking.getAddress(), ethers.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("Deve configurar o endereço do token corretamente", async function () {
      expect(await tourStaking.tourToken()).to.equal(await tourToken.getAddress());
    });

    it("Deve configurar o período mínimo de staking corretamente", async function () {
      expect(await tourStaking.minimumStakingPeriod()).to.equal(minimumStakingPeriod);
    });

    it("Deve configurar a taxa de retirada antecipada corretamente", async function () {
      expect(await tourStaking.earlyWithdrawalFee()).to.equal(earlyWithdrawalFee);
    });

    it("Deve atribuir as funções corretas ao deployer", async function () {
      expect(await tourStaking.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await tourStaking.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await tourStaking.hasRole(REWARDS_DISTRIBUTOR_ROLE, owner.address)).to.equal(true);
    });
  });

  describe("Staking", function () {
    it("Deve permitir que os usuários façam stake de tokens", async function () {
      await tourStaking.connect(addr1).stake(ethers.parseEther("1000"));
      expect(await tourStaking.getStakeAmount(addr1.address)).to.equal(ethers.parseEther("1000"));
      expect(await tourStaking.totalStaked()).to.equal(ethers.parseEther("1000"));
    });

    it("Não deve permitir stake de 0 tokens", async function () {
      await expect(
        tourStaking.connect(addr1).stake(0)
      ).to.be.revertedWith("TourStaking: Cannot stake 0");
    });

    it("Deve atualizar corretamente quando há múltiplos stakes", async function () {
      await tourStaking.connect(addr1).stake(ethers.parseEther("1000"));
      await tourStaking.connect(addr2).stake(ethers.parseEther("2000"));
      
      expect(await tourStaking.getStakeAmount(addr1.address)).to.equal(ethers.parseEther("1000"));
      expect(await tourStaking.getStakeAmount(addr2.address)).to.equal(ethers.parseEther("2000"));
      expect(await tourStaking.totalStaked()).to.equal(ethers.parseEther("3000"));
      
      // Adiciona mais stake ao addr1
      await tourStaking.connect(addr1).stake(ethers.parseEther("500"));
      expect(await tourStaking.getStakeAmount(addr1.address)).to.equal(ethers.parseEther("1500"));
      expect(await tourStaking.totalStaked()).to.equal(ethers.parseEther("3500"));
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      // Faz stake para os testes de retirada
      await tourStaking.connect(addr1).stake(ethers.parseEther("1000"));
    });

    it("Deve permitir a retirada após o período mínimo", async function () {
      // Avança o tempo para além do período mínimo de staking
      await time.increase(minimumStakingPeriod + 1);
      
      await tourStaking.connect(addr1).withdraw(ethers.parseEther("500"));
      
      expect(await tourStaking.getStakeAmount(addr1.address)).to.equal(ethers.parseEther("500"));
      expect(await tourStaking.totalStaked()).to.equal(ethers.parseEther("500"));
      expect(await tourToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("9500"));
    });

    it("Deve aplicar taxa em retiradas antecipadas", async function () {
      // Tentar sacar antes do período mínimo (taxa de 5% aplicável)
      await tourStaking.connect(addr1).withdraw(ethers.parseEther("100"));
      
      // Calcula a taxa (5% de 100)
      const fee = ethers.parseEther("100") * BigInt(earlyWithdrawalFee) / 10000n;
      
      // Verifica o stake restante
      expect(await tourStaking.getStakeAmount(addr1.address)).to.equal(ethers.parseEther("900"));
      
      // Verifica o saldo (deve ter recebido 100 - fee)
      expect(await tourToken.balanceOf(addr1.address)).to.equal(
        ethers.parseEther("9000") + (ethers.parseEther("100") - fee)
      );
    });

    it("Não deve permitir retirada de 0 tokens", async function () {
      await expect(
        tourStaking.connect(addr1).withdraw(0)
      ).to.be.revertedWith("TourStaking: Cannot withdraw 0");
    });

    it("Não deve permitir retirada de mais tokens do que o usuário tem em stake", async function () {
      await expect(
        tourStaking.connect(addr1).withdraw(ethers.parseEther("1001"))
      ).to.be.revertedWith("TourStaking: Not enough staked");
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      // Configura staking para os testes de recompensa
      await tourStaking.connect(addr1).stake(ethers.parseEther("1000"));
      await tourStaking.connect(addr2).stake(ethers.parseEther("2000"));
      
      // Adiciona recompensas (1000 tokens por 30 dias)
      const rewardAmount = ethers.parseEther("1000");
      const duration = 30 * 24 * 60 * 60; // 30 dias em segundos
      await tourStaking.addReward(rewardAmount, duration);
    });

    it("Deve calcular recompensas corretamente após o tempo passar", async function () {
      // Avança o tempo em 15 dias
      const fifteenDays = 15 * 24 * 60 * 60;
      await time.increase(fifteenDays);
      
      // Verifica se as recompensas foram acumuladas proporcionalmente
      const addr1Earned = await tourStaking.earned(addr1.address);
      const addr2Earned = await tourStaking.earned(addr2.address);
      
      // addr1 tem 1/3 do total em stake, então deve receber aproximadamente 1/3 das recompensas
      // addr2 tem 2/3 do total em stake, então deve receber aproximadamente 2/3 das recompensas
      
      // Verifica que as recompensas estão sendo acumuladas (sem valores específicos devido à variação de tempo)
      expect(addr1Earned).to.be.gt(0);
      expect(addr2Earned).to.be.gt(0);
      
      // addr2 deve receber aproximadamente o dobro de addr1
      const ratio = Number(addr2Earned) / Number(addr1Earned);
      expect(ratio).to.be.closeTo(2, 0.1); // O resultado deve estar próximo de 2, com tolerância de 0.1
    });

    it("Deve permitir reivindicar recompensas", async function () {
      // Avança o tempo em 15 dias
      const fifteenDays = 15 * 24 * 60 * 60;
      await time.increase(fifteenDays);
      
      // Verifica recompensas antes de reivindicar
      const earnedBefore = await tourStaking.earned(addr1.address);
      expect(earnedBefore).to.be.gt(0);
      
      // Reivindica recompensas
      await tourStaking.connect(addr1).claimReward();
      
      // Verifica que as recompensas foram transferidas
      const balanceAfter = await tourToken.balanceOf(addr1.address);
      expect(balanceAfter).to.be.closeTo(
        ethers.parseEther("9000") + earnedBefore,
        ethers.parseEther("0.1") // Tolerância para pequenas variações de cálculo
      );
      
      // Verifica que as recompensas foram zeradas
      const earnedAfter = await tourStaking.earned(addr1.address);
      expect(earnedAfter).to.be.lt(earnedBefore);
    });

    it("Deve permitir adicionar mais recompensas", async function () {
      // Avança o tempo em 15 dias (metade do período)
      const fifteenDays = 15 * 24 * 60 * 60;
      await time.increase(fifteenDays);
      
      // Verifica recompensas antes
      const earnedBefore = await tourStaking.earned(addr1.address);
      
      // Adiciona mais recompensas
      const additionalRewards = ethers.parseEther("500");
      const additionalDuration = 15 * 24 * 60 * 60; // mais 15 dias
      await tourStaking.addReward(additionalRewards, additionalDuration);
      
      // Avança mais tempo
      await time.increase(7 * 24 * 60 * 60); // 7 dias
      
      // Verifica recompensas depois
      const earnedAfter = await tourStaking.earned(addr1.address);
      expect(earnedAfter).to.be.gt(earnedBefore);
    });
  });

  describe("Admin Functions", function () {
    it("Deve permitir que o admin atualize os parâmetros", async function () {
      const newMinimumStakingPeriod = 15 * 24 * 60 * 60; // 15 dias
      const newEarlyWithdrawalFee = 300; // 3%
      
      await tourStaking.updateParameters(
        newMinimumStakingPeriod,
        newEarlyWithdrawalFee
      );
      
      expect(await tourStaking.minimumStakingPeriod()).to.equal(newMinimumStakingPeriod);
      expect(await tourStaking.earlyWithdrawalFee()).to.equal(newEarlyWithdrawalFee);
    });

    it("Não deve permitir que não-admins atualizem os parâmetros", async function () {
      await expect(
        tourStaking.connect(addr1).updateParameters(0, 0)
      ).to.be.reverted;
    });

    it("Deve limitar a taxa de retirada antecipada a 10%", async function () {
      await expect(
        tourStaking.updateParameters(minimumStakingPeriod, 1001) // Acima de 10%
      ).to.be.revertedWith("TourStaking: fee too high");
    });
  });

  describe("Edge Cases", function () {
    it("Deve lidar corretamente com várias operações em sequência", async function () {
      // addr1 faz stake
      await tourStaking.connect(addr1).stake(ethers.parseEther("1000"));
      
      // Adiciona recompensas
      await tourStaking.addReward(ethers.parseEther("500"), 30 * 24 * 60 * 60);
      
      // Avança o tempo
      await time.increase(10 * 24 * 60 * 60);
      
      // addr1 faz mais stake
      await tourStaking.connect(addr1).stake(ethers.parseEther("500"));
      
      // addr2 faz stake
      await tourStaking.connect(addr2).stake(ethers.parseEther("2000"));
      
      // Avança mais tempo
      await time.increase(25 * 24 * 60 * 60);
      
      // addr1 retira parte do stake
      await tourStaking.connect(addr1).withdraw(ethers.parseEther("300"));
      
      // addr1 reivindica recompensas
      await tourStaking.connect(addr1).claimReward();
      
      // Verifica que tudo funcionou
      expect(await tourStaking.getStakeAmount(addr1.address)).to.equal(ethers.parseEther("1200"));
      expect(await tourStaking.getStakeAmount(addr2.address)).to.equal(ethers.parseEther("2000"));
      expect(await tourStaking.totalStaked()).to.equal(ethers.parseEther("3200"));
    });
    
    it("Deve manter corretamente a contabilidade ao retirar todo o stake", async function () {
      // addr1 faz stake
      await tourStaking.connect(addr1).stake(ethers.parseEther("1000"));
      
      // Avança o tempo além do período mínimo
      await time.increase(minimumStakingPeriod + 1);
      
      // Retira todo o stake
      await tourStaking.connect(addr1).withdraw(ethers.parseEther("1000"));
      
      expect(await tourStaking.getStakeAmount(addr1.address)).to.equal(0);
      expect(await tourStaking.totalStaked()).to.equal(0);
    });
  });
});