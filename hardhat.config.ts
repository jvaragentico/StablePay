import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
const config: HardhatUserConfig = { solidity: "0.8.24", networks: { baseSepolia: { url: process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || "", accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [] } } };
export default config;
