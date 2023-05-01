import { useWeb3Modal } from '@web3modal/react';
import cx from 'classnames';

type ConnectProps = {
  i18n: any;
  className?: string;
};

const Connect = ({ i18n, className }: ConnectProps) => {
  const { open } = useWeb3Modal();
  return (
    <button
      onClick={() => open()}
      className={cx(
        'h-[44px] px-6 bg-gradient-to-r from-gradient2-from to-gradient2-to rounded-full',
        className
      )}
    >
      {i18n('wallet.connect')}
    </button>
  );
};

export default Connect;
