import {
  POOLS_SET,
  POOL_SET,
  POOL_BALANCE_SET,
  SPOT_PRICE_SET,
  POOL_BALANCE_FETCH_IN_PROGRESS,
  FIRST_RESERVE_COIN_DENOM_SET,
  SECOND_RESERVE_COIN_DENOM_SET,
  POOL_TOKEN_SUPPLY_SET,
  POOL_BALANCES_SET,
  POOLS_LIQUIDITY_LIST_SET, BASE_COIN_POOL_PRICE_SET, POOL_PRICE_SET,
} from "../constants/liquidity";

export const setPools = (list, pagination) => {
  return {
    type: POOLS_SET,
    list,
    pagination,
  };
};

export const setPool = (value) => {
  return {
    type: POOL_SET,
    value,
  };
};

export const setPoolBalance = (list) => {
  return {
    type: POOL_BALANCE_SET,
    list,
  };
};

export const setFetchBalanceInProgress = (value) => {
  return {
    type: POOL_BALANCE_FETCH_IN_PROGRESS,
    value,
  };
};

export const setSpotPrice = (value) => {
  return {
    type: SPOT_PRICE_SET,
    value,
  };
};

export const setFirstReserveCoinDenom = (value) => {
  return {
    type: FIRST_RESERVE_COIN_DENOM_SET,
    value,
  };
};

export const setSecondReserveCoinDenom = (value) => {
  return {
    type: SECOND_RESERVE_COIN_DENOM_SET,
    value,
  };
};

export const setPoolTokenSupply = (value) => {
  return {
    type: POOL_TOKEN_SUPPLY_SET,
    value,
  };
};

export const setPoolBalances = (value, index) => {
  return {
    type: POOL_BALANCES_SET,
    value,
    index,
  };
};

export const setPoolLiquidityList = (value, index) => {
  return {
    type: POOLS_LIQUIDITY_LIST_SET,
    value,
    index,
  };
};

export const setBaseCoinPoolPrice = (value) => {
  return {
    type: BASE_COIN_POOL_PRICE_SET,
    value,
  };
};

export const setPoolPrice = (denom, value) => {
  return {
    type: POOL_PRICE_SET,
    value,
    denom,
  };
};