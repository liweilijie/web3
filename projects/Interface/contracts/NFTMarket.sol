// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";


contract NFTMarket is IERC721Receiver {
    mapping(uint => uint) public tokenIdPrice;
    mapping(uint => address) public tokenSeller;
    address public immutable token;
    address public immutable nftToken;

    constructor(address _token, address _nftToken) {
        token = _token;
        nftToken = _nftToken;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
      return this.onERC721Received.selector;
    }

    /*
    用户挂单 NFT 出售：
    1. 前提：卖家需要先在 NFT 合约中执行 approve(marketAddress, tokenId)。
    2. 把 tokenID 对应的 NFT 从卖家转入市场合约。
    3. 设置 tokenIdPrice[tokenID] = amount（ERC20 代币价格）。
    4. 设置 tokenSeller[tokenID] = msg.sender（记录卖家）。
    */
    function list(uint tokenID, uint amount) public {
        IERC721(nftToken).safeTransferFrom(msg.sender, address(this), tokenID, "");
        tokenIdPrice[tokenID] = amount;
        tokenSeller[tokenID] = msg.sender;
    }


    /*
    买家购买：
    1. 买家传入 amount（实际出价）。
    2. 检查 amount >= 挂单价，否则报错。
    3. 检查该 tokenId 是否仍在市场合约中（未被售出）。
    4. 使用 ERC20 transferFrom 从买家转代币给卖家（买家需事先对市场合约执行 approve 或 permit 授权 ERC20）。
    5. 把 NFT 从市场合约转移给买家。
    */
    function buy(uint tokenId, uint amount) external {
      require(amount >= tokenIdPrice[tokenId], "low price");

      require(IERC721(nftToken).ownerOf(tokenId) == address(this), "aleady selled");

      IERC20(token).transferFrom(msg.sender, tokenSeller[tokenId], tokenIdPrice[tokenId]);
      IERC721(nftToken).transferFrom(address(this), msg.sender, tokenId);

    }


}

