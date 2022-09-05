import { combineReducers } from "redux";
import {
  POOLS_SET,
  POOL_SET,
  PAIR_SET,
  POOL_DEPOSITS_SET,
  SPOT_PRICE_SET,
  POOL_BALANCE_FETCH_IN_PROGRESS,
  SECOND_RESERVE_COIN_DENOM_SET,
  POOL_TOKEN_SUPPLY_SET,
  POOLS_LIQUIDITY_LIST_SET,
  ASSET_RATES_STATES_SET,
  USER_LENDS_SET,
  POOL_LENDS_SET,
  USER_BORROWS_SET,
} from "../constants/lend";

const pool = (
  state = {
    _: {},
    list: [],
    pagination: {},
    inProgress: false,
  },
  action
) => {
  switch (action.type) {
    case POOLS_SET:
      return {
        ...state,
        list: action.list,
        pagination: action.pagination,
      };
    case POOL_SET:
      return {
        ...state,
        _: action.value,
      };
    default:
      return state;
  }
};

const poolDeposit = (
  state = {
    list: [],
    pagination: {},
  },
  action
) => {
  if (action.type === POOL_DEPOSITS_SET) {
    return {
      list: action.list,
      pagination: action.pagination,
    };
  }

  return state;
};

const spotPrice = (state = 0, action) => {
  if (action.type === SPOT_PRICE_SET) {
    return action.value;
  }

  return state;
};

const inProgress = (state = false, action) => {
  if (action.type === POOL_BALANCE_FETCH_IN_PROGRESS) {
    return action.value;
  }

  return state;
};

const secondReserveCoinDenom = (state = "", action) => {
  if (action.type === SECOND_RESERVE_COIN_DENOM_SET) {
    return action.value;
  }

  return state;
};

const poolTokenSupply = (state = {}, action) => {
  if (action.type === POOL_TOKEN_SUPPLY_SET) {
    return action.value;
  }

  return state;
};

const list = (state = [], action) => {
  if (action.type === POOLS_LIQUIDITY_LIST_SET && action.value) {
    const array = state;
    array[action.index] = action.value;
    return array;
  }

  return state;
};

const assetRatesStats = (
  state = {
    map: {},
    pagination: {},
  },
  action
) => {
  if (action.type === ASSET_RATES_STATES_SET) {
    return {
      map: action.map,
      pagination: action.pagination,
    };
  }

  return state;
};

const userLends = (state = [], action) => {
  if (action.type === USER_LENDS_SET) {
    return action.list;
  }

  return state;
};

const poolLends = (state = [], action) => {
  if (action.type === POOL_LENDS_SET) {
    return action.list;
  }

  return state;
};

const userBorrows = (state = [], action) => {
  if (action.type === USER_BORROWS_SET) {
    return action.list;
  }

  return state;
};

const pair = (state = {}, action) => {
  if (action.type === PAIR_SET) {
    return action.value;
  }

  return state;
};
export default combineReducers({
  pool,
  poolDeposit,
  spotPrice,
  inProgress,
  secondReserveCoinDenom,
  poolTokenSupply,
  list,
  assetRatesStats,
  userLends,
  poolLends,
  userBorrows,
  pair,
});
