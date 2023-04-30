# Origin Monorepo

## Requirements
- Node Version
  - Recommended: `^16.0.0`
- Web3 Wallet
  - Recommended: [Metamask](https://metamask.io/) 

---

## Installation
```bash
# Clone the origin-dollar project
git clone git@github.com:OriginProtocol/origin-monorepo.git
```  

---

## Description

The `origin-monorepo` project is a monorepo that deploys `dApps` and packages used by the Origin Protocol team.

### Configure Web3 Wallet
You will need a web3 wallet to interact with the dApp and sign transactions. Below are the instructions to setup `Metamask` to interact with the dApp running locally.

- Install `Metamask` Chrome extension [HERE](https://metamask.io/)
- Create/Open `Metamask` wallet
- Add a custom RPC endpoint 
  - Name: `origin` - just an example
  - URL: `http://localhost:8545`
  - Chain ID: `1337`
<br/><br/>

### Running apps

Open a separate terminal to run the dApp in.

```bash

# Install the dependencies
yarn install

# Example Running OETH dApp
# Copy environment basis for dApp to run
cd /apps/oeth-dapp && cp dev.env .env

# Start the dApp of choice by dapp id
yarn run dev:oeth-dapp # Port 4201 by default
```
- Based on configuration you may need to run a node instance (e.g, For localhost, you can fork Mainnet) from [Origin Dollar](https://github.com/OriginProtocol/origin-dollar/)
- Open http://localhost:4201 in your browser and connect your `Metamask` account. See [this section](#configure-web3-wallet) for instructions if you have not done that yet.

If you see a `Runtime Error: underlying network changed`, then rename `dApp/dev.env` to `.env` and restart `yarn`

## Contributing
Want to contribute to Origin? Awesome!

Origin creates Open Source projects and we welcome contributions of all sorts. There are many ways to help, from reporting issues, contributing to the code, and helping us improve our community.

The best way to get involved is to join the Origin Protocol [discord server](https://discord.gg/jyxpUSe) and head over to the channel named ORIGIN DOLLAR & DEFI


