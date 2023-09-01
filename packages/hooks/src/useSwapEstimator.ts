import { useEffect, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import {
  parseUnits,
  formatUnits,
  formatWeiBalance,
  NullAddress,
} from '@originprotocol/utils';
import { contracts } from '@originprotocol/web3';
import { useDebouncedCallback } from 'use-debounce';
import { zipObject, reduce, orderBy, pick } from 'lodash';

type UseSwapEstimatorProps = {
  address: `0x${string}` | string | undefined;
  settings: any;
  mode: string;
  fromToken: any;
  toToken: any;
  value: number;
  estimatesBy: any;
  onEstimate: any;
  usdConversionPrice: number | undefined;
};

export type SwapEstimate = {
  error?: string;
  feeData?: any;
  prepareParams: any;
  receiveAmount?: BigNumber;
  minimumAmount?: BigNumber;
  gasLimit?: number;
  contract?: any;
  hasProvidedAllowance?: boolean;
  breakdown: any;
  value: number;
};

const providerRpc = process.env['NEXT_PUBLIC_ETHEREUM_RPC_PROVIDER'];

interface EstimateError extends Error {
  data: {
    message: string;
  };
}

const curveFactoryMiniAbi = [
  {
    stateMutability: 'view',
    type: 'function',
    name: 'get_underlying_coins',
    inputs: [
      {
        name: '_pool',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address[8]',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'get_coins',
    inputs: [{ name: '_pool', type: 'address' }],
    outputs: [{ name: '', type: 'address[4]' }],
    gas: 9164,
  },
];

const curveMetapoolMiniAbi = [
  {
    name: 'exchange_underlying',
    outputs: [
      {
        type: 'uint256',
        name: '',
      },
    ],
    inputs: [
      {
        type: 'int128',
        name: 'i',
      },
      {
        type: 'int128',
        name: 'j',
      },
      {
        type: 'uint256',
        name: 'dx',
      },
      {
        type: 'uint256',
        name: 'min_dy',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'function',
    name: 'exchange',
    inputs: [
      { name: 'i', type: 'int128' },
      { name: 'j', type: 'int128' },
      { name: '_dx', type: 'uint256' },
      { name: '_min_dy', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

const handleError = (e: EstimateError, contract: any) => {
  console.error(e);

  const errorMessage = e?.data?.message || e?.message;

  if (
    errorMessage.includes('Mint amount lower than minimum') ||
    errorMessage.includes('Redeem amount lower than minimum')
  ) {
    return {
      error: 'PRICE_TOO_HIGH',
      contract,
    };
  } else if (errorMessage.includes('Asset price below peg')) {
    return {
      error: 'BELOW_PEG',
      contract,
    };
  } else if (
    errorMessage.includes('Redeem failed') ||
    errorMessage.includes('Redeem exceeds balance') ||
    errorMessage.includes("reverted with reason string '5'") ||
    errorMessage.includes('Insufficient 3CRV balance')
  ) {
    return {
      error: 'NOT_ENOUGH_LIQUIDITY',
      contract,
    };
  } else if (errorMessage.includes('No available market')) {
    return {
      error: 'NO_LIQUIDITY_POOL',
      contract,
    };
  } else if (
    errorMessage.includes('Exchange resulted in fewer coins than expected')
  ) {
    return {
      error: 'REDEEM_TOO_LOW',
      contract,
    };
  }

  return {
    error: 'UNKNOWN',
    contract,
  };
};

type EstimateToken = {
  address: `0x${string}` | string;
  abi: any;
  name: string;
  symbol: string;
  balanceOf?: BigNumber;
};

type CheckEstimateProps = {
  mode: string;
  toToken: EstimateToken;
  fromToken: EstimateToken;
};

type EstimateFnProps = {
  config: {
    contract: {
      address: `0x${string}` | string;
      abi: any;
    };
    token: EstimateToken;
    canEstimateSwap: (a: CheckEstimateProps) => boolean;
  };
  mode: string;
  toToken: EstimateToken;
  fromToken: EstimateToken;
  address: `0x${string}` | string;
  value: number;
  settings: {
    tolerance: number;
    gwei: number;
  };
};

const estimateVaultMint = async ({
  config,
  mode,
  fromToken,
  toToken,
  address,
  value,
  settings,
}: EstimateFnProps) => {
  if (!config.contract) {
    return {
      error: 'UNKNOWN',
      contract: config.contract,
    };
  } else if (
    config.canEstimateSwap &&
    !config.canEstimateSwap({
      mode,
      fromToken,
      toToken,
    })
  ) {
    return {
      error: 'UNSUPPORTED',
      contract: config.contract,
    };
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(providerRpc);

    const signer = provider.getSigner(address);

    const feeData = await provider.getFeeData();

    const fromTokenContract = new ethers.Contract(
      fromToken.address,
      fromToken.abi,
      provider
    );

    const toTokenContract = new ethers.Contract(
      toToken.address,
      toToken.abi,
      provider
    );

    const vaultContract = new ethers.Contract(
      config.contract.address,
      config.contract.abi,
      provider
    );

    const [fromTokenAllowance, fromTokenDecimals, toTokenDecimals] =
      await Promise.all([
        fromTokenContract['allowance'](address, vaultContract.address),
        fromTokenContract['decimals'](),
        toTokenContract['decimals'](),
      ]);

    const fromTokenValue = parseUnits(String(value), fromTokenDecimals);

    const hasEnoughBalance =
      fromToken?.balanceOf && fromToken?.balanceOf.gte(fromTokenValue);

    if (!hasEnoughBalance) {
      return {
        error: 'NOT_ENOUGH_BALANCE',
        contract: config.contract,
        fromToken,
      };
    }

    const foundConverter = config.contract.abi.find(
      (item: any) =>
        item.name === 'priceUnitMint' || item.name === 'priceUSDMint'
    );

    let oracleCoinPrice;

    if (foundConverter) {
      oracleCoinPrice = await vaultContract[foundConverter.name](
        fromToken.address
      );
    }

    const receiveAmount = parseUnits(
      String(
        value *
          (oracleCoinPrice
            ? parseFloat(formatUnits(oracleCoinPrice, fromTokenDecimals))
            : 1)
      ),
      toTokenDecimals
    );

    const minimumAmount = fromTokenValue.sub(
      fromTokenValue.mul(settings?.tolerance * 100).div(10000)
    );

    const hasProvidedAllowance = fromTokenAllowance.gte(fromTokenValue);

    // Needs approvals, get estimates
    if (!hasProvidedAllowance) {
      const [rebaseThreshold, autoAllocateThreshold] = await Promise.all([
        vaultContract['rebaseThreshold'](),
        vaultContract['autoAllocateThreshold'](),
      ]);

      let gasLimit = BigNumber.from(220000);

      if (fromTokenValue.gt(autoAllocateThreshold)) {
        // https://etherscan.io/tx/0x267da9abae04ae600d33d2c3e0b5772872e6138eaa074ce715afc8975c7f2deb
        gasLimit = BigNumber.from(2900000);
      } else if (fromTokenValue.gt(rebaseThreshold)) {
        // https://etherscan.io/tx/0xc8ac03e33cab4bad9b54a6e6604ef6b8e11126340b93bbca1348167f548ad8fd
        gasLimit = BigNumber.from(510000);
      }

      const approveGasLimit = await fromTokenContract
        .connect(signer)
        .estimateGas['approve'](vaultContract.address, fromTokenValue);

      return {
        contract: config.contract,
        gasLimit: gasLimit.add(approveGasLimit),
        receiveAmount,
        minimumAmount,
        hasProvidedAllowance,
        feeData,
        value,
        fromToken,
        toToken,
      };
    }

    const gasLimit = await vaultContract
      .connect(signer)
      .estimateGas['mint'](fromToken.address, fromTokenValue, minimumAmount);

    return {
      contract: config.contract,
      gasLimit,
      receiveAmount,
      minimumAmount,
      hasProvidedAllowance: true,
      feeData,
      prepareParams: {
        address: config.contract.address,
        abi: config.contract.abi,
        functionName: 'mint',
        args: [fromToken?.address, fromTokenValue, minimumAmount],
        staleTime: 2_000,
      },
      value,
      fromToken,
      toToken,
    };
  } catch (e) {
    return handleError(e as EstimateError, config.contract);
  }
};

const estimateVaultRedeem = async ({
  address,
  mode,
  toToken,
  config,
  fromToken,
  value,
  settings,
}: EstimateFnProps) => {
  if (!config.contract) {
    return {
      error: 'UNKNOWN',
      contract: config.contract,
    };
  } else if (
    config.canEstimateSwap &&
    !config.canEstimateSwap({
      mode,
      fromToken,
      toToken,
    })
  ) {
    return {
      error: 'UNSUPPORTED',
      contract: config.contract,
    };
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(providerRpc);

    const signer = provider.getSigner(address);

    const feeData = await provider.getFeeData();

    const fromTokenContract = new ethers.Contract(
      fromToken.address,
      fromToken.abi,
      provider
    );

    const vaultContract = new ethers.Contract(
      config.contract.address,
      config.contract.abi,
      provider
    );

    const [fromTokenDecimals, redeemFeeBps] = await Promise.all([
      fromTokenContract['decimals'](),
      vaultContract['redeemFeeBps'](),
    ]);

    const fromTokenValue = parseUnits(String(value), fromTokenDecimals);

    const hasEnoughBalance =
      fromToken?.balanceOf && fromToken?.balanceOf.gte(fromTokenValue);

    if (!hasEnoughBalance) {
      return {
        error: 'NOT_ENOUGH_BALANCE',
        contract: config.contract,
        fromToken,
      };
    }

    // Calculate mix splits
    const [redeemOutputs, allRedeemableAssets] = await Promise.all([
      vaultContract['calculateRedeemOutputs'](fromTokenValue),
      vaultContract['getAllAssets'](),
    ]);

    const mixedAssets = zipObject(allRedeemableAssets, redeemOutputs);

    const receiveAmount = reduce(
      mixedAssets,
      // @ts-ignore
      (acc, value) => acc.add(value),
      BigNumber.from(0)
    );

    const minimumAmount = fromTokenValue.sub(
      fromTokenValue.mul(settings?.tolerance * 100).div(10000)
    );

    const gasLimit = await vaultContract
      .connect(signer)
      .estimateGas['redeem'](fromTokenValue, minimumAmount);

    return {
      contract: config.contract,
      receiveAmount,
      gasLimit,
      minimumAmount,
      fromTokenValue,
      feeData,
      hasProvidedAllowance: true,
      breakdown: mixedAssets,
      prepareParams: {
        address: config.contract.address,
        abi: config.contract.abi,
        functionName: 'redeem',
        args: [fromTokenValue, minimumAmount],
      },
      value,
      fromToken,
      toToken,
    };
  } catch (e) {
    return handleError(e as EstimateError, config.contract);
  }
};

const estimateZapperMint = async ({
  address,
  mode,
  toToken,
  config,
  fromToken,
  value,
  settings,
}: EstimateFnProps) => {
  if (!config.contract) {
    return {
      error: 'UNKNOWN',
      contract: config.contract,
    };
  } else if (
    config.canEstimateSwap &&
    !config.canEstimateSwap({
      mode,
      fromToken,
      toToken,
    })
  ) {
    return {
      error: 'UNSUPPORTED',
      contract: config.contract,
    };
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(providerRpc);

    const signer = provider.getSigner(address);

    const feeData = await provider.getFeeData();

    const zapperContract = new ethers.Contract(
      config.contract.address,
      config.contract.abi,
      provider
    );

    if (fromToken.symbol === 'ETH') {
      const depositAmount = parseUnits(String(value), 18);

      const currentBalanceOf = await provider.getBalance(address);

      if (depositAmount.gt(currentBalanceOf)) {
        return {
          error: 'NOT_ENOUGH_BALANCE',
          contract: config.contract,
          fromToken,
        };
      }

      const gasLimit = await zapperContract
        .connect(signer)
        .estimateGas['deposit']({
          value: depositAmount,
        });

      return {
        contract: config.contract,
        gasLimit,
        receiveAmount: depositAmount,
        hasProvidedAllowance: true,
        feeData,
        prepareParams: {
          address: config.contract.address,
          abi: config.contract.abi,
          functionName: 'deposit',
          staleTime: 2_000,
          overrides: {
            value: depositAmount,
          },
        },
        value,
        fromToken,
        toToken,
      };
    }

    // Process from token (erc20)

    const fromTokenContract = new ethers.Contract(
      fromToken.address,
      fromToken.abi,
      provider
    );

    const toTokenContract = new ethers.Contract(
      toToken.address,
      toToken.abi,
      provider
    );

    const [fromTokenDecimals, contractTokenBalance] = await Promise.all([
      fromTokenContract['decimals'](),
      toTokenContract['balanceOf'](zapperContract.address),
    ]);

    const fromTokenValue = parseUnits(String(value), fromTokenDecimals);

    const hasEnoughBalance =
      fromToken?.balanceOf && fromToken?.balanceOf.gte(fromTokenValue);

    if (!hasEnoughBalance) {
      return {
        error: 'NOT_ENOUGH_BALANCE',
        contract: config.contract,
        fromToken,
      };
    }

    const contractHasEnoughTokens =
      contractTokenBalance && contractTokenBalance.lt(fromTokenValue);

    if (!contractHasEnoughTokens) {
      return {
        error: 'NOT_ENOUGH_CONTRACT_FUNDS',
        contract: config.contract,
      };
    }

    const fromTokenAllowance = await fromTokenContract['allowance'](
      address,
      zapperContract.address
    );
    const hasProvidedAllowance = fromTokenAllowance.gte(fromTokenValue);

    // Check approvals against zapper for from token
    if (!hasProvidedAllowance) {
      const approveGasLimit = await fromTokenContract
        .connect(signer)
        .estimateGas['approve'](zapperContract.address, fromTokenValue);

      return {
        contract: config.contract,
        gasLimit: approveGasLimit,
        receiveAmount: fromTokenValue,
        hasProvidedAllowance,
        feeData,
        value,
        fromToken,
        toToken,
      };
    }

    const minimumAmount = fromTokenValue.sub(
      fromTokenValue.mul(settings?.tolerance * 100).div(10000)
    );

    const gasLimit = await zapperContract
      .connect(signer)
      .estimateGas['depositSFRXETH'](fromTokenValue, minimumAmount);

    return {
      contract: config.contract,
      gasLimit,
      receiveAmount: fromTokenValue,
      hasProvidedAllowance,
      feeData,
      value,
      fromToken,
      toToken,
      prepareParams: {
        address: config.contract.address,
        abi: config.contract.abi,
        functionName: 'depositSFRXETH',
        args: [fromTokenValue, minimumAmount],
        staleTime: 2_000,
      },
    };
  } catch (e) {
    return handleError(e as EstimateError, config.contract);
  }
};

const estimateFlipperSwap = async ({
  address,
  mode,
  toToken,
  config,
  fromToken,
  value,
  settings,
}: EstimateFnProps) => {
  if (!config.contract) {
    return {
      error: 'UNKNOWN',
      contract: config.contract,
    };
  } else if (
    config.canEstimateSwap &&
    !config.canEstimateSwap({
      mode,
      fromToken,
      toToken,
    })
  ) {
    return {
      error: 'UNSUPPORTED',
      contract: config.contract,
    };
  }
  return {
    error: 'UNIMPLEMENTED',
    contract: config.contract,
  };
};

const estimateUniswapV2Swap = async ({
  address,
  mode,
  toToken,
  config,
  fromToken,
  value,
  settings,
}: EstimateFnProps) => {
  if (!config.contract) {
    return {
      error: 'UNKNOWN',
      contract: config.contract,
    };
  } else if (
    config.canEstimateSwap &&
    !config.canEstimateSwap({
      mode,
      fromToken,
      toToken,
    })
  ) {
    return {
      error: 'UNSUPPORTED',
      contract: config.contract,
    };
  }
  return {
    error: 'UNIMPLEMENTED',
    contract: config.contract,
  };
};

const estimateUniswapV3Swap = async ({
  address,
  mode,
  toToken,
  config,
  fromToken,
  value,
  settings,
}: EstimateFnProps) => {
  if (!config.contract) {
    return {
      error: 'UNKNOWN',
      contract: config.contract,
    };
  } else if (
    config.canEstimateSwap &&
    !config.canEstimateSwap({
      mode,
      fromToken,
      toToken,
    })
  ) {
    return {
      error: 'UNSUPPORTED',
      contract: config.contract,
    };
  }
  return {
    error: 'UNIMPLEMENTED',
    contract: config.contract,
  };
};

const estimateCurveSwap = async ({
  address,
  mode,
  toToken,
  config,
  fromToken,
  value,
  settings,
}: EstimateFnProps) => {
  if (!config.contract) {
    return {
      error: 'UNKNOWN',
      contract: config.contract,
    };
  } else if (
    config.canEstimateSwap &&
    !config.canEstimateSwap({
      mode,
      fromToken,
      toToken,
    })
  ) {
    return {
      error: 'UNSUPPORTED',
      contract: config.contract,
    };
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(providerRpc);

    const signer = provider.getSigner(address);

    const feeData = await provider.getFeeData();

    const curveAddressContract = new ethers.Contract(
      config.contract.address,
      config.contract.abi,
      provider
    );

    let fromTokenContract;
    let fromTokenDecimals;

    // from/to will have no address if ETH
    if (!fromToken?.address) {
      fromToken.address = NullAddress;
      fromTokenDecimals = 18;
    } else if (!toToken?.address) {
      toToken.address = NullAddress;
    }

    if (fromToken.address !== NullAddress) {
      fromTokenContract = new ethers.Contract(
        fromToken.address,
        fromToken.abi,
        provider
      );
      fromTokenDecimals = await fromTokenContract['decimals']();
    }

    const registryExchangeAddress = await curveAddressContract['get_address'](
      2,
      { gasLimit: 100000 } // Manual gas for ethers issue w/ vyper
    );

    const curveRegistryExchange = new ethers.Contract(
      registryExchangeAddress,
      contracts['mainnet']['CurveRegistryExchange'].abi,
      provider
    );

    let poolContract;

    const isOUSD =
      toToken.symbol === contracts['mainnet']['OUSD'].symbol ||
      fromToken.symbol === contracts['mainnet']['OUSD'].symbol;

    const isOETH =
      toToken.symbol === contracts['mainnet']['OETH'].symbol ||
      fromToken.symbol === contracts['mainnet']['OETH'].symbol;

    if (isOUSD) {
      poolContract = {
        address: contracts['mainnet']['CurveOUSDMetaPool']?.address,
        name: contracts['mainnet']['CurveOUSDMetaPool']?.name,
        abi: curveMetapoolMiniAbi,
        functionName: 'exchange_underlying',
      };
    } else if (isOETH) {
      poolContract = {
        address: contracts['mainnet']['CurveOETHPool']?.address,
        name: contracts['mainnet']['CurveOETHPool']?.name,
        abi: curveMetapoolMiniAbi,
        functionName: 'exchange',
      };
    }

    if (!poolContract || !poolContract.address || !poolContract.abi) {
      return {
        error: 'NO_LIQUIDITY_POOL',
        contract: poolContract,
        fromToken,
      };
    }

    const liquidityPoolContract = new ethers.Contract(
      poolContract.address,
      poolContract.abi,
      provider
    );

    const fromTokenValue = parseUnits(String(value), fromTokenDecimals);

    let receiveAmount;

    try {
      receiveAmount = await curveRegistryExchange.get_exchange_amount(
        poolContract.address,
        fromToken.address,
        toToken.address,
        fromTokenValue,
        {
          gasLimit: 1000000,
        }
      );
    } catch (e) {
      return handleError(e as EstimateError, poolContract);
    }

    const minimumAmount = fromTokenValue.sub(
      fromTokenValue.mul(settings?.tolerance * 100).div(10000)
    );

    let fromTokenAllowance;

    if (fromToken?.address === NullAddress) {
      const currentBalanceOf = await provider.getBalance(address);
      if (fromTokenValue.gt(currentBalanceOf)) {
        return {
          error: 'NOT_ENOUGH_BALANCE',
          contract: config.contract,
          fromToken,
        };
      }
    } else if (fromTokenContract) {
      fromTokenAllowance = await fromTokenContract['allowance'](
        address,
        poolContract.address
      );

      const hasProvidedAllowance = fromTokenAllowance.gte(fromTokenValue);

      // Needs approvals, get estimates
      if (!hasProvidedAllowance) {
        /* This estimate is from the few ones observed on the mainnet:
         * https://etherscan.io/tx/0x3ff7178d8be668649928d86863c78cd249224211efe67f23623017812e7918bb
         * https://etherscan.io/tx/0xbf033ffbaf01b808953ca1904d3b0110b50337d60d89c96cd06f3f9a6972d3ca
         * https://etherscan.io/tx/0x77d98d0307b53e81f50b39132e038a1c6ef87a599a381675ce44038515a04738
         * https://etherscan.io/tx/0xbce1a2f1e76d4b4f900b3952f34f5f53f8be4a65ccff348661d19b9a3827aa04
         *
         */
        const gasLimit = BigNumber.from(350000);
        const approveGasLimit = await fromTokenContract
          .connect(signer)
          .estimateGas['approve'](poolContract.address, fromTokenValue);

        return {
          contract: poolContract,
          gasLimit: gasLimit.add(approveGasLimit),
          minimumAmount,
          receiveAmount,
          hasProvidedAllowance,
          feeData,
          value,
          fromToken,
          toToken,
        };
      }
    }

    const factoryAddress = await curveAddressContract['get_address'](3, {
      gasLimit: 100000,
    }); // Manual gas for ethers issue w/ vyper

    const factoryContract = new ethers.Contract(
      factoryAddress,
      // @ts-ignore
      curveFactoryMiniAbi,
      provider
    );

    const underlyingCoins = await factoryContract[
      isOUSD ? 'get_underlying_coins' : 'get_coins'
    ](poolContract.address);

    const curveUnderlyingCoins = underlyingCoins.map((address: string) =>
      address?.toLowerCase()
    );

    const swapRatio =
      parseFloat(formatWeiBalance(fromTokenValue.toString())) /
      parseFloat(formatWeiBalance(receiveAmount.toString()));

    if (swapRatio > 1.2) {
      return {
        error: 'BAD_SWAP_RATIO',
        contract: poolContract,
        fromToken,
      };
    }

    const fromIndexFound = curveUnderlyingCoins.indexOf(
      fromToken?.address?.toLowerCase()
    );

    const toIndexFound = curveUnderlyingCoins.indexOf(
      toToken?.address?.toLowerCase()
    );

    const fromEth = fromToken?.address === NullAddress;

    const gasLimit = await liquidityPoolContract
      .connect(signer)
      .estimateGas[poolContract.functionName](
        fromIndexFound,
        toIndexFound,
        fromTokenValue,
        minimumAmount,
        fromEth
          ? {
              value: fromTokenValue,
            }
          : null
      );

    return {
      contract: poolContract,
      gasLimit,
      receiveAmount,
      minimumAmount,
      hasProvidedAllowance: true,
      feeData,
      prepareParams: {
        address: poolContract.address,
        abi: poolContract.abi,
        functionName: poolContract.functionName,
        args: [fromIndexFound, toIndexFound, fromTokenValue, minimumAmount],
        staleTime: 2_000,
        ...(fromEth
          ? {
              overrides: {
                value: fromTokenValue,
              },
            }
          : {}),
      },
      value,
      fromToken,
      toToken,
    };
  } catch (e) {
    return handleError(e as EstimateError, config.contract);
  }
};

const estimateSushiSwap = async ({
  address,
  mode,
  toToken,
  config,
  fromToken,
  value,
  settings,
}: EstimateFnProps) => {
  if (!config.contract) {
    return {
      error: 'UNKNOWN',
      contract: config.contract,
    };
  } else if (
    config.canEstimateSwap &&
    !config.canEstimateSwap({
      mode,
      fromToken,
      toToken,
    })
  ) {
    return {
      error: 'UNSUPPORTED',
      contract: config.contract,
    };
  }
  return {
    error: 'UNIMPLEMENTED',
    contract: config.contract,
  };
};

const enrichAndSortEstimates = (
  estimates: SwapEstimate[],
  usdConversionPrice: number | undefined
) => {
  return orderBy(
    estimates
      .map((estimate: SwapEstimate) => {
        const { feeData, receiveAmount, gasLimit, value, error } = estimate;

        if (error) {
          if (error === 'UNSUPPORTED') {
            return {
              ...estimate,
              effectivePrice: Infinity, // Arb. large number to move to bottom
            };
          }
          return null;
        }

        const { gasPrice } = feeData;

        // gasPrice * gwei * gasLimit * eth cost
        const gasCostUsd = parseFloat(
          formatUnits(
            gasPrice
              .mul(gasLimit)
              .mul(BigNumber.from(Math.trunc(usdConversionPrice || 0)))
              .toString(),
            18
          )
        );
        const valueInUsd =
          parseFloat(String(value)) * (usdConversionPrice || 0);
        const amountReceived = parseFloat(formatWeiBalance(receiveAmount));
        const receiveAmountUsd = amountReceived * (usdConversionPrice || 0);
        const effectivePrice =
          (parseFloat(String(value)) + parseFloat(String(gasCostUsd))) /
          receiveAmountUsd;

        return {
          ...estimate,
          usdConversionPrice,
          gasCostUsd,
          valueInUsd,
          receiveAmountUsd,
          effectivePrice,
        };
      })
      .filter(Boolean),
    'effectivePrice',
    'asc'
  );
};

const useSwapEstimator = ({
  address,
  settings,
  mode,
  fromToken,
  toToken,
  value,
  estimatesBy,
  onEstimate,
  usdConversionPrice,
}: UseSwapEstimatorProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // Defined swap, mint/redeem estimators
  const estimateLookup = {
    vault: mode === 'MINT' ? estimateVaultMint : estimateVaultRedeem,
    zapper: estimateZapperMint,
    flipper: estimateFlipperSwap,
    uniswapV2: estimateUniswapV2Swap,
    uniswapV3: estimateUniswapV3Swap,
    sushiswap: estimateSushiSwap,
    curve: estimateCurveSwap,
  };

  const onFetchEstimations = useDebouncedCallback(async () => {
    try {
      const hasValue = parseFloat(String(value)) > 0;

      if (!hasValue) {
        setIsLoading(false);
        return onEstimate(null);
      }

      const estimates = await Promise.all(
        Object.keys(estimatesBy).map((estimateKey) =>
          // @ts-ignore
          estimateLookup[estimateKey]?.({
            config: estimatesBy[estimateKey],
            mode,
            fromToken,
            toToken,
            address,
            value,
            settings,
          })
        )
      );

      const enriched = enrichAndSortEstimates(estimates, usdConversionPrice);

      onEstimate(enriched);

      setIsLoading(false);

      return true;
    } catch (e) {
      console.error(`ERROR: While fetching estimations`, e);
      setIsLoading(false);
      return false;
    }
  }, 1000);

  useEffect(() => {
    (async function () {
      setIsLoading(true);
      await onFetchEstimations();
    })();
  }, [
    mode,
    value,
    JSON.stringify(fromToken),
    JSON.stringify(toToken),
    JSON.stringify(settings),
    usdConversionPrice,
  ]);

  return { isLoading, onRefreshEstimates: onFetchEstimations };
};

export default useSwapEstimator;
