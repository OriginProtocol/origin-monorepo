import { ErrorBoundary, WrapToken } from '@originprotocol/ui';
import { useTranslation } from 'next-i18next';
import { contracts } from '@originprotocol/web3';
import { useEthUsdPrice } from '@originprotocol/hooks';
import { getStaticPaths, makeStaticProps } from '../../lib/getStatic';
import { STORED_WRAPPED_LS_KEY } from '../../src/constants';

const Wrap = () => {
  const { t } = useTranslation(['common', 'wrap']);
  // Get current ETH in USD
  const [{ formatted: usdConversionPrice }] = useEthUsdPrice();
  return (
    <ErrorBoundary>
      <WrapToken
        i18n={t}
        unwrappedToken={contracts.mainnet.OETH}
        wrappedToken={contracts.mainnet.woETH}
        emptyState={{
          description: t('description', { ns: 'wrap' }),
          cta: t('learnMore', { ns: 'wrap' }),
          externalHref: 'https://www.oeth.com',
        }}
        storageKey={STORED_WRAPPED_LS_KEY}
        usdConversionPrice={usdConversionPrice}
      />
    </ErrorBoundary>
  );
};

const getStaticProps = makeStaticProps(['common', 'wrap']);

export { getStaticPaths, getStaticProps };

export default Wrap;
