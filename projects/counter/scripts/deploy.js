const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const Counter = await ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();

  await counter.waitForDeployment();
  const address = await counter.getAddress();
  console.log("✅ Counter deployed to:", address);

  const addr = { Counter: address };
  fs.writeFileSync(
    path.join(__dirname, "deployed-address.json"),
    JSON.stringify(addr, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });