import { useEffect, useState } from 'react';
import cx from 'classnames';
import {
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
  useSwitchNetwork,
} from '@originprotocol/hooks';
import { parseUnits, MaxUint256 } from '@originprotocol/utils';
import { SWAP_TYPES } from '../../constants';

type SuccessContext = {
  context: any;
};

type ActionsProps = {
  address: `0x${string}` | string | undefined;
  i18n: any;
  swap: any;
  translationContext: any;
  onSuccess: (a: string, b: SuccessContext) => void;
  selectedToken?: any;
  onRefresh: any;
};

type WrapActionProps = {
  address: `0x${string}` | string | undefined;
  i18n: any;
  swap: any;
  selectedToken: any;
  estimatedToken: any;
  wrappedContract: any;
  onSuccess: (a: string, b: SuccessContext) => void;
  onRefresh: any;
};

const EXPECTED_CHAIN_ID = parseInt(
  process.env['NEXT_PUBLIC_ETHEREUM_RPC_CHAIN_ID'] || '1',
  10
);

const WrappedActions = ({
  address,
  i18n,
  swap,
  selectedToken,
  translationContext,
  onSuccess,
  onRefresh,
}: ActionsProps) => {
  const [error, setError] = useState('');
  const { value, selectedEstimate } = swap || {};
  const { hasProvidedAllowance, contract } = selectedEstimate || {};
  const weiValue = parseUnits(String(value), selectedToken?.decimals || 18);

  const { config: allowanceWriteConfig, error: allowanceWriteError } =
    usePrepareContractWrite({
      address: selectedToken?.address,
      abi: selectedToken?.abi,
      functionName: 'approve',
      args: [contract?.address, weiValue || MaxUint256],
      chainId: EXPECTED_CHAIN_ID,
    });

  const {
    data: allowanceWriteData,
    isLoading: allowanceWriteIsLoading,
    write: allowanceWrite,
  } = useContractWrite(allowanceWriteConfig);

  const {
    config: swapWriteConfig,
    error: swapWriteError,
    refetch: refetchWrite,
  } = usePrepareContractWrite({
    address: contract?.address,
    abi: contract?.abi,
    functionName: 'deposit',
    args: [weiValue, address],
    chainId: EXPECTED_CHAIN_ID,
    staleTime: 2_000,
  });

  const {
    data: swapWriteData,
    isLoading: swapWriteIsLoading,
    write: swapWrite,
  } = useContractWrite(swapWriteConfig);

  const swapWriteDisabled = !hasProvidedAllowance || !!swapWriteError;

  const {
    isLoading: allowanceWriteIsSubmitted,
    isSuccess: allowanceWriteIsSuccess,
  } = useWaitForTransaction({
    hash: allowanceWriteData?.hash,
  });

  useEffect(() => {
    if (allowanceWriteIsSuccess && onSuccess) {
      onSuccess('ALLOWANCE', { context: swapWriteData });
      onRefresh();
      refetchWrite();
    }
  }, [allowanceWriteIsSuccess]);

  const { isLoading: snapWriteIsSubmitted, isSuccess: snapWriteIsSuccess } =
    useWaitForTransaction({
      hash: swapWriteData?.hash,
    });

  useEffect(() => {
    if (snapWriteIsSuccess && onSuccess) {
      onSuccess('WRAPPED', { context: swapWriteData });
      onRefresh();
      setError('');
    }
  }, [snapWriteIsSuccess]);

  useEffect(() => {
    if (swapWriteError) {
      const error = 'UNPREDICTABLE_GAS_LIMIT';
      // TODO: Add more error handling
      setError(error);
    } else {
      setError('');
    }
  }, [swapWriteError]);

  const isPreparing = swapWriteIsLoading || allowanceWriteIsLoading;

  return (
    <>
      {!hasProvidedAllowance ? (
        <button
          className="flex items-center justify-center w-full h-[72px] text-xl bg-gradient-to-r from-gradient2-from to-gradient2-to rounded-xl"
          onClick={() => {
            allowanceWrite?.();
          }}
        >
          {(() => {
            if (allowanceWriteIsLoading) {
              return i18n('approval.PENDING', {
                ns: 'wrap',
                ...translationContext,
              });
            } else if (allowanceWriteIsSubmitted) {
              return i18n('approval.SUBMITTED', {
                ns: 'wrap',
                ...translationContext,
              });
            } else if (allowanceWriteIsSuccess) {
              return i18n('approval.SUCCESS', {
                ns: 'wrap',
                ...translationContext,
              });
            } else {
              return i18n('approval.DEFAULT', {
                ns: 'wrap',
                ...translationContext,
              });
            }
          })()}
        </button>
      ) : (
        !isPreparing &&
        error && (
          <span role="alert" className="text-origin-secondary text-sm">
            {i18n(`errors.${error}`, {
              ns: 'wrap',
              ...translationContext,
            })}
          </span>
        )
      )}
      <button
        className={cx(
          'flex items-center justify-center w-full h-[72px] text-xl bg-gradient-to-r from-gradient2-from to-gradient2-to rounded-xl',
          {
            'opacity-50 cursor-not-allowed': swapWriteDisabled,
          }
        )}
        onClick={() => {
          swapWrite?.();
        }}
        disabled={swapWriteDisabled}
      >
        {(() => {
          if (swapWriteIsLoading) {
            return i18n('wrap.PENDING', {
              ns: 'wrap',
              ...translationContext,
            });
          } else if (snapWriteIsSubmitted) {
            return i18n('wrap.SUBMITTED', {
              ns: 'wrap',
              ...translationContext,
            });
          } else if (snapWriteIsSuccess) {
            return i18n('wrap.SUCCESS', {
              ns: 'wrap',
              ...translationContext,
            });
          } else {
            return i18n('wrap.DEFAULT', {
              ns: 'wrap',
              ...translationContext,
            });
          }
        })()}
      </button>
    </>
  );
};

const UnwrapActions = ({
  address,
  i18n,
  swap,
  translationContext,
  onSuccess,
  onRefresh,
}: ActionsProps) => {
  const [error, setError] = useState('');
  const { value, selectedEstimate } = swap || {};
  const { contract } = selectedEstimate || {};
  const weiValue = parseUnits(String(value), 18);

  const { config: swapWriteConfig, error: swapWriteError } =
    usePrepareContractWrite({
      address: contract?.address,
      abi: contract?.abi,
      functionName: 'redeem',
      args: [weiValue, address, address],
    });

  const {
    data: swapWriteData,
    isLoading: swapWriteIsLoading,
    write: swapWrite,
  } = useContractWrite(swapWriteConfig);

  const { isLoading: snapWriteIsSubmitted, isSuccess: snapWriteIsSuccess } =
    useWaitForTransaction({
      hash: swapWriteData?.hash,
    });

  useEffect(() => {
    if (snapWriteIsSuccess && onSuccess) {
      onSuccess('UNWRAPPED', { context: swapWriteData });
      onRefresh();
      setError('');
    }
  }, [snapWriteIsSuccess]);

  useEffect(() => {
    if (swapWriteError) {
      let error = 'UNPREDICTABLE_GAS_LIMIT';
      if (
        swapWriteError?.message?.includes('Redeem amount lower than minimum')
      ) {
        error = 'REDEEM_TOO_LOW';
      }
      setError(error);
    } else {
      setError('');
    }
  }, [swapWriteError]);

  return (
    <>
      {!swapWriteIsLoading && error && (
        <span role="alert" className="text-origin-secondary text-sm">
          {i18n(`errors.${error}`, {
            ns: 'wrap',
            ...translationContext,
          })}
        </span>
      )}
      <button
        className={cx(
          'flex items-center justify-center w-full h-[72px] text-xl bg-gradient-to-r from-gradient2-from to-gradient2-to rounded-xl',
          {
            'opacity-50 cursor-not-allowed': !!swapWriteError,
          }
        )}
        onClick={() => {
          swapWrite?.();
        }}
        disabled={!!swapWriteError}
      >
        {(() => {
          if (swapWriteIsLoading) {
            return i18n('unwrap.PENDING', {
              ns: 'wrap',
              ...translationContext,
            });
          } else if (snapWriteIsSubmitted) {
            return i18n('unwrap.SUBMITTED', {
              ns: 'wrap',
              ...translationContext,
            });
          } else if (snapWriteIsSuccess) {
            return i18n('unwrap.SUCCESS', {
              ns: 'wrap',
              ...translationContext,
            });
          } else {
            return i18n('unwrap.DEFAULT', {
              ns: 'wrap',
              ...translationContext,
            });
          }
        })()}
      </button>
    </>
  );
};

const WrapActions = ({
  address,
  i18n,
  swap,
  selectedToken,
  estimatedToken,
  wrappedContract,
  onSuccess,
  onRefresh,
}: WrapActionProps) => {
  const { chain } = useNetwork();
  const { chains, switchNetwork } = useSwitchNetwork();

  const { mode, selectedEstimate, value } = swap || {};
  const { error } = selectedEstimate || {};
  const isWrap = mode === SWAP_TYPES.WRAP;
  const parsedValue = !value ? 0 : parseFloat(value);
  const invalidInputValue = !parsedValue || isNaN(parsedValue);

  const translationContext = {
    targetContractName: wrappedContract.name,
    sourceTokenName: selectedToken?.symbol,
    targetTokenName: estimatedToken?.symbol,
  };

  if (chain?.id !== EXPECTED_CHAIN_ID) {
    return (
      <button
        className="flex items-center justify-center w-full h-[72px] text-xl bg-gradient-to-r from-gradient2-from to-gradient2-to rounded-xl"
        onClick={() => {
          switchNetwork?.(EXPECTED_CHAIN_ID);
        }}
      >
        {i18n('wallet.switchNetwork', {
          networkName: chains.find(({ id }) => id === EXPECTED_CHAIN_ID)?.name,
        })}
      </button>
    );
  }

  return invalidInputValue || error ? (
    <div className="flex items-center justify-center w-full h-[72px] text-xl bg-gradient-to-r from-gradient2-from to-gradient2-to rounded-xl opacity-50 cursor-not-allowed">
      {i18n(`errors.${invalidInputValue ? 'NO_INPUT_AMOUNT' : error}`, {
        ns: 'wrap',
        ...translationContext,
      })}
    </div>
  ) : isWrap ? (
    <WrappedActions
      address={address}
      i18n={i18n}
      swap={swap}
      selectedToken={selectedToken}
      translationContext={translationContext}
      onSuccess={onSuccess}
      onRefresh={onRefresh}
    />
  ) : (
    <UnwrapActions
      address={address}
      i18n={i18n}
      swap={swap}
      translationContext={translationContext}
      onSuccess={onSuccess}
      onRefresh={onRefresh}
    />
  );
};

export default WrapActions;
