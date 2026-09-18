# StablePay Commerce

A portfolio-grade, testnet-only stablecoin invoicing product. The merchant creates an invoice, the customer approves USDC, the smart contract settles payment directly to the merchant, and the UI produces an onchain receipt.

## Live demo

**[Open StablePay Commerce →](https://stablepay-commerce.vercel.app)**

The public demo runs in simulation mode, so you can test the complete payment flow without a wallet or testnet funds.

## Demo modes

- **Simulation (default):** the complete six-step experience works without a wallet, keys, or test tokens. Ideal for a public portfolio deployment.
- **Live Base Sepolia:** connects an injected wallet and performs the real ERC-20 `approve` + `payInvoice` flow.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Smart contracts

```bash
npm run contract:compile
npm run contract:test
```

`StablePay.sol` keeps no custody: each successful payment transfers the invoice amount directly from customer to merchant. It prevents duplicate invoice IDs, duplicate payment, unauthorized payer use, and unauthorized cancellation.

## Enable live testnet mode

1. Copy `.env.example` to `.env.local`.
2. Add an Alchemy Base Sepolia RPC URL and a funded deployer key.
3. Run `npm run contract:deploy`.
4. Set `NEXT_PUBLIC_STABLEPAY_CONTRACT` to the deployed address and `NEXT_PUBLIC_LIVE_TESTNET=true`.
5. Create invoice `keccak256("0042")` for 125 USDC before using the included checkout, or adapt the checkout to your invoice API.

The deploy script targets the official Base Sepolia test USDC contract. Never commit private keys. This is a demonstration, not audited production software.

## Stack

Next.js · TypeScript · Solidity · Hardhat · viem · wagmi · Alchemy · Base Sepolia
