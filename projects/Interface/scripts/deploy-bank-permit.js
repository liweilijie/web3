// scripts/deploy_and_full_test.js
const hre = require("hardhat");

async function main() {
    const [deployer, alice, bob] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);
    console.log("Alice:", alice.address);
    console.log("Bob:", bob.address);

    // --------------------------------------------------------
    // 1. 部署 MyERC20Callback （不支持 permit，有 transferWithCallback）
    // --------------------------------------------------------
    const MyERC20Callback = await hre.ethers.getContractFactory(
        "MyERC20Callback"
    );
    const callbackToken = await MyERC20Callback.deploy();
    await callbackToken.waitForDeployment();
    const callbackTokenAddr = await callbackToken.getAddress();
    console.log("MyERC20Callback deployed:", callbackTokenAddr);

    // --------------------------------------------------------
    // 2. 部署 Bank（用于与 MyERC20Callback 交互）
    // --------------------------------------------------------
    const Bank = await hre.ethers.getContractFactory("Bank");
    const bankCallback = await Bank.deploy(callbackTokenAddr);
    await bankCallback.waitForDeployment();
    const bankCallbackAddr = await bankCallback.getAddress();
    console.log("Bank(CallbackToken) deployed:", bankCallbackAddr);

    // --------------------------------------------------------
    // 3. 部署 MyERC20Permit（支持 permit，没有 transferWithCallback）
    // --------------------------------------------------------
    const MyERC20Permit = await hre.ethers.getContractFactory("MyERC20Permit");
    const permitToken = await MyERC20Permit.deploy();
    await permitToken.waitForDeployment();
    const permitTokenAddr = await permitToken.getAddress();
    console.log("MyERC20Permit deployed:", permitTokenAddr);

    // --------------------------------------------------------
    // 4. 再部署一个 Bank（用于与 MyERC20Permit 交互）
    // --------------------------------------------------------
    const bankPermit = await Bank.deploy(permitTokenAddr);
    await bankPermit.waitForDeployment();
    const bankPermitAddr = await bankPermit.getAddress();
    console.log("Bank(PermitToken) deployed:", bankPermitAddr);

    // --------------------------------------------------------
    // ====== A. 测试 Bank + MyERC20Callback 的功能 ======
    // --------------------------------------------------------
    console.log("\n=== [A] Bank + MyERC20Callback tests ===");

    // 给 Alice 发币
    await (
        await callbackToken.transfer(
            alice.address,
            hre.ethers.parseEther("100")
        )
    ).wait();
    console.log(
        "Alice callbackToken balance:",
        (await callbackToken.balanceOf(alice.address)).toString()
    );

    // 1) Alice 使用 transferWithCallback 存 10 个币到 bankCallback
    console.log("Alice transferWithCallback 10 tokens to bankCallback...");
    await (
        await callbackToken
            .connect(alice)
            .transferWithCallback(bankCallbackAddr, hre.ethers.parseEther("10"))
    ).wait();

    console.log(
        "bankCallback deposited[Alice]:",
        (await bankCallback.deposited(alice.address)).toString()
    );
    console.log(
        "bankCallback token balance:",
        (await callbackToken.balanceOf(bankCallbackAddr)).toString()
    );

    // 2) Alice 使用 approve + deposit 再存 20 个
    console.log("Alice approves 20 tokens to bankCallback...");
    await (
        await callbackToken
            .connect(alice)
            .approve(bankCallbackAddr, hre.ethers.parseEther("20"))
    ).wait();

    console.log("Alice calls deposit( Alice, 20 )...");
    await (
        await bankCallback
            .connect(alice)
            .deposit(alice.address, hre.ethers.parseEther("20"))
    ).wait();

    console.log(
        "bankCallback deposited[Alice]:",
        (await bankCallback.deposited(alice.address)).toString()
    );
    console.log(
        "bankCallback token balance:",
        (await callbackToken.balanceOf(bankCallbackAddr)).toString()
    );

    // --------------------------------------------------------
    // ====== B. 测试 Bank + MyERC20Permit 的功能（含 permitDeposit） ======
    // --------------------------------------------------------
    console.log("\n=== [B] Bank + MyERC20Permit tests (permitDeposit) ===");

    // 给 Alice 发币
    await (
        await permitToken.transfer(alice.address, hre.ethers.parseEther("100"))
    ).wait();
    console.log(
        "Alice permitToken balance:",
        (await permitToken.balanceOf(alice.address)).toString()
    );

    // 1) approve + deposit 5 个（常规方式）
    console.log("Alice approves 5 tokens to bankPermit...");
    await (
        await permitToken
            .connect(alice)
            .approve(bankPermitAddr, hre.ethers.parseEther("5"))
    ).wait();

    console.log("Alice calls bankPermit.deposit(Alice, 5)...");
    await (
        await bankPermit
            .connect(alice)
            .deposit(alice.address, hre.ethers.parseEther("5"))
    ).wait();

    console.log(
        "bankPermit deposited[Alice]:",
        (await bankPermit.deposited(alice.address)).toString()
    );
    console.log(
        "bankPermit token balance:",
        (await permitToken.balanceOf(bankPermitAddr)).toString()
    );

    // 2) 使用 permitDeposit 方式再存 7 个
    console.log("Alice prepares EIP-2612 signature for 7 tokens...");
    const value = hre.ethers.parseEther("7");
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 小时后过期
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;

    const nonce = await permitToken.nonces(alice.address);

    const domain = {
        name: await permitToken.name(),
        version: "1",
        chainId,
        verifyingContract: permitTokenAddr,
    };

    const types = {
        Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
        ],
    };

    const message = {
        owner: alice.address,
        spender: bankPermitAddr,
        value: value,
        nonce: nonce,
        deadline: deadline,
    };

    const signature = await alice.signTypedData(domain, types, message);
    const sig = hre.ethers.Signature.from(signature);

    console.log("Alice calls bankPermit.permitDeposit(...) with signature...");
    await (
        await bankPermit
            .connect(alice)
            .permitDeposit(alice.address, value, deadline, sig.v, sig.r, sig.s)
    ).wait();

    console.log(
        "bankPermit deposited[Alice]:",
        (await bankPermit.deposited(alice.address)).toString()
    );
    console.log(
        "bankPermit token balance:",
        (await permitToken.balanceOf(bankPermitAddr)).toString()
    );

    console.log("\n=== Done ===");
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});

