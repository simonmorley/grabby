//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Grbby is ERC721URIStorage, Ownable {

  string public baseURI;
  uint256 public tokenCounter;
  uint256 public start;
  uint256 public supply;
  uint256 public PRICE;
  bool public active;

  event Grabby(uint256);

  constructor (
    string memory name,
    string memory symbol,
    uint256 _start,
    uint256 _supply
  ) public ERC721 (name, symbol) {
      start = _start;
      supply = _supply;
      active = true;
  }

  modifier isActive {
      require(active, "You can't get grabby cos we've closed the show.");
      _;
  }

  modifier started {
      require(block.timestamp >= start, "You can't get grabby until I say.");
      _;
  }

  // TODO needs provenance
  // need to check withdrawal of funds
  // mint more than one

  function mint(uint256 _count) public payable started isActive {

    require(_count > 0, "Don't be a twat.");

    require(supply >= (tokenCounter + _count), "We're done now you filthy grabber.");

    // inc logic here including the count
    // block the whales, restrict to a count per user

    for (uint256 i = 0; i < _count; i++) {
      uint256 newItemId = tokenCounter;
      _safeMint(msg.sender, newItemId);

      string memory tokenURI = Strings.toString(tokenCounter);

      _setTokenURI(newItemId, tokenURI);
      uint256 x = tokenCounter;
      tokenCounter += 1;
    }

    // TODO
    emit Grabby(_count);
  }

  function setPrice(uint256 _price) external onlyOwner {
    PRICE = _price;
  }

  function toggleStatus() external onlyOwner {
    active = !active;
  }

  function setTokenURI(
    uint256 tokenId,
    string memory tokenURI
  ) external onlyOwner {
    _setTokenURI(tokenId, tokenURI);
  }

  function setBaseURI(string memory baseURI_) external onlyOwner {
    baseURI = baseURI_;
  }

  function _baseURI() internal view override returns (string memory) {
    return baseURI;
  }

}
