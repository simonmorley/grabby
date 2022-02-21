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

    // set price
    const value = ethers.utils.parseEther('1');
    await expect(grbby.setPrice(value));

    await expect(grbby.mint(1, { value })).to.be.revertedWith("You can't get grabby until I say.");

    const step = 1001;
    await ethers.provider.send("evm_increaseTime", [step]);
    await ethers.provider.send("evm_mine");

    expect(await grbby.mint(1, { value })).to.emit(grbby, 'Grabby').withArgs(1);
    expect(await grbby.tokenCounter()).to.eq(1);
    expect(await grbby.tokenURI(0)).eq("http://grabby.com/0");

    await expect(grbby.mint(1), { value }).to.be.revertedWith("We're done now you filthy grabber.");
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

    const value = ethers.utils.parseEther('1');
    const five = ethers.utils.parseEther('5');
    await expect(grbby.setPrice(value));

    expect(await grbby.mint(5, { value: five })).to.emit(grbby, 'Grabby').withArgs(5);
    expect(await grbby.tokenCounter()).to.eq(5);

    for (let i = 0; i < 5; i++) {
      expect(await grbby.tokenURI(i)).eq("http://grabby.com/" + i);
    }

    expect(await grbby.mint(5, { value: five })).to.emit(grbby, 'Grabby').withArgs(5);
    expect(await grbby.tokenCounter()).to.eq(10);

    for (let i = 4; i < 10; i++) {
      expect(await grbby.tokenURI(i)).eq("http://grabby.com/" + i);
    }

    await expect(grbby.mint(1, { value })).to.be.revertedWith("We're done now you filthy grabber.");
  });

  it("should not mint over the max", async function () {
    const Grbby = await ethers.getContractFactory("Grbby");

    const name = 'Grbby';
    const sym = 'GRAB';
    const start = 0;
    const supply = 100;

    const grbby = await Grbby.deploy(name, sym, start, supply);
    await grbby.deployed();

    // set base
    await expect(grbby.setBaseURI("http://grabby.com/"));

    // set price
    const value = ethers.utils.parseEther('1');
    const five = ethers.utils.parseEther('5');
    const six = ethers.utils.parseEther('6');

    await expect(grbby.setPrice(value));

    expect(await grbby.mint(5, { value: five })).to.emit(grbby, 'Grabby').withArgs(5);
    expect(await grbby.tokenCounter()).to.eq(5);

    await grbby.setMax(5);
    await expect(grbby.mint(5, { value })).to.be.revertedWith("Not enough dosh coming in this way");
    await expect(grbby.mint(6, { value: six })).to.be.revertedWith("Too much grabbing going down here boy!");
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

    const value = ethers.utils.parseEther('1');
    await expect(grbby.setPrice(value));
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
    expect (await grbby.price()).to.eq(1000);
  });

  it("should not allow people to set the baseURL", async function () {
    const [owner, random] = await ethers.getSigners();
    await expect(grbby.connect(random).setBaseURI("x")).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(grbby.setBaseURI("x"));
    expect (await grbby.baseURI()).to.eq("x");
  });

  it("should not allow people to set the max count", async function () {
    const [owner, random] = await ethers.getSigners();
    await expect(grbby.connect(random).setMax(100)).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(grbby.setMax(10));
    expect (await grbby.max()).to.eq(10);
  });

  it("should not allow people to withdraw our ether", async function () {
    const [owner, random] = await ethers.getSigners();
    // await expect(grbby.connect(random).setMax(100)).to.be.revertedWith("Ownable: caller is not the owner");
    // await expect(grbby.setMax(10));
    // expect (await grbby.max()).to.eq(10);

    const value = ethers.utils.parseEther('1');
    const five = ethers.utils.parseEther('50');
    await expect(grbby.setPrice(value));

    expect(await grbby.mint(5, { value: five })).to.emit(grbby, 'Grabby').withArgs(5);
    expect(await grbby.tokenCounter()).to.eq(5);

    let balance0ETH = await ethers.provider.getBalance(grbby.address);
    expect(balance0ETH).to.eq(five);

    await expect(grbby.connect(random).withdraw()).to.be.revertedWith("Ownable: caller is not the owner");
    await grbby.withdraw();
    balance0ETH = await ethers.provider.getBalance(grbby.address);
    expect(balance0ETH).to.eq("0");
  });

  it("should mint some for opensea", async function () {
    const [owner, random] = await ethers.getSigners();
    await expect(grbby.connect(random).preMint(10)).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(grbby.preMint(10));
    expect (await grbby.tokenCounter()).to.eq(10);
  })
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
