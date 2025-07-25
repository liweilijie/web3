// scripts/deploy_nft.js
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deployer:", deployer.address);
    console.log(
        "Deployer balance:",
        hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer))
    );

    // 1) 部署合约
    const MyERC721 = await hre.ethers.getContractFactory("MyERC721");
    const nft = await MyERC721.deploy();
    await nft.waitForDeployment();
    const nftAddr = await nft.getAddress();
    console.log("MyERC721 deployed to:", nftAddr);

    // 2) 读取要 mint 的地址与 tokenURI（可通过环境变量传入）
    const student = process.env.STUDENT || deployer.address;
    const tokenURI =
        process.env.TOKEN_URI ||
        "ipfs://bafkreihpjvo56rtgjkz3sngsssb6ks33swyrjr3gkpocf4qrmprcspon2e";
    console.log("Mint to:", student);
    console.log("tokenURI:", tokenURI);

    // 3) 先用 staticCall 预估一下返回的 tokenId（不会上链）
    const tokenId = await nft.mint.staticCall(student, tokenURI);

    // 4) 真正执行 mint
    const tx = await nft.mint(student, tokenURI);
    await tx.wait();

    console.log("Minted tokenId:", tokenId.toString());
    console.log("Done.");
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
