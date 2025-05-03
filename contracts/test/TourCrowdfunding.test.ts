import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("TourCrowdfunding", function () {
  let tourToken: Contract;
  let tourCrowdfunding: Contract;
  let owner: HardhatEthersSigner;
  let creator: HardhatEthersSigner;
  let backer1: HardhatEthersSigner;
  let backer2: HardhatEthersSigner;
  let feeCollector: HardhatEthersSigner;
  let addrs: HardhatEthersSigner[];

  const PROJECT_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROJECT_ADMIN_ROLE"));
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

  // Configurações do crowdfunding
  const platformFeePercent = 250; // 2.5% (base 10000)

  beforeEach(async function () {
    // Deploy dos contratos antes de cada teste
    [owner, creator, backer1, backer2, feeCollector, ...addrs] = await ethers.getSigners();

    // Deploy do token
    const TourToken = await ethers.getContractFactory("TourToken");
    tourToken = await TourToken.deploy();

    // Deploy do contrato de crowdfunding
    const TourCrowdfunding = await ethers.getContractFactory("TourCrowdfunding");
    tourCrowdfunding = await TourCrowdfunding.deploy(
      await tourToken.getAddress(),
      platformFeePercent,
      feeCollector.address
    );

    // Transfere tokens para os testadores
    await tourToken.transfer(creator.address, ethers.parseEther("10000"));
    await tourToken.transfer(backer1.address, ethers.parseEther("10000"));
    await tourToken.transfer(backer2.address, ethers.parseEther("10000"));

    // Aprova o contrato de crowdfunding para gastar tokens dos testadores
    await tourToken.connect(creator).approve(await tourCrowdfunding.getAddress(), ethers.parseEther("10000"));
    await tourToken.connect(backer1).approve(await tourCrowdfunding.getAddress(), ethers.parseEther("10000"));
    await tourToken.connect(backer2).approve(await tourCrowdfunding.getAddress(), ethers.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("Deve configurar o endereço do token corretamente", async function () {
      expect(await tourCrowdfunding.paymentToken()).to.equal(await tourToken.getAddress());
    });

    it("Deve configurar a taxa da plataforma corretamente", async function () {
      expect(await tourCrowdfunding.platformFeePercent()).to.equal(platformFeePercent);
    });

    it("Deve configurar o endereço do coletor de taxas corretamente", async function () {
      expect(await tourCrowdfunding.feeCollector()).to.equal(feeCollector.address);
    });

    it("Deve atribuir as funções corretas ao deployer", async function () {
      expect(await tourCrowdfunding.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await tourCrowdfunding.hasRole(PROJECT_ADMIN_ROLE, owner.address)).to.equal(true);
    });
  });

  describe("Campaign Creation", function () {
    it("Deve permitir a criação de uma campanha", async function () {
      const result = await tourCrowdfunding.connect(creator).createCampaign(
        "Test Campaign",
        "A test campaign description",
        ethers.parseEther("5000"),
        30 // 30 dias
      );

      // Verifica o evento emitido
      const receipt = await result.wait();
      const event = receipt?.logs.find((e: any) => e.fragment?.name === "CampaignCreated");
      expect(event).to.not.be.undefined;

      // Pega o ID da campanha do evento
      const campaignId = 1; // Primeira campanha deve ter ID 1

      // Verifica os detalhes da campanha
      const campaign = await tourCrowdfunding.campaigns(campaignId);
      expect(campaign.title).to.equal("Test Campaign");
      expect(campaign.description).to.equal("A test campaign description");
      expect(campaign.creator).to.equal(creator.address);
      expect(campaign.fundingGoal).to.equal(ethers.parseEther("5000"));
      expect(campaign.status).to.equal(0); // ACTIVE
    });

    it("Não deve permitir meta de financiamento zero", async function () {
      await expect(
        tourCrowdfunding.connect(creator).createCampaign(
          "Invalid Campaign",
          "Description",
          0,
          30
        )
      ).to.be.revertedWith("TourCrowdfunding: goal must be > 0");
    });

    it("Não deve permitir duração inválida", async function () {
      await expect(
        tourCrowdfunding.connect(creator).createCampaign(
          "Invalid Campaign",
          "Description",
          ethers.parseEther("1000"),
          0
        )
      ).to.be.revertedWith("TourCrowdfunding: invalid duration");

      await expect(
        tourCrowdfunding.connect(creator).createCampaign(
          "Invalid Campaign",
          "Description",
          ethers.parseEther("1000"),
          91 // Mais de 90 dias
        )
      ).to.be.revertedWith("TourCrowdfunding: invalid duration");
    });
  });

  describe("Reward Tiers", function () {
    let campaignId: number;

    beforeEach(async function () {
      // Cria uma campanha para testar as recompensas
      await tourCrowdfunding.connect(creator).createCampaign(
        "Reward Test Campaign",
        "Testing reward tiers",
        ethers.parseEther("5000"),
        30
      );
      campaignId = 1; // Primeira campanha
    });

    it("Deve permitir adicionar níveis de recompensa", async function () {
      const result = await tourCrowdfunding.connect(creator).addRewardTier(
        campaignId,
        "Basic Reward",
        ethers.parseEther("50"),
        10, // 10 tokens TOUR como recompensa
        "Basic supporter package",
        100, // Limite de 100 reclamantes
        0 // FIXED
      );

      // Verifica o evento emitido
      const receipt = await result.wait();
      const event = receipt?.logs.find((e: any) => e.fragment?.name === "RewardTierAdded");
      expect(event).to.not.be.undefined;

      // Pega o ID da recompensa do evento
      const rewardId = 1; // Primeira recompensa deve ter ID 1

      // Verifica os detalhes da recompensa
      const reward = await tourCrowdfunding.campaignRewardTiers(campaignId, rewardId);
      expect(reward.title).to.equal("Basic Reward");
      expect(reward.minimumAmount).to.equal(ethers.parseEther("50"));
      expect(reward.tokenAmount).to.equal(10);
      expect(reward.description).to.equal("Basic supporter package");
      expect(reward.limit).to.equal(100);
      expect(reward.claimed).to.equal(0);
      expect(reward.tierType).to.equal(0); // FIXED
    });

    it("Permite que o admin do projeto adicione recompensas", async function () {
      // Concede função de admin do projeto para addr1
      await tourCrowdfunding.grantRole(PROJECT_ADMIN_ROLE, backer1.address);

      // addr1 agora deve poder adicionar recompensas mesmo sem ser o criador
      await tourCrowdfunding.connect(backer1).addRewardTier(
        campaignId,
        "Admin Added Reward",
        ethers.parseEther("100"),
        20,
        "Reward added by admin",
        50,
        1 // DYNAMIC
      );

      // Verifica se a recompensa foi adicionada
      const rewardId = 1; // Primeira recompensa
      const reward = await tourCrowdfunding.campaignRewardTiers(campaignId, rewardId);
      expect(reward.title).to.equal("Admin Added Reward");
      expect(reward.tierType).to.equal(1); // DYNAMIC
    });

    it("Não deve permitir que pessoas não autorizadas adicionem recompensas", async function () {
      await expect(
        tourCrowdfunding.connect(backer1).addRewardTier(
          campaignId,
          "Unauthorized Reward",
          ethers.parseEther("50"),
          10,
          "Description",
          100,
          0
        )
      ).to.be.revertedWith("TourCrowdfunding: not authorized");
    });

    it("Não deve permitir valores mínimos de recompensa inválidos", async function () {
      await expect(
        tourCrowdfunding.connect(creator).addRewardTier(
          campaignId,
          "Invalid Reward",
          0, // Valor mínimo inválido
          10,
          "Description",
          100,
          0
        )
      ).to.be.revertedWith("TourCrowdfunding: minimum amount must be > 0");
    });
  });

  describe("Pledges", function () {
    let campaignId: number;
    let rewardId: number;

    beforeEach(async function () {
      // Cria uma campanha com um nível de recompensa
      await tourCrowdfunding.connect(creator).createCampaign(
        "Pledge Test Campaign",
        "Testing pledges",
        ethers.parseEther("5000"),
        30
      );
      campaignId = 1;

      // Adiciona um nível de recompensa
      await tourCrowdfunding.connect(creator).addRewardTier(
        campaignId,
        "Standard Reward",
        ethers.parseEther("100"),
        20,
        "Standard package",
        50,
        0
      );
      rewardId = 1;
    });

    it("Deve permitir fazer um pledge com recompensa", async function () {
      const result = await tourCrowdfunding.connect(backer1).pledge(
        campaignId,
        ethers.parseEther("100"),
        rewardId,
        "John Doe",
        "john@example.com",
        "Great project!",
        false
      );

      // Verifica o evento emitido
      const receipt = await result.wait();
      const event = receipt?.logs.find((e: any) => e.fragment?.name === "PledgeCreated");
      expect(event).to.not.be.undefined;

      // Pega o ID do pledge do evento
      const pledgeId = 1; // Primeiro pledge deve ter ID 1

      // Verifica os detalhes do pledge
      const pledge = await tourCrowdfunding.pledges(pledgeId);
      expect(pledge.backer).to.equal(backer1.address);
      expect(pledge.name).to.equal("John Doe");
      expect(pledge.email).to.equal("john@example.com");
      expect(pledge.amount).to.equal(ethers.parseEther("100"));
      expect(pledge.rewardTierId).to.equal(rewardId);
      expect(pledge.comment).to.equal("Great project!");
      expect(pledge.isAnonymous).to.equal(false);
      expect(pledge.status).to.equal(0); // PENDING

      // Verifica que a recompensa foi marcada como reclamada
      const reward = await tourCrowdfunding.campaignRewardTiers(campaignId, rewardId);
      expect(reward.claimed).to.equal(1);

      // Verifica que os tokens foram transferidos
      expect(await tourToken.balanceOf(backer1.address)).to.equal(ethers.parseEther("9900"));
      expect(await tourToken.balanceOf(await tourCrowdfunding.getAddress())).to.equal(ethers.parseEther("100"));

      // Verifica que a campanha foi atualizada
      const campaign = await tourCrowdfunding.campaigns(campaignId);
      expect(campaign.totalFunds).to.equal(ethers.parseEther("100"));
      expect(campaign.numberOfBackers).to.equal(1);
    });

    it("Deve permitir fazer um pledge sem recompensa", async function () {
      await tourCrowdfunding.connect(backer1).pledge(
        campaignId,
        ethers.parseEther("50"),
        0, // Sem recompensa
        "Anonymous",
        "anon@example.com",
        "Supporting!",
        true // Anônimo
      );

      const pledgeId = 1;
      const pledge = await tourCrowdfunding.pledges(pledgeId);
      expect(pledge.amount).to.equal(ethers.parseEther("50"));
      expect(pledge.rewardTierId).to.equal(0);
      expect(pledge.isAnonymous).to.equal(true);
    });

    it("Não deve permitir pledge para campanha inexistente", async function () {
      await expect(
        tourCrowdfunding.connect(backer1).pledge(
          999, // ID inexistente
          ethers.parseEther("100"),
          0,
          "Test",
          "test@example.com",
          "",
          false
        )
      ).to.be.revertedWith("TourCrowdfunding: campaign not found");
    });

    it("Não deve permitir pledge com quantidade abaixo do mínimo da recompensa", async function () {
      await expect(
        tourCrowdfunding.connect(backer1).pledge(
          campaignId,
          ethers.parseEther("50"), // Abaixo do mínimo (100)
          rewardId,
          "Test",
          "test@example.com",
          "",
          false
        )
      ).to.be.revertedWith("TourCrowdfunding: amount below minimum");
    });

    it("Não deve permitir exceder o limite de recompensas", async function () {
      // Adiciona um nível de recompensa com limite baixo
      await tourCrowdfunding.connect(creator).addRewardTier(
        campaignId,
        "Limited Reward",
        ethers.parseEther("100"),
        20,
        "Very limited package",
        1, // Limite de apenas 1
        0
      );
      const limitedRewardId = 2;

      // Primeiro pledge (deve funcionar)
      await tourCrowdfunding.connect(backer1).pledge(
        campaignId,
        ethers.parseEther("100"),
        limitedRewardId,
        "First",
        "first@example.com",
        "",
        false
      );

      // Segundo pledge (deve falhar por exceder o limite)
      await expect(
        tourCrowdfunding.connect(backer2).pledge(
          campaignId,
          ethers.parseEther("100"),
          limitedRewardId,
          "Second",
          "second@example.com",
          "",
          false
        )
      ).to.be.revertedWith("TourCrowdfunding: reward limit reached");
    });

    it("Deve atualizar o status da campanha quando atingir a meta", async function () {
      // A meta é 5000 tokens
      
      // Primeiro pledge
      await tourCrowdfunding.connect(backer1).pledge(
        campaignId,
        ethers.parseEther("2000"),
        0,
        "First",
        "first@example.com",
        "",
        false
      );
      
      // Verifica o status (ainda ACTIVE)
      let campaign = await tourCrowdfunding.campaigns(campaignId);
      expect(campaign.status).to.equal(0); // ACTIVE
      
      // Segundo pledge (que atinge a meta)
      await tourCrowdfunding.connect(backer2).pledge(
        campaignId,
        ethers.parseEther("3000"),
        0,
        "Second",
        "second@example.com",
        "",
        false
      );
      
      // Verifica o status (agora deve ser SUCCESSFUL)
      campaign = await tourCrowdfunding.campaigns(campaignId);
      expect(campaign.status).to.equal(1); // SUCCESSFUL
    });
  });

  describe("Campaign Management", function () {
    let campaignId: number;

    beforeEach(async function () {
      // Cria uma campanha para testes
      await tourCrowdfunding.connect(creator).createCampaign(
        "Management Test Campaign",
        "Testing campaign management",
        ethers.parseEther("5000"),
        30
      );
      campaignId = 1;

      // Faz alguns pledges
      await tourCrowdfunding.connect(backer1).pledge(
        campaignId,
        ethers.parseEther("1000"),
        0,
        "Backer 1",
        "backer1@example.com",
        "",
        false
      );
    });

    it("Deve permitir que o criador cancele uma campanha ativa", async function () {
      await tourCrowdfunding.connect(creator).cancelCampaign(campaignId);
      
      const campaign = await tourCrowdfunding.campaigns(campaignId);
      expect(campaign.status).to.equal(3); // CANCELED
    });

    it("Deve permitir que o admin cancele uma campanha", async function () {
      await tourCrowdfunding.connect(owner).cancelCampaign(campaignId);
      
      const campaign = await tourCrowdfunding.campaigns(campaignId);
      expect(campaign.status).to.equal(3); // CANCELED
    });

    it("Não deve permitir que pessoas não autorizadas cancelem campanhas", async function () {
      await expect(
        tourCrowdfunding.connect(backer1).cancelCampaign(campaignId)
      ).to.be.revertedWith("TourCrowdfunding: not authorized");
    });

    it("Deve permitir que o admin atualize o status de um pledge", async function () {
      const pledgeId = 1;
      
      await tourCrowdfunding.connect(owner).updatePledgeStatus(pledgeId, 1); // COMPLETED
      
      const pledge = await tourCrowdfunding.pledges(pledgeId);
      expect(pledge.status).to.equal(1); // COMPLETED
    });

    it("Não deve permitir que não-admins atualizem o status de um pledge", async function () {
      const pledgeId = 1;
      
      await expect(
        tourCrowdfunding.connect(creator).updatePledgeStatus(pledgeId, 1)
      ).to.be.reverted;
    });
  });

  describe("Fund Claiming and Refunds", function () {
    let campaignId: number;
    
    beforeEach(async function () {
      // Cria uma campanha para testes
      await tourCrowdfunding.connect(creator).createCampaign(
        "Fund Test Campaign",
        "Testing fund claiming and refunds",
        ethers.parseEther("2000"),
        30
      );
      campaignId = 1;
    });
    
    it("Deve permitir que o criador reivindique fundos após uma campanha bem-sucedida", async function () {
      // Faz pledges suficientes para atingir a meta
      await tourCrowdfunding.connect(backer1).pledge(
        campaignId,
        ethers.parseEther("1000"),
        0,
        "Backer 1",
        "backer1@example.com",
        "",
        false
      );
      
      await tourCrowdfunding.connect(backer2).pledge(
        campaignId,
        ethers.parseEther("1000"),
        0,
        "Backer 2",
        "backer2@example.com",
        "",
        false
      );
      
      // Verifica o status (deve ser SUCCESSFUL)
      const campaign = await tourCrowdfunding.campaigns(campaignId);
      expect(campaign.status).to.equal(1); // SUCCESSFUL
      
      // Verifica o saldo inicial do criador
      const initialCreatorBalance = await tourToken.balanceOf(creator.address);
      
      // Reivindica os fundos
      await tourCrowdfunding.connect(creator).claimFunds(campaignId);
      
      // Verifica que os fundos foram transferidos (menos a taxa da plataforma)
      const totalFunds = ethers.parseEther("2000");
      const platformFee = (totalFunds * BigInt(platformFeePercent)) / 10000n;
      const expectedTransfer = totalFunds - platformFee;
      
      const finalCreatorBalance = await tourToken.balanceOf(creator.address);
      expect(finalCreatorBalance).to.equal(initialCreatorBalance + expectedTransfer);
      
      // Verifica que a taxa foi transferida para o coletor de taxas
      const feeCollectorBalance = await tourToken.balanceOf(feeCollector.address);
      expect(feeCollectorBalance).to.equal(platformFee);
      
      // Verifica que a campanha foi marcada como reivindicada
      const updatedCampaign = await tourCrowdfunding.campaigns(campaignId);
      expect(updatedCampaign.claimedByCreator).to.equal(true);
    });
    
    it("Não deve permitir reivindicar fundos de campanhas não bem-sucedidas", async function () {
      // Faz um pledge que não atinge a meta
      await tourCrowdfunding.connect(backer1).pledge(
        campaignId,
        ethers.parseEther("500"),
        0,
        "Backer 1",
        "backer1@example.com",
        "",
        false
      );
      
      // Verifica o status (deve ser ACTIVE)
      const campaign = await tourCrowdfunding.campaigns(campaignId);
      expect(campaign.status).to.equal(0); // ACTIVE
      
      // Tenta reivindicar os fundos (deve falhar)
      await expect(
        tourCrowdfunding.connect(creator).claimFunds(campaignId)
      ).to.be.revertedWith("TourCrowdfunding: campaign not successful");
    });
    
    it("Deve permitir que os apoiadores solicitem reembolso de campanhas canceladas", async function () {
      // Faz um pledge
      await tourCrowdfunding.connect(backer1).pledge(
        campaignId,
        ethers.parseEther("500"),
        0,
        "Backer 1",
        "backer1@example.com",
        "",
        false
      );
      
      const pledgeId = 1;
      
      // O criador cancela a campanha
      await tourCrowdfunding.connect(creator).cancelCampaign(campaignId);
      
      // Verifica o saldo inicial do apoiador
      const initialBackerBalance = await tourToken.balanceOf(backer1.address);
      
      // Solicita o reembolso
      await tourCrowdfunding.connect(backer1).requestRefund(pledgeId);
      
      // Verifica que os fundos foram reembolsados
      const finalBackerBalance = await tourToken.balanceOf(backer1.address);
      expect(finalBackerBalance).to.equal(initialBackerBalance + ethers.parseEther("500"));
      
      // Verifica que o pledge foi marcado como cancelado
      const pledge = await tourCrowdfunding.pledges(pledgeId);
      expect(pledge.status).to.equal(2); // CANCELLED
    });
    
    it("Não deve permitir reembolso de campanhas bem-sucedidas", async function () {
      // Faz pledges suficientes para atingir a meta
      await tourCrowdfunding.connect(backer1).pledge(
        campaignId,
        ethers.parseEther("1000"),
        0,
        "Backer 1",
        "backer1@example.com",
        "",
        false
      );
      
      await tourCrowdfunding.connect(backer2).pledge(
        campaignId,
        ethers.parseEther("1000"),
        0,
        "Backer 2",
        "backer2@example.com",
        "",
        false
      );
      
      const pledgeId = 1;
      
      // Tenta solicitar reembolso (deve falhar)
      await expect(
        tourCrowdfunding.connect(backer1).requestRefund(pledgeId)
      ).to.be.revertedWith("TourCrowdfunding: campaign must be failed or canceled for refund");
    });
  });

  describe("Admin Settings", function () {
    it("Deve permitir que o admin atualize a taxa da plataforma", async function () {
      const newFeePercent = 300; // 3%
      
      await tourCrowdfunding.connect(owner).updatePlatformFee(newFeePercent);
      
      expect(await tourCrowdfunding.platformFeePercent()).to.equal(newFeePercent);
    });
    
    it("Não deve permitir taxa da plataforma acima de 20%", async function () {
      await expect(
        tourCrowdfunding.connect(owner).updatePlatformFee(2001) // 20.01%
      ).to.be.revertedWith("TourCrowdfunding: fee too high");
    });
    
    it("Deve permitir que o admin atualize o endereço do coletor de taxas", async function () {
      const newFeeCollector = addrs[0].address;
      
      await tourCrowdfunding.connect(owner).updateFeeCollector(newFeeCollector);
      
      expect(await tourCrowdfunding.feeCollector()).to.equal(newFeeCollector);
    });
    
    it("Não deve permitir que não-admins atualizem configurações", async function () {
      await expect(
        tourCrowdfunding.connect(creator).updatePlatformFee(300)
      ).to.be.reverted;
      
      await expect(
        tourCrowdfunding.connect(backer1).updateFeeCollector(backer1.address)
      ).to.be.reverted;
    });
  });

  describe("Query Functions", function () {
    let campaignId: number;
    
    beforeEach(async function () {
      // Cria uma campanha e recompensas para testes
      await tourCrowdfunding.connect(creator).createCampaign(
        "Query Test Campaign",
        "Testing query functions",
        ethers.parseEther("2000"),
        30
      );
      campaignId = 1;
      
      // Adiciona recompensas
      await tourCrowdfunding.connect(creator).addRewardTier(
        campaignId,
        "Reward 1",
        ethers.parseEther("50"),
        10,
        "Description 1",
        100,
        0
      );
      
      await tourCrowdfunding.connect(creator).addRewardTier(
        campaignId,
        "Reward 2",
        ethers.parseEther("100"),
        20,
        "Description 2",
        50,
        0
      );
      
      // Faz pledges
      await tourCrowdfunding.connect(backer1).pledge(
        campaignId,
        ethers.parseEther("50"),
        1, // Reward 1
        "Backer 1",
        "backer1@example.com",
        "",
        false
      );
      
      await tourCrowdfunding.connect(backer2).pledge(
        campaignId,
        ethers.parseEther("100"),
        2, // Reward 2
        "Backer 2",
        "backer2@example.com",
        "",
        false
      );
    });
    
    it("Deve retornar as recompensas de uma campanha", async function () {
      const rewardTiers = await tourCrowdfunding.getCampaignRewardTiers(campaignId);
      expect(rewardTiers.length).to.equal(2);
      expect(rewardTiers[0]).to.equal(1);
      expect(rewardTiers[1]).to.equal(2);
    });
    
    it("Deve retornar os pledges de uma campanha", async function () {
      const pledges = await tourCrowdfunding.getCampaignPledges(campaignId);
      expect(pledges.length).to.equal(2);
      expect(pledges[0]).to.equal(1);
      expect(pledges[1]).to.equal(2);
    });
    
    it("Deve retornar os pledges de um apoiador", async function () {
      const backer1Pledges = await tourCrowdfunding.getBackerPledges(backer1.address);
      expect(backer1Pledges.length).to.equal(1);
      expect(backer1Pledges[0]).to.equal(1);
      
      const backer2Pledges = await tourCrowdfunding.getBackerPledges(backer2.address);
      expect(backer2Pledges.length).to.equal(1);
      expect(backer2Pledges[0]).to.equal(2);
    });
  });
});