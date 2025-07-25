require("dotenv").config({ path: __dirname + "/.env" });
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-abi-exporter");

const { MNEMONIC, ETHERSCAN_API_KEY } = process.env;
if (!MNEMONIC) throw new Error("请在 .env 中设置 MNEMONIC");
if (!ETHERSCAN_API_KEY)
    console.warn("未设置 ETHERSCAN_API_KEY，可跳过合约验证");

module.exports = {
    solidity: "0.8.28",

    abiExporter: {
        path: "./abi",
        clear: true,
        flat: true,
        only: [],
        spacing: 2,
        runOnCompile: true,
        pretty: false,
    },

    networks: {
        bsctestnet: {
            url: "http://8.217.116.214:8575",
            chainId: 97,
            accounts: { mnemonic: MNEMONIC },
        },
    },

    etherscan: {
        apiKey: ETHERSCAN_API_KEY, // 如果需要验证合约，请设置 env
    },
};
