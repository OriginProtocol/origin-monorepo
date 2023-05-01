type ContractConfig = {
  name: string;
  abi: any;
  address: `0x${string}`;
  decimals?: number;
  symbol?: string;
};

type ChainContracts = {
  [key: string]: ContractConfig;
};

type Contracts = {
  [key: string]: ChainContracts;
};

export const contracts: Contracts = {
  mainnet: {
    OETHZapper: {
      name: 'OETH Zapper',
      address: '0x9858e47bcbbe6fbac040519b02d7cd4b2c470c66',
      abi: require('../generated/OETHZapper.json'),
    },
    OETHVaultProxy: {
      name: 'Origin Vault',
      address: '0x39254033945AA2E4809Cc2977E7087BEE48bd7Ab',
      abi: require('../generated/OETHVaultProxy.json'),
    },
    woETH: {
      name: 'Wrapped OETH',
      symbol: 'woETH',
      address: '0xdcee70654261af21c44c093c300ed3bb97b78192',
      abi: require('../generated/woETH.json'),
    },
    OUSD: {
      name: 'Origin Dollar',
      symbol: 'OUSD',
      address: '0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86',
      abi: require('../generated/OUSD.json'),
    },
    WOUSD: {
      name: 'Wrapped OUSD',
      symbol: 'WOUSD',
      address: '0xD2af830E8CBdFed6CC11Bab697bB25496ed6FA62',
      abi: require('../generated/WOUSD.json'),
    },
    OETH: {
      name: 'Origin Ether',
      symbol: 'OETH',
      address: '0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3',
      abi: require('../generated/OETH.json'),
    },
    OGN: {
      name: 'OriginToken',
      address: '0x8207c1ffc5b6804f6024322ccf34f29c3541ae26',
      symbol: 'OGN',
      abi: require('../generated/OGN.json'),
    },
    OGV: {
      name: 'Origin Dollar Governance',
      address: '0x9c354503C38481a7A7a51629142963F98eCC12D0',
      symbol: 'OGV',
      abi: require('../generated/OGV.json'),
    },
    veOGV: {
      name: 'Vote Escrowed Origin Dollar Governance',
      address: '0x0C4576Ca1c365868E162554AF8e385dc3e7C66D9',
      symbol: 'veOGV',
      abi: require('../generated/veOGV.json'),
    },
    RewardsSource: {
      name: 'RewardsSource',
      address: '0x7d82e86cf1496f9485a8ea04012afeb3c7489397',
      abi: require('../generated/RewardsSource.json'),
    },
    OptionalLockupDistributor: {
      name: 'OptionalLockupDistributor',
      address: '0x7aE2334f12a449895AD21d4c255D9DE194fe986f',
      abi: require('../generated/OptionalLockupDistributor.json'),
    },
    MandatoryLockupDistributor: {
      name: 'MandatoryLockupDistributor',
      address: '0xD667091c2d1DCc8620f4eaEA254CdFB0a176718D',
      abi: require('../generated/MandatoryLockupDistributor.json'),
    },
    OpenOracle: {
      name: 'Open Oracle',
      address: '0x9b8eb8b3d6e2e0db36f41455185fef7049a35cae',
      abi: require('../generated/OpenOracle.json'),
    },
    SushiSwapRouter: {
      name: 'Sushi Swap',
      address: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
      abi: require('../generated/SushiSwapRouter.json'),
    },
    UniswapV2Router: {
      name: 'Uniswap V2',
      address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      abi: require('../generated/UniswapV2Router.json'),
    },
    UniswapDAI_ETH: {
      name: 'UniswapDAI_ETH',
      address: '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11',
      abi: require('../generated/UniswapDAI_ETH.json'),
    },
    UniswapUSDC_ETH: {
      name: 'UniswapUSDC_ETH',
      address: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
      abi: require('../generated/UniswapUSDC_ETH.json'),
    },
    UniswapUSDT_ETH: {
      name: 'UniswapUSDT_ETH',
      address: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
      abi: require('../generated/UniswapUSDT_ETH.json'),
    },
    UniswapV3Router: {
      name: 'Uniswap V3',
      address: '0xe592427a0aece92de3edee1f18e0157c05861564',
      abi: require('../generated/UniswapV3Router.json'),
    },
    UniswapV3Quoter: {
      name: 'Uniswap V3 Quoter',
      address: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
      abi: require('../generated/UniswapV3Quoter.json'),
    },
    UniswapV3OUSD_USDT: {
      name: 'UniswapV3OUSD_USDT',
      address: '0x129360c964e2e13910d603043f6287e5e9383374',
      abi: null,
    },
    UniswapV3DAI_USDT: {
      name: 'UniswapV3DAI_USDT',
      address: '0x6f48eca74b38d2936b02ab603ff4e36a6c0e3a77',
      abi: null,
    },
    UniswapV3USDC_USDT: {
      name: 'UniswapV3USDC_USDT',
      address: '0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf',
      abi: require('../generated/UniswapV3USDC_USDT.json'),
    },
    Flipper: {
      name: 'Flipper',
      address: '0xcecaD69d7D4Ed6D52eFcFA028aF8732F27e08F70',
      abi: require('../generated/Flipper.json'),
    },
    ChainlinkUSDT_ETH: {
      name: 'ChainlinkUSDT_ETH',
      address: '0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46',
      abi: require('../generated/ChainlinkUSDT_ETH.json'),
    },
    ChainlinkUSDC_ETH: {
      name: 'ChainlinkUSDC_ETH',
      address: '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4',
      abi: require('../generated/ChainlinkUSDC_ETH.json'),
    },
    ChainlinkDAI_ETH: {
      name: 'ChainlinkDAI_ETH',
      address: '0x773616E4d11A78F511299002da57A0a94577F1f4',
      abi: require('../generated/ChainlinkDAI_ETH.json'),
    },
    ChainlinkETH_USD: {
      name: 'ChainlinkETH_USD',
      address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      abi: require('../generated/ChainlinkETH_USD.json'),
    },
    ChainlinkFAST_GAS: {
      name: 'ChainlinkFAST_GAS',
      address: '0x169E633A2D1E6c10dD91238Ba11c4A708dfEF37C',
      abi: require('../generated/ChainlinkFAST_GAS.json'),
    },
    WETH: {
      name: 'Wrapped Ether',
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      symbol: 'WETH',
      abi: require('../generated/WETH.json'),
    },
    VaultProxy: {
      name: 'Origin Vault',
      address: '0xE75D77B1865Ae93c7eaa3040B038D7aA7BC02F70',
      abi: require('../generated/VaultProxy.json'),
    },
    Vault: {
      name: 'Vault',
      address: '0x328d15f6b5eba1c30cde1a5f1f5a9e35b07f5424',
      abi: require('../generated/Vault.json'),
    },
    CompoundStrategyProxy: {
      name: 'CompoundStrategyProxy',
      address: '0x12115A32a19e4994C2BA4A5437C22CEf5ABb59C3',
      abi: require('../generated/CompoundStrategyProxy.json'),
    },
    CompoundStrategy: {
      name: 'CompoundStrategy',
      address: '0xFaf23Bd848126521064184282e8AD344490BA6f0',
      abi: require('../generated/CompoundStrategy.json'),
    },
    CurveUSDCStrategyProxy: {
      name: 'CurveUSDCStrategyProxy',
      address: '0x67023c56548BA15aD3542E65493311F19aDFdd6d',
      abi: require('../generated/CurveUSDCStrategyProxy.json'),
    },
    CurveUSDCStrategy: {
      name: 'CurveUSDCStrategy',
      address: '0x96E89b021E4D72b680BB0400fF504eB5f4A24327',
      abi: null,
    },
    CurveUSDTStrategyProxy: {
      name: 'CurveUSDTStrategyProxy',
      address: '0xe40e09cD6725E542001FcB900d9dfeA447B529C0',
      abi: require('../generated/CurveUSDTStrategyProxy.json'),
    },
    CurveUSDTStrategy: {
      name: 'CurveUSDTStrategy',
      address: '0x75Bc09f72db1663Ed35925B89De2b5212b9b6Cb3',
      abi: null,
    },
    CurveRegistryExchange: {
      name: 'Curve',
      address: '0x0',
      abi: require('../generated/CurveRegistryExchange.json'),
    },
    CurveAddressProvider: {
      name: 'Curve',
      address: '0x0000000022d53366457f9d5e68ec105046fc4383',
      abi: require('../generated/CurveAddressProvider.json'),
    },
    CurveOUSDMetaPool: {
      name: 'Curve.fi Factory USD Metapool',
      address: '0x87650D7bbfC3A9F10587d7778206671719d9910D',
      abi: require('../generated/CurveOUSDMetaPool.json'),
    },
    CurveOETHMetaPool: {
      name: 'Curve.fi Factory Pool',
      address: '0x94b17476a93b3262d87b9a326965d1e91f9c13e7',
      abi: require('../generated/CurveOETHMetaPool.json'),
    },
    CurveGaugeController: {
      name: 'CurveGaugeController',
      address: '0x2f50d538606fa9edd2b11e2446beb18c9d5846bb',
      abi: require('../generated/CurveGaugeController.json'),
    },
    CurveOUSDFactoryGauge: {
      name: 'CurveOUSDFactoryGauge',
      address: '0x25f0cE4E2F8dbA112D9b115710AC297F816087CD',
      abi: require('../generated/CurveOUSDFactoryGauge.json'),
    },
    MixOracle: {
      name: 'MixOracle',
      address: '0x4d4f5e7a1FE57F5cEB38BfcE8653EFFa5e584458',
      abi: require('../generated/MixOracle.json'),
    },
    ChainlinkOracle: {
      name: 'ChainlinkOracle',
      address: '0x8DE3Ac42F800a1186b6D70CB91e0D6876cC36759',
      abi: require('../generated/ChainlinkOracle.json'),
    },
    UniswapOracle: {
      name: 'UniswapOracle',
      address: '0xc15169Bad17e676b3BaDb699DEe327423cE6178e',
      abi: require('../generated/UniswapOracle.json'),
    },
    CompensationClaims: {
      name: 'CompensationClaims',
      address: '0x9C94df9d594BA1eb94430C006c269C314B1A8281',
      abi: require('../generated/CompensationClaims.json'),
    },
    cUSDT: {
      name: 'Compound USDT',
      symbol: 'cUSDT',
      address: '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
      abi: require('../generated/cUSDT.json'),
    },
    cUSDC: {
      name: 'Compound USD Coin',
      symbol: 'cUSDC',
      address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
      abi: require('../generated/cUSDC.json'),
    },
    cDAI: {
      name: 'Compound Dai',
      symbol: 'cDAI',
      address: '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',
      abi: require('../generated/cDAI.json'),
    },
    COMP: {
      name: 'COMP',
      symbol: 'COMP',
      address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
      abi: require('../generated/COMP.json'),
    },
    Aave: {
      name: 'LendingPoolAddressesProvider',
      symbol: 'Aave',
      address: '0x24a42fD28C976A61Df5D00D0599C34c4f90748c8',
      abi: require('../generated/Aave.json'),
    },
    aTUSD: {
      name: 'Aave Interest bearing TUSD',
      symbol: 'aTUSD',
      address: '0x4DA9b813057D04BAef4e5800E36083717b4a0341',
      abi: require('../generated/aTUSD.json'),
    },
    aUSDT: {
      name: 'Aave Interest bearing USDT',
      symbol: 'aUSDT',
      address: '0x71fc860F7D3A592A4a98740e39dB31d25db65ae8',
      abi: require('../generated/aUSDT.json'),
    },
    DAI: {
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      abi: require('../generated/DAI.json'),
    },
    USDC: {
      name: 'USD Coin',
      symbol: 'USDC',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      abi: require('../generated/USDC.json'),
    },
    TUSD: {
      name: 'TrueUSD ',
      symbol: 'TUSD',
      address: '0x0000000000085d4780B73119b644AE5ecd22b376',
      abi: require('../generated/TUSD.json'),
    },
    USDT: {
      name: 'Tether USD',
      symbol: 'USDT',
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      abi: require('../generated/USDT.json'),
    },
    stETH: {
      name: 'Liquid staked Ether 2.0',
      symbol: 'stETH',
      address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
      abi: require('../generated/stETH.json'),
    },
    rETH: {
      name: 'Rocket Pool ETH',
      symbol: 'rETH',
      address: '0xae78736cd615f374d3085123a210448e74fc6393',
      abi: require('../generated/rETH.json'),
    },
    sfrxETH: {
      name: 'Staked Frax Ether',
      symbol: 'sfrxETH',
      address: '0xac3e018457b222d93114458476f3e3416abbe38f',
      abi: require('../generated/sfrxETH.json'),
    },
    frxETH: {
      name: 'Frax Ether',
      symbol: 'frxETH',
      address: '0x5E8422345238F34275888049021821E8E08CAa1f',
      abi: require('../generated/frxETH.json'),
    },
  },
};
