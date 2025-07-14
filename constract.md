# constract

abi and bytecode

[chainlist](chainlist.org) 这个网站可以加很多链也可以查找很多链

## account

- Constract Account
- EOA: Externally Owned Account

合约里面的交互称为消息，所有gas的支付都由外部帐户来支付。
交易失败了会全部回滚的，但是Gas会被扣除。

## gas

total fee gas = gasLimit * gasPrice

- gasLimit: gas 数量, 消耗不完会退回
- gasPrice: gas 单价，以太计价是 gwei

gas limit > 实际用的gas, 交易才能顺利进行，否则out of gas 交易回滚，如果执行结束还有Gas剩余，那么Gas将会返还给发送交易的帐户。
gas由合约的复杂度来决定，合约越复杂，所需要的gas就越多。
gas limit开发工具来估算，gas price用户来指定，钱包会提供参考值，price决定交易的排序
EIP1559之前手续费完全给矿工， EIP1559 base fee 被燃烧，小费(tip) priority Fee 矿工收取。

| 单位                    | 符号     | 与 Wei 的关系           | 与 Ether 的关系 |
| --------------------- | ------ | ------------------- | ----------- |
| Wei                   | wei    | 1 wei = 1 wei       | 10⁻¹⁸ ether |
| Kwei                  | kwei   | 1 kwei = 10³ wei    | 10⁻¹⁵ ether |
| Mwei                  | mwei   | 1 mwei = 10⁶ wei    | 10⁻¹² ether |
| Gwei                  | gwei   | 1 gwei = 10⁹ wei    | 10⁻⁹ ether  |
| Szabo/Twei            | szabo  | 1 szabo = 10¹² wei  | 10⁻⁶ ether  |
| Finney/Pwei           | finney | 1 finney = 10¹⁵ wei | 10⁻³ ether  |
| Ether                 | ether  | 1 ether = 10¹⁸ wei  | 1 ether     |
| 更大单位（KEther、MEther 等） | –      | 10²¹ wei 以上         | 多用于极少场景     |

