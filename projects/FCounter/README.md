## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

- [中文学习foundry](https://learnblockchain.cn/docs/foundry/i18n/zh/tutorials/solidity-scripting.html)
- [decert学习foundry](https://decert.me/tutorial/solidity/tools/foundry)

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

安装第三方库: `forge install OpenZeppelin/openzeppelin-contracts`

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
forge script script/Counter.s.sol --rpc-url bsctestnet --broadcast --mnemonics ${MNEMONIC}
```

### Cast

[cast详解](https://learnblockchain.cn/docs/foundry/i18n/zh/reference/cast/cast.html)

```shell
$ cast <subcommand>
# cast call 来调用counter() 方法：
cast call 0x21c742d58BE9566ffC69bC42884F0f86b64eD908  "counter()(uint256)"  --rpc-url $BSC_TESTNET_RPC_URL
# 使用 cast send 调用 setNumber(uint256) 方法，调用的函数有参数，则直接写在函数的后面。发起一个交易:
cast send 0x21c742d58BE9566ffC69bC42884F0f86b64eD908 "setNumber(uint256)" 123 --rpc-url $BSC_TESTNET_RPC_URL --mnemonic "$MNEMONIC"
cast send 0x21c742d58BE9566ffC69bC42884F0f86b64eD908 "count()" --rpc-url $BSC_TESTNET_RPC_URL --mnemonic "$MNEMONIC"
cast send 0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0 "setNumber(uint256)" 1 --rpc-url local --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# 获取账号的余额（返回 Wei 为单位）：
cast balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