/*
npx hardhat run scripts/deploy-bank-permit.js --network bsctestnet                                                                                                                                                          16:56:49 
[dotenv@17.2.1] injecting env (0) from .env -- tip: 📡 observe env with Radar: https://dotenvx.com/radar
[dotenv@17.2.1] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
Deployer: 0xA3C6AAf427aF650D443686e9423889Bd3AF4BD6e
Alice: 0x062AF3C72b37867998D50f043922b0CD8F17630C
Bob: 0xaaa142609B07cb04418Be35fC2390f48d281319C
MyERC20Callback deployed: 0xBf4c0141FF93d7373448F56636f4fE990551802f
Bank(CallbackToken) deployed: 0xC841592dfb545B1b87743EEC8A58468BF53422fd
MyERC20Permit deployed: 0x1F22c4CDa11aC148108260788B518b506D9f52BB
Bank(PermitToken) deployed: 0x89fcA164e4Cf6a660042020a55a201208CC6AC94

=== [A] Bank + MyERC20Callback tests ===
Alice callbackToken balance: 100000000000000000000
Alice transferWithCallback 10 tokens to bankCallback...
bankCallback deposited[Alice]: 10000000000000000000
bankCallback token balance: 10000000000000000000
Alice approves 20 tokens to bankCallback...
Alice calls deposit( Alice, 20 )...
bankCallback deposited[Alice]: 30000000000000000000
bankCallback token balance: 30000000000000000000

=== [B] Bank + MyERC20Permit tests (permitDeposit) ===
Alice permitToken balance: 100000000000000000000
Alice approves 5 tokens to bankPermit...
Alice calls bankPermit.deposit(Alice, 5)...
bankPermit deposited[Alice]: 5000000000000000000
bankPermit token balance: 5000000000000000000
Alice prepares EIP-2612 signature for 7 tokens...
Alice calls bankPermit.permitDeposit(...) with signature...
bankPermit deposited[Alice]: 12000000000000000000
bankPermit token balance: 12000000000000000000

=== Done ===
*/
