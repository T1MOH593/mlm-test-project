const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploy without proxy...")
        // Inject mocks
        const mockIInvestorOperations = (await deployments.get("MockIInvestorOperations")).address
        const invest = await deploy("Invest", {
            from: deployer,
            args: [mockIInvestorOperations],
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1,
        })
        log(`Invest deployed at ${invest.address}`)
    } else {
        const investorOperationsProxyAddress = (await deployments.get("InvestorOperations_Proxy"))
            .address
        const investProxy = await deploy("Invest", {
            from: deployer,
            args: [investorOperationsProxyAddress],
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
        log(`InvestProxy deployed at ${investProxy.address}`)
    }
}

module.exports.tags = ["all", "invest"]
