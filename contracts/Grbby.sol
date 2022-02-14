//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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
      require(active == true, "You can't get grabby cos we've closed the show.");
      _;
  }

  modifier started {
      require(block.timestamp >= start, "You can't get grabby until I say.");
      _;
  }

  modifier open {
      require(supply > tokenCounter, "We're done now you filthy grabber.");
      _;
  }

  // TODO needs provenance
  // need to check withdrawal of funds
  // mint more than one
  // set the price
  // update the price

  function mint(string memory tokenURI) public payable started open isActive {
    // inc logic here including the count
    // block the whales, restrict to a count per user

    uint256 newItemId = tokenCounter;
    _safeMint(msg.sender, newItemId);
    _setTokenURI(newItemId, tokenURI);
    uint256 x = tokenCounter;
    tokenCounter += 1;

    // TODO
    emit Grabby(x);
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
