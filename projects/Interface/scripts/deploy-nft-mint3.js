// scripts/deploy_and_mint3.js
const hre = require("hardhat");

function readListFromEnv(name, fallback) {
    const v = process.env[name];
    if (!v) return fallback;
    return v.split(",").map((s) => s.trim());
}

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deployer:", deployer.address);

    // 读取接收地址与 tokenURI（逗号分隔）
    const students = readListFromEnv("STUDENTS", [
        deployer.address,
        deployer.address,
        deployer.address,
    ]);
    const uris = readListFromEnv("TOKEN_URIS", [
        "ipfs://CID_METADATA_1",
        "ipfs://CID_METADATA_2",
        "ipfs://CID_METADATA_3",
    ]);

    if (students.length !== 3 || uris.length !== 3) {
        throw new Error(
            "请提供恰好 3 个 STUDENTS 和 3 个 TOKEN_URIS（逗号分隔）"
        );
    }

    // 1) 部署
    const MyERC721 = await hre.ethers.getContractFactory("MyERC721");
    const nft = await MyERC721.deploy();
    await nft.waitForDeployment();
    const addr = await nft.getAddress();
    console.log("MyERC721 deployed at:", addr);

    // 2) 依次 mint 3 个
    for (let i = 0; i < 3; i++) {
        const to = students[i];
        const uri = uris[i];

        // 先 staticCall 拿到 tokenId
        const tokenId = await nft.mint.staticCall(to, uri);

        const tx = await nft.mint(to, uri);
        await tx.wait();

        console.log(`Minted #${tokenId.toString()} -> ${to}, uri=${uri}`);
    }

    console.log("All done.");
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
