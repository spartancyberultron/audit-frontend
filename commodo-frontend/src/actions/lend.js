import {
  POOLS_SET,
  SPOT_PRICE_SET,
  POOL_BALANCE_FETCH_IN_PROGRESS,
  SECOND_RESERVE_COIN_DENOM_SET,
  POOL_TOKEN_SUPPLY_SET,
  POOLS_LIQUIDITY_LIST_SET,
  POOL_SET,
  PAIR_SET,
  ASSET_RATES_STATES_SET,
  USER_LENDS_SET,
  POOL_LENDS_SET,
  USER_BORROWS_SET,
} from "../constants/lend";

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

export const setPoolLiquidityList = (value, index) => {
  return {
    type: POOLS_LIQUIDITY_LIST_SET,
    value,
    index,
  };
};

export const setAssetRatesStats = (list, pagination) => {
  const statsHashMap = list.reduce((map, obj) => {
    map[obj?.assetId] = obj;
    return map;
  }, {});

  return {
    type: ASSET_RATES_STATES_SET,
    map: statsHashMap,
    pagination,
  };
};

export const setUserLends = (list) => {
  return {
    type: USER_LENDS_SET,
    list,
  };
};

export const setPoolLends = (list) => {
  return {
    type: POOL_LENDS_SET,
    list,
  };
};

export const setUserBorrows = (list) => {
  return {
    type: USER_BORROWS_SET,
    list,
  };
};

export const setPair = (value) => {
  return {
    type: PAIR_SET,
    value,
  };
};
