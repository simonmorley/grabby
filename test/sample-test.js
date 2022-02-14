const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Grbby", function () {
  it("should deploy the grabber and then test some basics", async function () {
    const Grbby = await ethers.getContractFactory("Grbby");

    const name = 'Grbby';
    const sym = 'GRAB';
    const start = Math.floor(new Date().getTime() / 1000) + 1000;
    const supply = 1;

    const grbby = await Grbby.deploy(name, sym, start, supply);
    await grbby.deployed();

    expect(await grbby.name()).to.eq(name);
    expect(await grbby.start()).to.eq(start);
    expect(await grbby.supply()).to.eq(supply);
    expect(await grbby.symbol()).to.eq(sym);

    // set base
    await expect(grbby.setBaseURI("http://grabby.com/"));

    await expect(grbby.mint(1)).to.be.revertedWith("You can't get grabby until I say.");

    const step = 1001;
    await ethers.provider.send("evm_increaseTime", [step]);
    await ethers.provider.send("evm_mine");

    expect(await grbby.mint(1)).to.emit(grbby, 'Grabby').withArgs(1);
    expect(await grbby.tokenCounter()).to.eq(1);
    expect(await grbby.tokenURI(0)).eq("http://grabby.com/0");

    await expect(grbby.mint(1)).to.be.revertedWith("We're done now you filthy grabber.");
  });

  it("should mint more than one", async function () {
    const Grbby = await ethers.getContractFactory("Grbby");

    const name = 'Grbby';
    const sym = 'GRAB';
    const start = 0;
    const supply = 10;

    const grbby = await Grbby.deploy(name, sym, start, supply);
    await grbby.deployed();

    // set base
    await expect(grbby.setBaseURI("http://grabby.com/"));

    expect(await grbby.mint(5)).to.emit(grbby, 'Grabby').withArgs(5);
    expect(await grbby.tokenCounter()).to.eq(5);

    for (let i = 0; i < 5; i++) {
      expect(await grbby.tokenURI(i)).eq("http://grabby.com/" + i);
    }

    expect(await grbby.mint(5)).to.emit(grbby, 'Grabby').withArgs(5);
    expect(await grbby.tokenCounter()).to.eq(10);

    for (let i = 4; i < 10; i++) {
      expect(await grbby.tokenURI(i)).eq("http://grabby.com/" + i);
    }

    await expect(grbby.mint(1)).to.be.revertedWith("We're done now you filthy grabber.");
  });

});

describe("Grbby validators etc", function () {

  let grbby;

  beforeEach(async function () {
    const Grbby = await ethers.getContractFactory("Grbby");

    const name = 'Grbby';
    const sym = 'GRAB';
    const start = 0;
    const supply = 10;

    grbby = await Grbby.deploy(name, sym, start, supply);
    await grbby.deployed();
  })

  it("should not allow people to set the status", async function () {
    const [owner, random] = await ethers.getSigners();
    await expect(grbby.connect(random).toggleStatus()).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(grbby.toggleStatus());
    expect (await grbby.active()).to.eq(false);
    await expect(grbby.mint(1)).to.be.revertedWith("You can't get grabby cos we've closed the show.");
  });

  it("should not allow people to set the price", async function () {
    const [owner, random] = await ethers.getSigners();
    await expect(grbby.connect(random).setPrice(1000)).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(grbby.setPrice(1000));
    expect (await grbby.PRICE()).to.eq(1000);
  });

  it("should not allow people to set the baseURL", async function () {
    const [owner, random] = await ethers.getSigners();
    await expect(grbby.connect(random).setBaseURI("x")).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(grbby.setBaseURI("x"));
    expect (await grbby.baseURI()).to.eq("x");
  });

  // it("should not allow people to mint the same url", async function () {
  //   const Grbby = await ethers.getContractFactory("Grbby");

  //   const name = 'Grbby';
  //   const sym = 'GRAB';
  //   const start = 0;
  //   const supply = 10;

  //   const grbby = await Grbby.deploy(name, sym, start, supply);
  //   await grbby.deployed();

  //   expect(await grbby.mint("x")).to.emit(grbby, 'Grabby').withArgs(0);
  //   expect(await grbby.tokenCounter()).to.eq(1);

  //   await expect(grbby.mint("x")).to.be.revertedWith("We're done now you filthy grabber.");
  // });
});
