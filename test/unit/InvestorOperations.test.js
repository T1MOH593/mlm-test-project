const { assert, expect } = require("chai")
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("", function () {
          let investorOperations, deployer, accounts
          beforeEach(async () => {
              // deployer = accounts[0]
              accounts = await ethers.getSigners()
              deployer = accounts[0].address
              await deployments.fixture(["investorOperations"])
              investorOperations = await ethers.getContract("InvestorOperations", deployer)
          })
          describe("entry", function () {
              it("Should emit event when investor enters", async () => {
                  await expect(investorOperations.functions["entry()"]())
                      .to.emit(investorOperations, "EnteredInvestor")
                      .withArgs(deployer, deployer)
              })
              it("entry() should set msg.sender to referee", async () => {
                  await investorOperations.functions["entry()"]()
                  expect(await investorOperations.getReferralToReferee(deployer)).to.be.eq(deployer)
              })
              it("Should emit event when investor enters with referee", async () => {
                  await investorOperations.functions["entry()"]()
                  const secondSigner = accounts[1]
                  const investorOperationsConnectedContract = await investorOperations.connect(
                      secondSigner
                  )
                  await expect(
                      investorOperationsConnectedContract.functions["entry(address)"](deployer)
                  )
                      .to.emit(investorOperations, "EnteredInvestor")
                      .withArgs(secondSigner.address, deployer)
              })
              it("Should fail when already entered", async () => {
                  await investorOperations.functions["entry()"]()
                  await expect(investorOperations.functions["entry()"]()).to.be.revertedWith(
                      "Already entered"
                  )
              })
          })
          describe("getNumberOfReferrals", function () {
              it("should correctly return number of referrals", async () => {
                  const expectedNumberOfReferrals = 4
                  await investorOperations.functions["entry()"]()
                  for (let i = 1; i < expectedNumberOfReferrals + 1; i++) {
                      const signer = accounts[i]
                      const investorOperationsConnectedContract = investorOperations.connect(signer)
                      await investorOperationsConnectedContract.functions["entry(address)"](
                          deployer
                      )
                  }
                  await expect(await investorOperations.getNumberOfReferrals()).to.be.eq(
                      expectedNumberOfReferrals
                  )
              })
          })
          describe("getReferralToReferee", function () {
              it("should correctly return referee of referral", async () => {
                  const secondSigner = accounts[1]
                  await investorOperations.functions["entry()"]()
                  const investorOperationsConnectedContract =
                      investorOperations.connect(secondSigner)
                  await investorOperationsConnectedContract.functions["entry(address)"](deployer)
                  expect(
                      await investorOperations.getReferralToReferee(secondSigner.address)
                  ).to.be.eq(deployer)
              })
          })
          describe("getRefereeToReferrals", function () {
              it("should correctly return referrals of referee", async () => {
                  const expectedReferrals = []
                  await investorOperations.functions["entry()"]()
                  for (let i = 1; i < 4; i++) {
                      const signer = accounts[i]
                      const investorOperationsConnectedContract = investorOperations.connect(signer)
                      await investorOperationsConnectedContract.functions["entry(address)"](
                          deployer
                      )
                      expectedReferrals.push(signer.address)
                  }
                  const referrals = await investorOperations.getRefereeToReferrals(deployer)
                  await expect(expectedReferrals.toString() == referrals.toString())
              })
          })
      })
