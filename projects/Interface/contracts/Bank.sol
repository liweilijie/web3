pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@openzeppelin/contracts/interfaces/IERC1820Registry.sol";

interface TokenRecipient {
    function tokensReceived(address sender, uint amount) external returns (bool);
}

// Bank 合约可以接收 MyERC20Callback 的回调存款，也可以通过 approve+deposit 或 permitDeposit 存款。 它把每个用户的存款记录在 deposited[user]。
contract Bank is TokenRecipient {
    mapping(address => uint) public deposited;
    address public immutable token;

      // keccak256("ERC777TokensRecipient")
    bytes32 constant private TOKENS_RECIPIENT_INTERFACE_HASH =
      0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b;

    IERC1820Registry private erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);

    constructor(address _token) {
        token = _token;
        //erc1820.setInterfaceImplementer(address(this), TOKENS_RECIPIENT_INTERFACE_HASH, address(this));

    }


    function tokensReceived(address sender, uint amount) external returns (bool) {
        require(msg.sender == token, "invalid");
        deposited[sender] += amount;
        return true;
    }

    // 普通存款 (deposit) 调用方需要先 approve 给 Bank 合约，然后调用 deposit(user, amount)，Bank 合约会执行 transferFrom 把代币转进来，并更新 deposited[user]。
    function deposit(address user, uint amount) public {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        deposited[user] += amount;
    }


    // permit 存款 (permitDeposit) 使用了 IERC20Permit 接口（EIP-2612）。 用户可以用签名（v, r, s）授权 Bank 合约拉取代币，而无需单独 approve。 Bank 调用 permit 后，直接调用 deposit
    function permitDeposit(address user, uint amount, uint deadline, uint8 v, bytes32 r, bytes32 s) external {
        IERC20Permit(token).permit(msg.sender, address(this), amount, deadline, v, r, s);
        deposit(user, amount);
    }


    // 收款时被回调
    function tokensReceived(
        address operator,
        address from,
        address to,
        uint amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external {
        require(msg.sender == token, "invalid");
            deposited[from] += amount;
    }

}

