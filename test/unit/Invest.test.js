const { assert, expect } = require("chai")
const { ethers, network } = require("hardhat")
const { idText } = require("typescript")
const { developmentChains } = require("../../helper-hardhat-config")

const amount = ethers.utils.parseEther("1")
const amountAfterCommission = amount
    .mul(ethers.BigNumber.from("95"))
    .div(ethers.BigNumber.from("100"))
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("", function () {
          let mockIInvestorOperations, invest, deployer, accounts
          beforeEach(async () => {
              accounts = await ethers.getSigners()
              // deployer = accounts[0]
              deployer = accounts[0].address
              await deployments.fixture(["mocks", "invest"])
              mockIInvestorOperations = await ethers.getContract(
                  "MockIInvestorOperations",
                  deployer
              )
              invest = await ethers.getContract("Invest", deployer)
          })
          describe("constructor", function () {
              it("sets investorOperations correctly", async () => {
                  const response = await invest.getInvestorOperations()
                  assert.equal(response, mockIInvestorOperations.address)
              })
          })
          describe("invest", function () {
              it("fails when not entered", async () => {
                  await expect(invest.invest({ value: amount })).to.be.revertedWith("Not entered")
              })
              it("correctly sets investedAmount", async () => {
                  await mockIInvestorOperations.register(deployer, deployer)
                  await invest.invest({ value: amount })
                  const investedAmount = await invest.getInvestedAmount(deployer)
                  assert.equal(investedAmount.toString(), amountAfterCommission.toString())
              })
          })
          describe("withdraw", function () {
              beforeEach(async () => {
                  await mockIInvestorOperations.register(deployer, deployer)
              })
              it("correctly withdraws investedAmount", async () => {
                  await invest.invest({ value: amount })
                  const investedAmount = await invest.getInvestedAmount(deployer)
                  const startingBalance = await invest.provider.getBalance(deployer)

                  const txResponse = await invest.withdraw()
                  const txReceipt = await txResponse.wait(1)
                  const { effectiveGasPrice, gasUsed } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endingBalance = await invest.provider.getBalance(deployer)
                  const endingInvestedAmount = await invest.getInvestedAmount(deployer)

                  assert.equal(
                      startingBalance.add(investedAmount).toString(),
                      endingBalance.add(gasCost).toString()
                  )
                  assert.equal(endingInvestedAmount, "0")
              })
              it("pays to referees correctly", async () => {
                  const referral = accounts[1]
                  await mockIInvestorOperations.register(referral.address, deployer)
                  // level up referees
                  await invest.connect(referral).invest({ value: amount })
                  await invest.invest({ value: amount })
                  const startingDeployerInvestedAmount = await invest.getInvestedAmount(deployer)
                  // act
                  await invest.connect(referral).withdraw()

                  const endingDeployerInvestedAmount = await invest.getInvestedAmount(deployer)
                  const bn1000 = ethers.BigNumber.from("1000")
                  const firstLevelCommission = ethers.BigNumber.from("10")

                  assert.equal(
                      endingDeployerInvestedAmount.toString(),
                      startingDeployerInvestedAmount
                          .add(amountAfterCommission.mul(firstLevelCommission).div(bn1000))
                          .toString()
                  )
              })
          })
          describe("getLevelOfReferrals", function () {
              it("correctly returns levels array", async () => {
                  const referral1 = accounts[1]
                  const referral2 = accounts[2]
                  await mockIInvestorOperations.register(deployer, deployer)
                  await mockIInvestorOperations.register(referral1.address, deployer)
                  await mockIInvestorOperations.register(referral2.address, deployer)
                  const level1Amount = ethers.utils.parseEther("0.006")
                  const level6Amount = ethers.utils.parseEther("0.3")

                  await invest.connect(referral1).invest({ value: level1Amount })
                  await invest.connect(referral2).invest({ value: level6Amount })

                  const response = await invest.getLevelOfReferrals()

                  assert.equal(response.toString(), [1, 6])
              })
          })
      })
