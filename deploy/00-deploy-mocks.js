const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // If we are on a local development network, we need to deploy mocks!
    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockIInvestorOperations", {
            contract: "MockIInvestorOperations",
            from: deployer,
            log: true,
            args: [],
        })
        log("Mocks Deployed!")
    }
}
module.exports.tags = ["all", "mocks"]
