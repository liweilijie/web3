# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
mkdir counter
cd counter
npm init -y
npm install --save-dev hardhat
npm install dotenv --save
npm install --save-dev hardhat-abi-exporter
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
npx hardhat
code .
npx hardhat compile
npx hardhat export-abi
npx hardhat run scripts/deploy.js --network bsctestnet
```
