import {
  DEMAND_COIN_DENOM_SET,
  OFFER_COIN_AMOUNT_SET,
  REVERSE_SET,
  COMPLETE_SET,
  SLIPPAGE_SET,
  PARAMS_SET,
  SLIPPAGE_TOLERANCE_SET,
} from "../constants/swap";

export const setDemandCoinDenom = (value) => {
  return {
    type: DEMAND_COIN_DENOM_SET,
    value,
  };
};

export const setOfferCoinAmount = (value, fee) => {
  return {
    type: OFFER_COIN_AMOUNT_SET,
    value,
    fee,
  };
};

export const setReverse = (value) => {
  return {
    type: REVERSE_SET,
    value,
  };
};

export const setComplete = (value, data) => {
  return {
    type: COMPLETE_SET,
    value,
    data,
  };
};

export const setSlippage = (value) => {
  return {
    type: SLIPPAGE_SET,
    value,
  };
};

export const setSlippageTolerance = (value) => {
  return {
    type: SLIPPAGE_TOLERANCE_SET,
    value,
  };
};

export const setParams = (value) => {
  return {
    type: PARAMS_SET,
    value,
  };
};
