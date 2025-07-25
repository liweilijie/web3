# constract

abi and bytecode

-   [chainlist](chainlist.org) 这个网站可以加很多链也可以查找很多链
-   [eips](https://eips.ethereum.org/all) eips 所有的提案

## account

-   Constract Account
-   EOA: Externally Owned Account

合约里面的交互称为消息，所有 gas 的支付都由外部帐户来支付。
交易失败了会全部回滚的，但是 Gas 会被扣除。

## gas

total fee gas = gasLimit \* gasPrice

-   gasLimit: gas 数量, 消耗不完会退回
-   gasPrice: gas 单价，以太计价是 gwei

gas limit > 实际用的 gas, 交易才能顺利进行，否则 out of gas 交易回滚，如果执行结束还有 Gas 剩余，那么 Gas 将会返还给发送交易的帐户。
gas 由合约的复杂度来决定，合约越复杂，所需要的 gas 就越多。
gas limit 开发工具来估算，gas price 用户来指定，钱包会提供参考值，price 决定交易的排序
EIP1559 之前手续费完全给矿工， EIP1559 base fee 被燃烧，小费(tip) priority Fee 矿工收取。

| 单位                          | 符号   | 与 Wei 的关系       | 与 Ether 的关系 |
| ----------------------------- | ------ | ------------------- | --------------- |
| Wei                           | wei    | 1 wei = 1 wei       | 10⁻¹⁸ ether     |
| Kwei                          | kwei   | 1 kwei = 10³ wei    | 10⁻¹⁵ ether     |
| Mwei                          | mwei   | 1 mwei = 10⁶ wei    | 10⁻¹² ether     |
| Gwei                          | gwei   | 1 gwei = 10⁹ wei    | 10⁻⁹ ether      |
| Szabo/Twei                    | szabo  | 1 szabo = 10¹² wei  | 10⁻⁶ ether      |
| Finney/Pwei                   | finney | 1 finney = 10¹⁵ wei | 10⁻³ ether      |
| Ether                         | ether  | 1 ether = 10¹⁸ wei  | 1 ether         |
| 更大单位（KEther、MEther 等） | –      | 10²¹ wei 以上       | 多用于极少场景  |

## multicall

## 特殊注意

modifier 限制器

```solidity
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function transferOwner(address _newO) public onlyOwner {
        owner = _newO;
    }
```

receive() and fallback()

```solidity
    // 没有的时候，无法接收ETH
    receive() external payable {
    }

    // call  0x12345678
    // fallback() external payable {
    //     called += 1;
    // }
```

error 处理：

```solidity
pragma solidity ^0.8.0;

contract testError {

    address owner;

    error NotOwner();
    uint x;

    constructor() {
        owner = msg.sender;
    }


    function doSomething() public {
        if(msg.sender != owner) revert NotOwner();  // 23388

        require(msg.sender == owner, "Not owner 00000000000000");   // 23642
        x += 1;

        assert(x > 0);
    }
}
```

event 事件

```solidity

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract testDeposit {

    mapping(address => uint) public deposits;
    event Deposit(address addr, uint value);

    function deposit(uint value) public {
        deposits[msg.sender] = value;
        emit Deposit(msg.sender, value);
    }
}

// web3.eth.getTransactionReceipt('0x....').then(console.log);
```
