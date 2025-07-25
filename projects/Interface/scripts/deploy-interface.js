// scripts/deploy.js
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", await deployer.getAddress());
    console.log(
        "Balance:",
        (await hre.ethers.provider.getBalance(deployer)).toString()
    );

    // 1) deploy Counter
    const Counter = await hre.ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();
    await counter.waitForDeployment();
    const counterAddr = await counter.getAddress(); // or counter.target
    console.log("Counter deployed to:", counterAddr);

    // 2) deploy MyContract
    const MyContract = await hre.ethers.getContractFactory("MyContract");
    const myContract = await MyContract.deploy();
    await myContract.waitForDeployment();
    const myContractAddr = await myContract.getAddress();
    console.log("MyContract deployed to:", myContractAddr);

    // 3) (可选) 演示一次调用
    const before = await counter.count();
    console.log("count before:", before.toString());

    const tx = await myContract.incrementA(counterAddr);
    await tx.wait();

    const after = await counter.count();
    console.log("count after :", after.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
