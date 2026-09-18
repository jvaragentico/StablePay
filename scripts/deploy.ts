import hre from "hardhat";
const BASE_SEPOLIA_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
async function main() {
  const [wallet] = await hre.viem.getWalletClients();
  const contract = await hre.viem.deployContract("StablePay", [BASE_SEPOLIA_USDC, wallet.account.address]);
  console.log("StablePay deployed:", contract.address);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
