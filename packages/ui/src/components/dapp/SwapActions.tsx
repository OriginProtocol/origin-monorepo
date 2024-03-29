import { useEffect, useState } from 'react';
import cx from 'classnames';
import {
  useContractWrite,
  useNetwork,
  useSwitchNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from '@originprotocol/hooks';
import { parseUnits, MaxUint256 } from '@originprotocol/utils';
import { isEmpty } from 'lodash';
import { SWAP_TYPES } from '../../constants';

type SuccessContext = {
  context: any;
};

type ActionsProps = {
  i18n: any;
  swap: any;
  translationContext: any;
  onSuccess: (a: string, b: SuccessContext) => void;
  onRefresh: any;
  selectedToken?: any;
  isLoadingEstimate: boolean;
};

type SwapActionsProps = {
  i18n: any;
  swap: any;
  selectedToken: any;
  estimatedToken: any;
  onSuccess: (a: string, b: SuccessContext) => void;
  onRefresh: any;
  targetContract: any;
  isLoadingEstimate: boolean;
};

const EXPECTED_CHAIN_ID = parseInt(
  process.env['NEXT_PUBLIC_ETHEREUM_RPC_CHAIN_ID'] || '1',
  10
);

const MintableActions = ({
  i18n,
  swap,
  translationContext,
  onSuccess,
  onRefresh,
  isLoadingEstimate,
}: ActionsProps) => {
  const [error, setError] = useState('');
  const { selectedEstimate } = swap || {};
  const { hasProvidedAllowance, prepareParams } = selectedEstimate || {};

  const { config: swapWriteConfig, error: swapWriteError } =
    usePrepareContractWrite(prepareParams);

  const {
    data: swapWriteData,
    isLoading: swapWriteIsLoading,
    write: swapWrite,
    // @ts-ignore
  } = useContractWrite(swapWriteConfig);

  const { isLoading: snapWriteIsSubmitted, isSuccess: snapWriteIsSuccess } =
    useWaitForTransaction({
      hash: swapWriteData?.hash,
    });

  useEffect(() => {
    if (snapWriteIsSuccess && onSuccess) {
      onSuccess('MINTED', { context: swapWriteData });
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

  const swapWriteDisabled =
    isLoadingEstimate ||
    !hasProvidedAllowance ||
    !!swapWriteError ||
    !swapWrite;

  return (
    <div className="flex flex-col space-y-4">
      {error && (
        <span role="alert" className="text-origin-secondary text-sm">
          {i18n(`errors.${error}`, translationContext)}
        </span>
      )}
      <button
        className={cx(
          'flex items-center justify-center w-full h-[64px] text-base lg:h-[72px] lg:text-xl bg-gradient-to-r from-gradient2-from to-gradient2-to rounded-xl',
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
            return i18n('swap.PENDING', {
              ns: 'swap',
              ...translationContext,
            });
          } else if (snapWriteIsSubmitted) {
            return i18n('swap.SUBMITTED', {
              ns: 'swap',
              ...translationContext,
            });
          } else if (snapWriteIsSuccess) {
            return i18n('swap.SUCCESS', {
              ns: 'swap',
              ...translationContext,
            });
          } else {
            return i18n('swap.DEFAULT', {
              ns: 'swap',
              ...translationContext,
            });
          }
        })()}
      </button>
    </div>
  );
};

const RedeemActions = ({
  i18n,
  swap,
  translationContext,
  onSuccess,
  isLoadingEstimate,
}: ActionsProps) => {
  const [error, setError] = useState('');
  const { selectedEstimate } = swap || {};
  const { prepareParams } = selectedEstimate || {};

  const { config: swapWriteConfig, error: swapWriteError } =
    usePrepareContractWrite(prepareParams);

  const {
    data: swapWriteData,
    isLoading: swapWriteIsLoading,
    write: swapWrite,
    // @ts-ignore
  } = useContractWrite(swapWriteConfig);

  const { isLoading: snapWriteIsSubmitted, isSuccess: snapWriteIsSuccess } =
    useWaitForTransaction({
      hash: swapWriteData?.hash,
    });

  useEffect(() => {
    if (snapWriteIsSuccess && onSuccess) {
      onSuccess('REDEEM', { context: swapWriteData });
    }
  }, [snapWriteIsSuccess]);

  useEffect(() => {
    if (!isEmpty(swapWriteError)) {
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

  const swapWriteDisabled =
    isLoadingEstimate || !isEmpty(swapWriteError) || !swapWrite;

  return (
    <div className="flex flex-col space-y-4">
      {error && (
        <span role="alert" className="text-origin-secondary text-sm">
          {i18n(`errors.${error}`, translationContext)}
        </span>
      )}
      <button
        className={cx(
          'flex items-center justify-center w-full h-[64px] text-base lg:h-[72px] lg:text-xl bg-gradient-to-r from-gradient2-from to-gradient2-to rounded-xl',
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
            return i18n('redeem.PENDING', {
              ns: 'swap',
              ...translationContext,
            });
          } else if (snapWriteIsSubmitted) {
            return i18n('redeem.SUBMITTED', {
              ns: 'swap',
              ...translationContext,
            });
          } else if (snapWriteIsSuccess) {
            return i18n('redeem.SUCCESS', {
              ns: 'swap',
              ...translationContext,
            });
          } else {
            return i18n('redeem.DEFAULT', {
              ns: 'swap',
              ...translationContext,
            });
          }
        })()}
      </button>
    </div>
  );
};

const SwapActions = ({
  i18n,
  swap,
  selectedToken,
  estimatedToken,
  onSuccess,
  targetContract,
  onRefresh,
  isLoadingEstimate,
}: SwapActionsProps) => {
  const { chain } = useNetwork();
  const { chains, switchNetwork } = useSwitchNetwork();
  const { mode, selectedEstimate, value } = swap || {};
  const { error, hasProvidedAllowance, contract } = selectedEstimate || {};
  const isMint = mode === SWAP_TYPES.MINT;
  const parsedValue = !value ? 0 : parseFloat(value);
  const invalidInputValue =
    !parsedValue || isNaN(parsedValue) || !targetContract;

  const translationContext = {
    targetContractName: targetContract?.name || 'Unknown',
    sourceTokenName: selectedToken?.symbol,
    targetTokenName: estimatedToken?.symbol,
  };

  // Switch network if not correct chain
  if (chain?.id !== EXPECTED_CHAIN_ID) {
    return (
      <button
        className="flex items-center justify-center w-full h-[64px] text-base lg:h-[72px] lg:text-xl bg-gradient-to-r from-gradient2-from to-gradient2-to rounded-xl"
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

  const weiValue = parseUnits(
    String(value || 0),
    selectedToken?.decimals || 18
  );

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
    isLoading: allowanceWriteIsSubmitted,
    isSuccess: allowanceWriteIsSuccess,
  } = useWaitForTransaction({
    hash: allowanceWriteData?.hash,
  });

  useEffect(() => {
    if (allowanceWriteIsSuccess && onSuccess) {
      onSuccess('ALLOWANCE', { context: allowanceWriteData });
      onRefresh();
    }
  }, [allowanceWriteIsSuccess]);

  return invalidInputValue || error ? (
    <div className="flex items-center justify-center w-full h-[64px] text-base lg:h-[72px] lg:text-xl bg-gradient-to-r from-gradient2-from to-gradient2-to rounded-xl opacity-50 cursor-not-allowed">
      {i18n(
        `errors.${invalidInputValue ? 'NO_INPUT_AMOUNT' : error}`,
        translationContext
      )}
    </div>
  ) : (
    <>
      {!hasProvidedAllowance && (
        <button
          className="flex items-center justify-center w-full h-[64px] text-base lg:h-[72px] lg:text-xl bg-gradient-to-r from-gradient2-from to-gradient2-to rounded-xl"
          onClick={() => {
            allowanceWrite?.();
          }}
          disabled={!allowanceWrite}
        >
          {(() => {
            if (allowanceWriteIsLoading) {
              return i18n('approval.PENDING', {
                ns: 'swap',
                ...translationContext,
              });
            } else if (allowanceWriteIsSubmitted) {
              return i18n('approval.SUBMITTED', {
                ns: 'swap',
                ...translationContext,
              });
            } else if (allowanceWriteIsSuccess) {
              return i18n('approval.SUCCESS', {
                ns: 'swap',
                ...translationContext,
              });
            } else {
              return i18n('approval.DEFAULT', {
                ns: 'swap',
                ...translationContext,
              });
            }
          })()}
        </button>
      )}
      {isMint ? (
        <MintableActions
          i18n={i18n}
          swap={swap}
          selectedToken={selectedToken}
          translationContext={translationContext}
          onSuccess={onSuccess}
          onRefresh={onRefresh}
          isLoadingEstimate={isLoadingEstimate}
        />
      ) : (
        <RedeemActions
          i18n={i18n}
          swap={swap}
          translationContext={translationContext}
          onSuccess={onSuccess}
          onRefresh={onRefresh}
          isLoadingEstimate={isLoadingEstimate}
        />
      )}
    </>
  );
};

export default SwapActions;
