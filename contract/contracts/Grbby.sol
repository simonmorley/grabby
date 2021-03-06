//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/Strings.sol";

contract Grbby is ERC721URIStorage, Ownable {

  string public baseURI;
  uint256 public tokenCounter;
  uint256 public start;
  uint256 public supply;
  uint256 public price;
  uint public max;
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

  modifier priced {
    require(price > 0, "Price not set, oh no.");
    _;
  }

  // TODO needs provenance
  // need to check withdrawal of funds
  // mint more than one

  function mint(uint256 _count) public payable started isActive priced {
    require(_count > 0, "Don't be a twat.");
    require(supply >= (tokenCounter + _count), "We're done now you filthy grabber.");
    require(max == 0 || _count <= max, "Too much grabbing going down here boy!");
    require(msg.value >= price * _count, "Not enough dosh coming in this way");

    for (uint256 i = 0; i < _count; i++) {
      uint256 newItemId = tokenCounter;
      _safeMint(msg.sender, newItemId);

      string memory tokenURI = Strings.toString(tokenCounter);

      _setTokenURI(newItemId, tokenURI);
      uint256 x = tokenCounter;
      tokenCounter += 1;
    }

    // TODO // add the tokenCounter, URI
    emit Grabby(_count);
  }

  function preMint(uint256 _count) public payable started isActive onlyOwner {
    require(_count > 0, "Don't be a twat.");
    require(supply >= (tokenCounter + _count), "We're done now you filthy grabber.");

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
    price = _price;
  }

  function setMax(uint _max) external onlyOwner {
    max = _max;
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

  function withdraw() external onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
  }
}
