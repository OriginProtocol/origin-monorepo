import { ErrorBoundary, TokenSwap } from '@originprotocol/ui';
import { contracts } from '@originprotocol/web3';
import { useTranslation } from 'next-i18next';
import pick from 'lodash/pick';
import { BigNumber } from 'ethers';
import { getStaticPaths, makeStaticProps } from '../../lib/getStatic';
import { DAPP_TOKENS, STORED_TOKEN_LS_KEY } from '../../src/constants';

const canUseOUSDVault = ({ mode, fromToken, toToken }) => {
  if (mode === 'MINT') {
    return [
      contracts.mainnet.DAI.symbol,
      contracts.mainnet.USDT.symbol,
      contracts.mainnet.USDC.symbol,
    ].includes(fromToken?.symbol);
  } else if (mode === 'REDEEM') {
    // Can only return a MIX of tokens
    return ['MIX'].includes(toToken?.symbol);
  }
};

const canUseCurve = ({ mode, toToken }) => {
  // Cant be Redeem & Mix, ETH
  return !(mode === 'REDEEM' && ['MIX'].includes(toToken?.symbol));
};

const canUseFlipper = ({ mode, toToken }) => {
  // Cant be Redeem & Mix, ETH
  return !(mode === 'REDEEM' && ['MIX'].includes(toToken?.symbol));
};

const canUseUniswapV3 = ({ mode, toToken }) => {
  // Cant be Redeem & Mix, ETH
  return !(mode === 'REDEEM' && ['MIX'].includes(toToken?.symbol));
};

const canUseUniswapV2 = ({ mode, toToken }) => {
  // Cant be Redeem & Mix, ETH
  return !(mode === 'REDEEM' && ['MIX'].includes(toToken?.symbol));
};

const canUseSushiSwap = ({ mode, toToken }) => {
  // Cant be Redeem & Mix, ETH
  return !(mode === 'REDEEM' && ['MIX'].includes(toToken?.symbol));
};

const Swap = () => {
  const { t } = useTranslation(['common', 'swap']);
  return (
    <ErrorBoundary>
      <TokenSwap
        i18n={t}
        tokens={pick(contracts.mainnet, DAPP_TOKENS)}
        estimatesBy={{
          vault: {
            contract: contracts.mainnet.VaultProxy,
            token: contracts.mainnet.OUSD,
            canEstimateSwap: canUseOUSDVault,
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
          contracts.mainnet.OUSD.symbol,
          contracts.mainnet.DAI.symbol,
          contracts.mainnet.USDC.symbol,
          contracts.mainnet.USDT.symbol,
        ]}
        additionalRedeemTokens={{
          MIX: {
            name: 'Mixed Redeem',
            symbol: 'MIX',
            symbolAlt: 'Mix',
            mix: [
              contracts.mainnet.USDT.symbol,
              contracts.mainnet.USDC.symbol,
              contracts.mainnet.DAI.symbol,
            ],
            balanceOf: BigNumber.from(0),
          },
        }}
        storageKey={STORED_TOKEN_LS_KEY}
        usdConversionPrice={1}
      />
    </ErrorBoundary>
  );
};

const getStaticProps = makeStaticProps(['common', 'swap']);

export { getStaticPaths, getStaticProps };

export default Swap;
