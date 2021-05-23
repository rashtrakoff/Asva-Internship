const { expect } = require("chai");
const { artifacts } = require("hardhat");
const Greeter = artifacts.require("Greeter");

describe("Greeter", function() {
  it("Should return the new greeting once it's changed", async function() {
    // The following lines which have been commented out use Ethers
    // const Greeter = await ethers.getContractFactory("Greeter");
    // const greeter = await Greeter.deploy("Hello, world!");
    const greeter = await Greeter.new("Hello, world!");
    
    // await greeter.deployed();
    expect(await greeter.greet()).to.equal("Hello, world!");

    await greeter.setGreeting("Hola, mundo!");
    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
