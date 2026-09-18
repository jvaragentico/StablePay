import { expect } from "chai";
import hre from "hardhat";
import { parseUnits, stringToHex } from "viem";

describe("StablePay", function () {
  it("settles an invoice in USDC", async function () {
    const [merchant, payer] = await hre.viem.getWalletClients();
    const usdc = await hre.viem.deployContract("MockUSDC");
    const stablePay = await hre.viem.deployContract("StablePay", [usdc.address, merchant.account.address]);
    const id = stringToHex("0042", { size: 32 }); const amount = parseUnits("125", 6);
    await usdc.write.mint([payer.account.address, amount]);
    await stablePay.write.createInvoice([id, payer.account.address, amount, "Brand identity"], { account: merchant.account });
    await usdc.write.approve([stablePay.address, amount], { account: payer.account });
    await stablePay.write.payInvoice([id], { account: payer.account });
    expect(await usdc.read.balanceOf([merchant.account.address])).to.equal(amount);
  });
});
