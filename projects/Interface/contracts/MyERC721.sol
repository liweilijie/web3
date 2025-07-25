// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyERC721 is ERC721URIStorage {
    uint256 private _tokenIds;

    constructor() ERC721(unicode"李伟NFT", "LWNFT") {}

    function mint(address student, string memory tokenURI)
        public
        returns (uint256)
    {
        // 先自增，避免第一个 tokenId 是 0（如果你不介意 0 也可以先用再增）
        _tokenIds += 1;
        uint256 newItemId = _tokenIds;

        _mint(student, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}