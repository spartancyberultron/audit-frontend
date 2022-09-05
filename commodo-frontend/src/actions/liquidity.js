import { POOL_PRICE_SET } from '../constants/liquidity';

export const setPoolPrice = (denom, value) => {
    return {
      type: POOL_PRICE_SET,
      value,
      denom,
    };
  };
  