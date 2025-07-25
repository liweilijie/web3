const hre = require("hardhat");

async function main() {
    const [deployer, alice, bob] = await hre.ethers.getSigners();
    console.log("Deployer:", await deployer.getAddress());
    console.log("Alice:", await alice.getAddress());
    console.log("Bob:", await bob.getAddress());

    // -------------------------------
    // 1. 部署 MyERC20Callback
    // -------------------------------
    const MyERC20Callback = await hre.ethers.getContractFactory(
        "MyERC20Callback"
    );
    const myToken = await MyERC20Callback.deploy();
    await myToken.waitForDeployment();
    const myTokenAddr = await myToken.getAddress();
    console.log("MyERC20Callback deployed to:", myTokenAddr);

    // 初始余额
    console.log(
        "Deployer initial token:",
        (await myToken.balanceOf(deployer.address)).toString()
    );

    // -------------------------------
    // 2. 部署 Bank
    // -------------------------------
    const Bank = await hre.ethers.getContractFactory("Bank");
    const bank = await Bank.deploy(myTokenAddr);
    await bank.waitForDeployment();
    const bankAddr = await bank.getAddress();
    console.log("Bank deployed to:", bankAddr);

    // -------------------------------
    // 3. 代币转给 Alice
    // -------------------------------
    await (
        await myToken.transfer(alice.address, hre.ethers.parseEther("100"))
    ).wait();
    console.log(
        "Alice token:",
        (await myToken.balanceOf(alice.address)).toString()
    );

    // -------------------------------
    // 4. Alice -> Bank 存款 (通过 transferWithCallback)
    // -------------------------------
    console.log("Alice deposits 10 tokens using transferWithCallback...");
    await (
        await myToken
            .connect(alice)
            .transferWithCallback(bankAddr, hre.ethers.parseEther("10"))
    ).wait();

    console.log(
        "Bank's balance:",
        (await myToken.balanceOf(bankAddr)).toString()
    );
    console.log(
        "Bank.deposited(Alice):",
        (await bank.deposited(alice.address)).toString()
    );

    // -------------------------------
    // 5. 使用 deposit 接口 (需要 approve)
    // -------------------------------
    console.log("Alice approves Bank to spend 20 tokens...");
    await (
        await myToken
            .connect(alice)
            .approve(bankAddr, hre.ethers.parseEther("20"))
    ).wait();

    console.log("Alice calls Bank.deposit( Alice, 20 )...");
    await (
        await bank
            .connect(alice)
            .deposit(alice.address, hre.ethers.parseEther("20"))
    ).wait();

    console.log(
        "Bank.deposited(Alice):",
        (await bank.deposited(alice.address)).toString()
    );

    // -------------------------------
    // 6. 使用 permitDeposit (EIP-2612)
    // -------------------------------
    // 注意：MyERC20Callback 没有实现 permit，这里只是演示流程
    // 如果要测试需要一个支持 permit 的代币，例如 ERC20Permit。
    console.log(
        "=== permitDeposit 需要支持 EIP-2612 的 token，这里仅示例签名流程 ==="
    );

    // 演示签名 (伪代码)
    // const nonce = await myToken.nonces(alice.address);
    // const deadline = Math.floor(Date.now() / 1000) + 3600;
    // const domain = {
    //   name: "MyERC20",
    //   version: "1",
    //   chainId: (await hre.ethers.provider.getNetwork()).chainId,
    //   verifyingContract: myTokenAddr,
    // };
    // const types = {
    //   Permit: [
    //     { name: "owner", type: "address" },
    //     { name: "spender", type: "address" },
    //     { name: "value", type: "uint256" },
    //     { name: "nonce", type: "uint256" },
    //     { name: "deadline", type: "uint256" },
    //   ],
    // };
    // const values = {
    //   owner: alice.address,
    //   spender: bankAddr,
    //   value: hre.ethers.parseEther("5"),
    //   nonce: nonce,
    //   deadline: deadline,
    // };
    // const signature = await alice.signTypedData(domain, types, values);
    // const { v, r, s } = hre.ethers.Signature.from(signature);

    // await bank.connect(alice).permitDeposit(alice.address, hre.ethers.parseEther("5"), deadline, v, r, s);

    // -------------------------------
    // 7. 查询余额
    // -------------------------------
    console.log(
        "Bank.deposited(Alice):",
        (await bank.deposited(alice.address)).toString()
    );
    console.log(
        "Deployer tokens:",
        (await myToken.balanceOf(deployer.address)).toString()
    );
    console.log(
        "Alice tokens:",
        (await myToken.balanceOf(alice.address)).toString()
    );
    console.log("Bank tokens:", (await myToken.balanceOf(bankAddr)).toString());

    console.log("=== Script finished ===");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
