const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MonadTiles", function () {
  let MonadTiles, tiles, owner, addr1, addr2;

  beforeEach(async function () {
    // Récupération des comptes de test
    [owner, addr1, addr2] = await ethers.getSigners();
    // Déploiement du contrat
    const MonadTilesFactory = await ethers.getContractFactory("MonadTiles");
    tiles = await MonadTilesFactory.deploy();
    await tiles.deployed();
  });

  describe("click", function () {
    it("should register the player and increment txCount", async function () {
      // On simule un clic pour owner
      await tiles.click(owner.address);
      const playerData = await tiles.players(owner.address);
      expect(playerData.txCount).to.equal(1);
      expect(await tiles.registered(owner.address)).to.equal(true);

      // Un second clic incrémente bien le compteur
      await tiles.click(owner.address);
      const updatedData = await tiles.players(owner.address);
      expect(updatedData.txCount).to.equal(2);
    });
  });

  describe("submitScore", function () {
    it("should update lastScore and bestScore correctly", async function () {
      // Enregistrer le joueur par un clic
      await tiles.click(owner.address);

      // Soumettre un score de 100
      await tiles.submitScore(100, owner.address);
      let playerData = await tiles.players(owner.address);
      expect(playerData.lastScore).to.equal(100);
      expect(playerData.bestScore).to.equal(100);

      // Soumettre ensuite un score inférieur : lastScore change, mais bestScore reste à 100
      await tiles.submitScore(50, owner.address);
      playerData = await tiles.players(owner.address);
      expect(playerData.lastScore).to.equal(50);
      expect(playerData.bestScore).to.equal(100);

      // Soumettre un score supérieur : bestScore se met à jour
      await tiles.submitScore(150, owner.address);
      playerData = await tiles.players(owner.address);
      expect(playerData.lastScore).to.equal(150);
      expect(playerData.bestScore).to.equal(150);
    });
  });

  describe("getRank", function () {
    it("should return the correct rank for each player", async function () {
      // Trois joueurs avec des scores différents
      await tiles.click(owner.address);
      await tiles.submitScore(100, owner.address);

      await tiles.click(addr1.address);
      await tiles.submitScore(200, addr1.address);

      await tiles.click(addr2.address);
      await tiles.submitScore(150, addr2.address);

      // Le joueur avec le meilleur score (addr1) doit être classé 1, puis addr2 et enfin owner
      const rankAddr1 = await tiles.getRank(addr1.address);
      const rankAddr2 = await tiles.getRank(addr2.address);
      const rankOwner = await tiles.getRank(owner.address);

      expect(rankAddr1).to.equal(1);
      expect(rankAddr2).to.equal(2);
      expect(rankOwner).to.equal(3);
    });
  });

  describe("getLeaderboard", function () {
    it("should return sorted leaderboard arrays", async function () {
      // Trois joueurs avec des scores différents
      await tiles.click(owner.address);
      await tiles.submitScore(100, owner.address);

      await tiles.click(addr1.address);
      await tiles.submitScore(200, addr1.address);

      await tiles.click(addr2.address);
      await tiles.submitScore(150, addr2.address);

      const result = await tiles.getLeaderboard();
      const topPlayers = result.topPlayers;
      const bestScores = result.bestScores;
      const txCounts = result.txCounts;

      // Le leaderboard doit être trié par bestScore décroissant
      expect(bestScores[0]).to.equal(200);
      expect(bestScores[1]).to.equal(150);
      expect(bestScores[2]).to.equal(100);
      // Vérification que le nombre de joueurs dans le leaderboard correspond aux données
      expect(topPlayers.length).to.equal(3);
      expect(txCounts.length).to.equal(3);
    });
  });
});
