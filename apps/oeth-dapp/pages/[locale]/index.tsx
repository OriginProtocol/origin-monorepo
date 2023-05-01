import { ErrorBoundary, TokenSwap } from '@originprotocol/ui';
import { contracts } from '@originprotocol/web3';
import { useTranslation } from 'next-i18next';
import pick from 'lodash/pick';
import { BigNumber } from 'ethers';
import { useEthUsdPrice } from '@originprotocol/hooks';
import { getStaticPaths, makeStaticProps } from '../../lib/getStatic';
import { DAPP_TOKENS, STORED_TOKEN_LS_KEY } from '../../src/constants';

const canUseOETHVault = ({ mode, fromToken, toToken }) => {
  if (mode === 'MINT') {
    // Cant use ETH or sfrxETH
    // Can use WETH, stETH, rETH, frxETH
    return (
      !['ETH', contracts.mainnet.sfrxETH.symbol].includes(fromToken?.symbol) &&
      [
        contracts.mainnet.WETH.symbol,
        contracts.mainnet.stETH.symbol,
        contracts.mainnet.rETH.symbol,
        contracts.mainnet.frxETH.symbol,
      ].includes(fromToken?.symbol)
    );
  } else if (mode === 'REDEEM') {
    // Can only return a MIX of tokens
    return ['OETH_MIX'].includes(toToken?.symbol);
  }
};

const canUseZapper = ({ mode, fromToken }) => {
  // Must be MINT and needs to be ETH or sfrxETH
  return (
    mode === 'MINT' &&
    ['ETH', contracts.mainnet.sfrxETH.symbol].includes(fromToken?.symbol)
  );
};

const canUseCurve = ({ mode, toToken, fromToken }) => {
  // Cant be Redeem & Mix, ETH
  return !(mode === 'REDEEM' && ['OETH_MIX'].includes(toToken?.symbol));
};

const canUseFlipper = ({ mode, toToken }) => {
  // Cant be Redeem & Mix, ETH
  return !(mode === 'REDEEM' && ['OETH_MIX'].includes(toToken?.symbol));
};

const canUseUniswapV3 = ({ mode, toToken }) => {
  // Cant be Redeem & Mix, ETH
  return !(mode === 'REDEEM' && ['OETH_MIX'].includes(toToken?.symbol));
};

const canUseUniswapV2 = ({ mode, toToken }) => {
  // Cant be Redeem & Mix, ETH
  return !(mode === 'REDEEM' && ['OETH_MIX'].includes(toToken?.symbol));
};

const canUseSushiSwap = ({ mode, toToken }) => {
  // Cant be Redeem & Mix, ETH
  return !(mode === 'REDEEM' && ['OETH_MIX'].includes(toToken?.symbol));
};

const Swap = () => {
  const { t } = useTranslation(['common', 'swap']);

  // Get current ETH in USD
  const [{ formatted: usdConversionPrice }] = useEthUsdPrice();

  return (
    <ErrorBoundary>
      <TokenSwap
        i18n={t}
        tokens={pick(contracts.mainnet, DAPP_TOKENS)}
        estimatesBy={{
          vault: {
            contract: contracts.mainnet.OETHVaultProxy,
            token: contracts.mainnet.OETH,
            canEstimateSwap: canUseOETHVault,
          },
          zapper: {
            contract: contracts.mainnet.OETHZapper,
            canEstimateSwap: canUseZapper,
          },
          curve: {
            contract: contracts.mainnet.CurveAddressProvider,
            canEstimateSwap: canUseCurve,
          },
          flipper: {
            contract: contracts.mainnet.Flipper,
            canEstimateSwap: canUseFlipper,
          },
          uniswapV3: {
            contract: contracts.mainnet.UniswapV3Router,
            canEstimateSwap: canUseUniswapV3,
          },
          uniswapV2: {
            contract: contracts.mainnet.UniswapV2Router,
            canEstimateSwap: canUseUniswapV2,
          },
          sushiswap: {
            contract: contracts.mainnet.SushiSwapRouter,
            canEstimateSwap: canUseSushiSwap,
          },
        }}
        supportedSwapTokens={[
          'ETH',
          contracts.mainnet.OETH.symbol,
          contracts.mainnet.WETH.symbol,
          contracts.mainnet.stETH.symbol,
          contracts.mainnet.rETH.symbol,
          contracts.mainnet.frxETH.symbol,
          contracts.mainnet.sfrxETH.symbol,
        ]}
        additionalRedeemTokens={{
          OETH_MIX: {
            name: 'Mixed Redeem',
            symbol: 'OETH_MIX',
            symbolAlt: 'Mix',
            mix: [
              contracts.mainnet.frxETH.symbol,
              contracts.mainnet.rETH.symbol,
              contracts.mainnet.stETH.symbol,
              contracts.mainnet.WETH.symbol,
            ],
            balanceOf: BigNumber.from(0),
          },
        }}
        storageKey={STORED_TOKEN_LS_KEY}
        usdConversionPrice={usdConversionPrice}
      />
    </ErrorBoundary>
  );
};

const getStaticProps = makeStaticProps(['common', 'swap']);

export { getStaticPaths, getStaticProps };

export default Swap;
