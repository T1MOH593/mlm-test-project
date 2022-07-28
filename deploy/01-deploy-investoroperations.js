const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploy without proxy...")
        const investorOperations = await deploy("InvestorOperations", {
            from: deployer,
            args: [],
            log: true,
        })
        log(`InvestorOperations deployed at ${investorOperations.address}`)
    } else {
        const investorOperationsProxy = await deploy("InvestorOperations", {
            from: deployer,
            args: [],
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1,
            proxy: {
                proxyContract: "OpenZeppelinTransparentProxy",
                viaAdminContract: {
                    name: "MLMProxyAdmin",
                    artifact: "MLMProxyAdmin",
                },
            },
        })
        log(`InvestorOperationsProxy deployed at ${investorOperationsProxy.address}`)
    }
}

module.exports.tags = ["all", "investorOperations"]
