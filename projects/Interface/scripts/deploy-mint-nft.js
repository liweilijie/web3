const hre = require("hardhat");

async function main() {
    const [signer] = await hre.ethers.getSigners();

    const nftAddress = "0x30Ea540CeaD982dCce0e715A8008b6617cb2b8c2"; // 你的NFT合约地址
    const tokenURI =
        "ipfs://bafkreiefssp5w5jrgabz6y5ncdjsgjwkzrinjgomxq77a3noi2ubhvd6xu";
    const recipient = process.env.RECIPIENT || signer.address; // 接收者，默认是部署者/执行者自己

    console.log("Using signer:", signer.address);
    console.log("NFT contract:", nftAddress);
    console.log("Mint to:", recipient);
    console.log("Token URI:", tokenURI);

    // 获取已部署合约实例
    const nft = await hre.ethers.getContractAt("MyERC721", nftAddress, signer);

    // 先用 staticCall 查看 tokenId
    const tokenId = await nft.mint.staticCall(recipient, tokenURI);

    // 执行 mint
    const tx = await nft.mint(recipient, tokenURI);
    await tx.wait();

    console.log(`Minted NFT #${tokenId.toString()} to ${recipient}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
