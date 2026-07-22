# DoneDot

DoneDot is a small onchain done journal for Base mainnet. A user connects a
wallet, chooses one of six done categories, and stamps a dot onchain. There are
no tokens, paid app actions, NFTs, subscriptions, or backend services. The only
user cost is the Base network gas for calling `stamp(uint8)`.

## What is inside

- `contracts/DoneDot.sol` - the Solidity contract for Remix.
- `src/` - the React + Vite app.
- `src/config/wagmi.ts` - Base mainnet wallet configuration.
- `src/config/contract.ts` - ABI and contract address loading.
- `.env.example` - the frontend environment variable template.

## Deploy the contract with Remix

1. Open [Remix](https://remix.ethereum.org/).
2. Create a new file named `DoneDot.sol`.
3. Paste the full contents of `contracts/DoneDot.sol`.
4. Open the Solidity Compiler tab.
5. Select compiler `0.8.24`.
6. Keep optimization disabled unless you plan to verify with the exact same
   optimization settings.
7. Compile `DoneDot.sol`.
8. Open the Deploy & Run Transactions tab.
9. Set Environment to `Injected Provider - MetaMask` or the wallet you use.
10. Switch your wallet to Base mainnet.
11. Deploy `DoneDot`.
12. Copy the deployed contract address.

## Verify on BaseScan

1. Open [BaseScan contract verification](https://basescan.org/verifyContract).
2. Paste the deployed contract address.
3. Select `Solidity (Single file)`.
4. Select compiler `v0.8.24+commit.e11b9ed9`.
5. Select license `MIT`.
6. Select optimization `No` if you followed the Remix steps above.
7. Paste the full `contracts/DoneDot.sol` source code.
8. Constructor arguments can stay empty because this contract has no constructor.
9. Submit verification.

## Configure the frontend

Create `.env` from the example:

```bash
cp .env.example .env
```

Then replace the zero address:

```bash
VITE_DONEDOT_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production files will be in `dist/`.

## Contract categories

The app writes one small integer to the contract:

- `0` - Shipped
- `1` - Learned
- `2` - Moved
- `3` - Created
- `4` - Helped
- `5` - Reset

The contract stores per-wallet totals, last stamped timestamp, last category,
category counts, and the global dot count.
