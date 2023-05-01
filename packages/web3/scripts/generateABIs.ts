/* tslint:disable */
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const abiMapping = {
  mainnet: {
    OETHZapper: '0x9858e47bcbbe6fbac040519b02d7cd4b2c470c66',
    OETHVaultProxy: '0x39254033945AA2E4809Cc2977E7087BEE48bd7Ab',
    woETH: '0xdcee70654261af21c44c093c300ed3bb97b78192',
    OUSD: '0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86',
    WOUSD: '0xD2af830E8CBdFed6CC11Bab697bB25496ed6FA62',
    OETH: '0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3',
    OGN: '0x8207c1ffc5b6804f6024322ccf34f29c3541ae26',
    OGV: '0x9c354503C38481a7A7a51629142963F98eCC12D0',
    veOGV: '0x0C4576Ca1c365868E162554AF8e385dc3e7C66D9',
    RewardsSource: '0x7d82e86cf1496f9485a8ea04012afeb3c7489397',
    OptionalLockupDistributor: '0x7aE2334f12a449895AD21d4c255D9DE194fe986f',
    MandatoryLockupDistributor: '0xD667091c2d1DCc8620f4eaEA254CdFB0a176718D',
    OpenOracle: '0x9b8eb8b3d6e2e0db36f41455185fef7049a35cae',
    SushiSwapRouter: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    UniswapV2Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    UniswapDAI_ETH: '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11',
    UniswapUSDC_ETH: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
    UniswapUSDT_ETH: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
    UniswapV3Router: '0xe592427a0aece92de3edee1f18e0157c05861564',
    UniswapV3Quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
    UniswapV3OUSD_USDT: '0x129360c964e2e13910d603043f6287e5e9383374',
    UniswapV3DAI_USDT: '0x6f48eca74b38d2936b02ab603ff4e36a6c0e3a77',
    UniswapV3USDC_USDT: '0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf',
    Flipper: '0xcecaD69d7D4Ed6D52eFcFA028aF8732F27e08F70',
    ChainlinkUSDT_ETH: '0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46',
    ChainlinkUSDC_ETH: '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4',
    ChainlinkDAI_ETH: '0x773616E4d11A78F511299002da57A0a94577F1f4',
    ChainlinkETH_USD: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    ChainlinkFAST_GAS: '0x169E633A2D1E6c10dD91238Ba11c4A708dfEF37C',
    WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    VaultProxy: '0xE75D77B1865Ae93c7eaa3040B038D7aA7BC02F70',
    Vault: '0x328d15f6b5eba1c30cde1a5f1f5a9e35b07f5424',
    CompoundStrategyProxy: '0x12115A32a19e4994C2BA4A5437C22CEf5ABb59C3',
    CompoundStrategy: '0xFaf23Bd848126521064184282e8AD344490BA6f0',
    CurveUSDCStrategyProxy: '0x67023c56548BA15aD3542E65493311F19aDFdd6d',
    CurveUSDCStrategy: '0x96E89b021E4D72b680BB0400fF504eB5f4A24327',
    CurveUSDTStrategyProxy: '0xe40e09cD6725E542001FcB900d9dfeA447B529C0',
    CurveUSDTStrategy: '0x75Bc09f72db1663Ed35925B89De2b5212b9b6Cb3',
    CurveAddressProvider: '0x0000000022d53366457f9d5e68ec105046fc4383',
    CurveOUSDMetaPool: '0x87650D7bbfC3A9F10587d7778206671719d9910D',
    CurveGaugeController: '0x2f50d538606fa9edd2b11e2446beb18c9d5846bb',
    CurveOUSDFactoryGauge: '0x25f0cE4E2F8dbA112D9b115710AC297F816087CD',
    MixOracle: '0x4d4f5e7a1FE57F5cEB38BfcE8653EFFa5e584458',
    ChainlinkOracle: '0x8DE3Ac42F800a1186b6D70CB91e0D6876cC36759',
    UniswapOracle: '0xc15169Bad17e676b3BaDb699DEe327423cE6178e',
    CompensationClaims: '0x9C94df9d594BA1eb94430C006c269C314B1A8281',
    cUSDT: '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
    cUSDC: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
    cDAI: '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',
    COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    Aave: '0x24a42fD28C976A61Df5D00D0599C34c4f90748c8',
    aTUSD: '0x4DA9b813057D04BAef4e5800E36083717b4a0341',
    aUSDT: '0x71fc860F7D3A592A4a98740e39dB31d25db65ae8',
    DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    TUSD: '0x0000000000085d4780B73119b644AE5ecd22b376',
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    stETH: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    rETH: '0xae78736cd615f374d3085123a210448e74fc6393',
    sfrxETH: '0xac3e018457b222d93114458476f3e3416abbe38f',
    frxETH: '0x5E8422345238F34275888049021821E8E08CAa1f',
  },
};

// ADD VARIABLES TO GENERATE
const etherscanAPIKey = '';
const ethProviderUrl = '';

(async function () {
  const abis = Object.keys(abiMapping.mainnet);

  if (!etherscanAPIKey) {
    return console.error('Add Etherscan API key to generate');
  } else if (!ethProviderUrl) {
    return console.error('Add RPC Provider to generate');
  }

  for (let i = 0; i < abis.length; i++) {
    let contractName;
    let contractAddress;

    try {
      contractName = abis[i];
      contractAddress = abiMapping.mainnet[contractName];

      const response = await fetch(
        `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${etherscanAPIKey}`
      );

      if (!response.ok) {
        throw new Error('Response not ok');
      }

      const data = await response.json();

      let abi = data.result;

      if (!abi) {
        console.error(`Issue fetching abi for ${contractName}, skipping`);
        return;
      }

      // Proxy
      const implementationName = JSON.parse(abi).find(
        (item) => item.name === 'implementation'
      )?.name;

      if (implementationName) {
        try {
          console.log('Proxy found', contractName);
          const provider = new ethers.providers.JsonRpcProvider(ethProviderUrl);
          const proxyContract = new ethers.Contract(
            contractAddress,
            abi,
            provider
          );
          const implementationAddress = await proxyContract['implementation']();
          const response = await fetch(
            `https://api.etherscan.io/api?module=contract&action=getabi&address=${implementationAddress}&apikey=${etherscanAPIKey}`
          );

          if (!response.ok) {
            throw new Error('Response not ok');
          }

          const data = await response.json();
          abi = data.result;
        } catch (e) {
          console.error(
            `Issue fetching impl address for ${contractName}, skipping`
          );
          return;
        }
      }
      // Write out json
      fs.writeFileSync(
        path.resolve(`./packages/web3/generated/${contractName}.json`),
        abi
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (e) {
      console.error(`Issue fetching base abi for ${contractName}, skipping`);
      return;
    }
  }

  console.log('Completed');
})();
