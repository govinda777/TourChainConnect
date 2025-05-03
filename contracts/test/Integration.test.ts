import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("TourChain Integration", function () {
  // Contratos
  let tourToken: Contract;
  let tourStaking: Contract;
  let tourCrowdfunding: Contract;
  let tourOracle: Contract;
  let carbonOffset: Contract;
  
  // Signers (contas)
  let owner: HardhatEthersSigner;
  let oracle: HardhatEthersSigner;
  let company: HardhatEthersSigner;
  let traveler: HardhatEthersSigner;
  let projectCreator: HardhatEthersSigner;
  let backer1: HardhatEthersSigner;
  let backer2: HardhatEthersSigner;
  let addrs: HardhatEthersSigner[];
  
  // Constantes
  const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const PROJECT_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROJECT_ADMIN_ROLE"));
  
  // Configurações
  const minimumStakingPeriod = 30 * 24 * 60 * 60; // 30 dias em segundos
  const earlyWithdrawalFee = 500; // 5% (base 10000)
  const platformFeePercent = 250; // 2.5% (base 10000)
  const minimumStake = ethers.parseEther("0.1"); // 0.1 ETH
  const carbonOffsetFee = 300; // 3% (base 10000)
  
  before(async function () {
    // Configura as contas
    [owner, oracle, company, traveler, projectCreator, backer1, backer2, ...addrs] = await ethers.getSigners();
    
    // Deploy dos contratos
    console.log("Deploying contracts for integration test...");
    
    // 1. Deploy do token
    const TourToken = await ethers.getContractFactory("TourToken");
    tourToken = await TourToken.deploy();
    console.log("TourToken deployed");
    
    // 2. Deploy do contrato de staking
    const TourStaking = await ethers.getContractFactory("TourStaking");
    tourStaking = await TourStaking.deploy(
      await tourToken.getAddress(),
      minimumStakingPeriod,
      earlyWithdrawalFee
    );
    console.log("TourStaking deployed");
    
    // 3. Deploy do contrato de crowdfunding
    const TourCrowdfunding = await ethers.getContractFactory("TourCrowdfunding");
    tourCrowdfunding = await TourCrowdfunding.deploy(
      await tourToken.getAddress(),
      platformFeePercent,
      owner.address // Fee collector
    );
    console.log("TourCrowdfunding deployed");
    
    // 4. Deploy do contrato de oracle
    const TourOracle = await ethers.getContractFactory("TourOracle");
    tourOracle = await TourOracle.deploy(minimumStake);
    console.log("TourOracle deployed");
    
    // 5. Deploy do contrato de offset de carbono
    const CarbonOffset = await ethers.getContractFactory("CarbonOffset");
    carbonOffset = await CarbonOffset.deploy(
      await tourToken.getAddress(),
      owner.address, // Admin de offset
      carbonOffsetFee
    );
    console.log("CarbonOffset deployed");
    
    // Configuração inicial
    
    // Adiciona oracle como provedor de dados
    await tourOracle.grantRole(ORACLE_ROLE, oracle.address);
    
    // Concede papel de administrador de projeto
    await tourCrowdfunding.grantRole(PROJECT_ADMIN_ROLE, owner.address);
    
    // Distribui tokens para testes
    await tourToken.transfer(company.address, ethers.parseEther("100000"));
    await tourToken.transfer(traveler.address, ethers.parseEther("5000"));
    await tourToken.transfer(projectCreator.address, ethers.parseEther("10000"));
    await tourToken.transfer(backer1.address, ethers.parseEther("5000"));
    await tourToken.transfer(backer2.address, ethers.parseEther("5000"));
    
    // Aprova contratos para gastar tokens
    await tourToken.connect(company).approve(await tourStaking.getAddress(), ethers.parseEther("50000"));
    await tourToken.connect(traveler).approve(await tourStaking.getAddress(), ethers.parseEther("1000"));
    await tourToken.connect(company).approve(await carbonOffset.getAddress(), ethers.parseEther("10000"));
    await tourToken.connect(backer1).approve(await tourCrowdfunding.getAddress(), ethers.parseEther("5000"));
    await tourToken.connect(backer2).approve(await tourCrowdfunding.getAddress(), ethers.parseEther("5000"));
    
    console.log("Initial setup completed");
  });
  
  describe("1. Token e Staking", function () {
    it("Permite que a empresa faça stake de tokens", async function () {
      await tourStaking.connect(company).stake(ethers.parseEther("50000"));
      
      expect(await tourStaking.getStakeAmount(company.address)).to.equal(ethers.parseEther("50000"));
      expect(await tourStaking.totalStaked()).to.equal(ethers.parseEther("50000"));
    });
    
    it("Permite que o viajante faça stake de tokens", async function () {
      await tourStaking.connect(traveler).stake(ethers.parseEther("1000"));
      
      expect(await tourStaking.getStakeAmount(traveler.address)).to.equal(ethers.parseEther("1000"));
      expect(await tourStaking.totalStaked()).to.equal(ethers.parseEther("51000"));
    });
    
    it("Administrador pode adicionar recompensas ao pool de staking", async function () {
      const rewardAmount = ethers.parseEther("5000");
      const duration = 60 * 24 * 60 * 60; // 60 dias
      
      // Mint de tokens extras para recompensas
      await tourToken.mint(owner.address, rewardAmount);
      await tourToken.approve(await tourStaking.getAddress(), rewardAmount);
      
      await tourStaking.addReward(rewardAmount, duration);
      
      // Avança o tempo em 30 dias
      await time.increase(30 * 24 * 60 * 60);
      
      // Verifica que recompensas foram acumuladas
      const companyEarned = await tourStaking.earned(company.address);
      const travelerEarned = await tourStaking.earned(traveler.address);
      
      expect(companyEarned).to.be.gt(0);
      expect(travelerEarned).to.be.gt(0);
      
      // A empresa deve ganhar aproximadamente 50x mais que o viajante
      const ratio = Number(companyEarned) / Number(travelerEarned);
      expect(ratio).to.be.closeTo(50, 1); // Com uma tolerância de 1
    });
    
    it("Permite reivindicar recompensas", async function () {
      const travelerEarnedBefore = await tourStaking.earned(traveler.address);
      const travelerBalanceBefore = await tourToken.balanceOf(traveler.address);
      
      await tourStaking.connect(traveler).claimReward();
      
      const travelerBalanceAfter = await tourToken.balanceOf(traveler.address);
      
      // Tolerância de 0.1 token para arredondamentos
      expect(travelerBalanceAfter).to.be.closeTo(
        travelerBalanceBefore + travelerEarnedBefore,
        ethers.parseEther("0.1")
      );
    });
  });
  
  describe("2. Crowdfunding e Projetos", function () {
    let campaignId: number;
    
    it("Permite criar uma campanha de financiamento", async function () {
      const tx = await tourCrowdfunding.connect(projectCreator).createCampaign(
        "Sustainable Travel Initiative",
        "A project to create eco-friendly travel options",
        ethers.parseEther("8000"),
        60 // 60 dias
      );
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find((e: any) => e.fragment?.name === "CampaignCreated");
      expect(event).to.not.be.undefined;
      
      // Obtém o ID da campanha do evento
      campaignId = 1; // Primeira campanha
      
      const campaign = await tourCrowdfunding.campaigns(campaignId);
      expect(campaign.title).to.equal("Sustainable Travel Initiative");
      expect(campaign.fundingGoal).to.equal(ethers.parseEther("8000"));
    });
    
    it("Permite adicionar recompensas à campanha", async function () {
      // Adiciona três níveis de recompensa
      await tourCrowdfunding.connect(projectCreator).addRewardTier(
        campaignId,
        "Basic Support",
        ethers.parseEther("100"),
        5,
        "Mention on our website",
        0, // Ilimitado
        0 // FIXED
      );
      
      await tourCrowdfunding.connect(projectCreator).addRewardTier(
        campaignId,
        "Silver Support",
        ethers.parseEther("500"),
        25,
        "Exclusive eco-travel guide + Basic rewards",
        100,
        0 // FIXED
      );
      
      await tourCrowdfunding.connect(projectCreator).addRewardTier(
        campaignId,
        "Gold Support",
        ethers.parseEther("1000"),
        50,
        "Customized travel plan + All previous rewards",
        50,
        0 // FIXED
      );
      
      const rewardIds = await tourCrowdfunding.getCampaignRewardTiers(campaignId);
      expect(rewardIds.length).to.equal(3);
    });
    
    it("Permite que apoiadores façam pledges", async function () {
      // Backer1 escolhe o nível básico
      await tourCrowdfunding.connect(backer1).pledge(
        campaignId,
        ethers.parseEther("100"),
        1, // Basic Support
        "John Smith",
        "john@example.com",
        "Great initiative!",
        false
      );
      
      // Backer2 escolhe o nível prata
      await tourCrowdfunding.connect(backer2).pledge(
        campaignId,
        ethers.parseEther("500"),
        2, // Silver Support
        "Jane Doe",
        "jane@example.com",
        "Looking forward to the eco-guide!",
        false
      );
      
      // Empresa faz um grande pledge
      await tourToken.connect(company).approve(await tourCrowdfunding.getAddress(), ethers.parseEther("7500"));
      
      await tourCrowdfunding.connect(company).pledge(
        campaignId,
        ethers.parseEther("7500"),
        3, // Gold Support
        "TourChain Corp",
        "corporate@tourchain.com",
        "Supporting sustainable travel is part of our mission",
        false
      );
      
      // Verifica se a campanha atingiu a meta
      const campaign = await tourCrowdfunding.campaigns(campaignId);
      expect(campaign.totalFunds).to.equal(ethers.parseEther("8100")); // 100 + 500 + 7500
      expect(campaign.status).to.equal(1); // SUCCESSFUL
      expect(campaign.numberOfBackers).to.equal(3);
    });
    
    it("Permite que o criador reivindique os fundos após sucesso", async function () {
      const balanceBefore = await tourToken.balanceOf(projectCreator.address);
      
      await tourCrowdfunding.connect(projectCreator).claimFunds(campaignId);
      
      const balanceAfter = await tourToken.balanceOf(projectCreator.address);
      
      // Verifica se o criador recebeu os fundos menos a taxa
      const totalFunds = ethers.parseEther("8100");
      const fee = (totalFunds * BigInt(platformFeePercent)) / 10000n;
      const expectedTransfer = totalFunds - fee;
      
      expect(balanceAfter - balanceBefore).to.equal(expectedTransfer);
      
      // Verifica se a taxa foi transferida para o coletor
      const feeCollectorBalance = await tourToken.balanceOf(owner.address);
      expect(feeCollectorBalance).to.be.gte(fee);
    });
  });
  
  describe("3. Oracle e Compensação de Carbono", function () {
    it("Oracle pode registrar dados de emissão de carbono", async function () {
      const dataId = ethers.keccak256(ethers.toUtf8Bytes("flight-nyc-sfo-12345"));
      
      await tourOracle.connect(oracle).updateCarbonEmission(
        dataId,
        1500000, // 1.5 toneladas em gramas
        "air",
        4200, // 4200 Km
        "ICAO Calculator"
      );
      
      // Verifica se os dados foram registrados
      const emission = await tourOracle.connect(traveler).getCarbonEmission(dataId);
      
      expect(emission[1]).to.equal(1500000); // emissionAmount
      expect(emission[2]).to.equal("air"); // travelMode
      expect(emission[3]).to.equal(4200); // distance
    });
    
    it("Admin pode criar projetos de compensação de carbono", async function () {
      await carbonOffset.connect(owner).addOffsetProject(
        "Amazon Reforestation",
        "Reforestation project in the Amazon rainforest",
        ethers.parseEther("0.01"), // 0.01 token por kg CO2
        "Brazil",
        "reforestation",
        2000 // 2000 toneladas
      );
      
      // Adiciona um segundo projeto
      await carbonOffset.connect(owner).addOffsetProject(
        "Solar Energy",
        "Investment in solar energy infrastructure",
        ethers.parseEther("0.015"), // 0.015 token por kg CO2
        "Global",
        "renewable",
        5000 // 5000 toneladas
      );
      
      // Verifica se os projetos foram criados
      const project1 = await carbonOffset.offsetProjects(1);
      const project2 = await carbonOffset.offsetProjects(2);
      
      expect(project1.name).to.equal("Amazon Reforestation");
      expect(project2.name).to.equal("Solar Energy");
    });
    
    it("Usuários podem compensar emissões de carbono", async function () {
      // A empresa vai compensar 1.5 toneladas (1.500.000 gramas)
      const projectId = 1; // Amazon Reforestation
      const emissionAmount = 1500000; // 1.5 toneladas em gramas
      
      // Calcula o custo esperado
      const cost = await carbonOffset.calculateOffsetCost(projectId, emissionAmount);
      
      // Aprova novamente para ter certeza
      await tourToken.connect(company).approve(await carbonOffset.getAddress(), cost[0] + cost[1]);
      
      await carbonOffset.connect(company).createOffset(
        projectId,
        emissionAmount,
        '{"from":"NYC","to":"SFO","passengers":150,"aircraft":"B737"}',
        "Reforestation"
      );
      
      // Verifica estatísticas
      expect(await carbonOffset.totalEmissionsTracked()).to.equal(emissionAmount);
      expect(await carbonOffset.totalEmissionsOffset()).to.equal(2000000); // Arredondado para 2 toneladas (2.000.000g)
      
      // Verifica projeto
      const project = await carbonOffset.offsetProjects(projectId);
      expect(project.remainingCapacity).to.equal(1998); // 2000 - 2
    });
    
    it("Oracle pode verificar uma compensação", async function () {
      // Obtém o offset ID
      const offsetId = 1;
      
      // Antes da verificação
      let offset = await carbonOffset.offsets(offsetId);
      expect(offset.verified).to.equal(false);
      
      // Oracle verifica
      await carbonOffset.connect(oracle).verifyOffset(offsetId);
      
      // Depois da verificação
      offset = await carbonOffset.offsets(offsetId);
      expect(offset.verified).to.equal(true);
    });
  });
});