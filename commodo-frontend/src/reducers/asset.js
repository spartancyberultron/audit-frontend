import {
  ASSETS_SET,
  PAIRS_SET,
  PAIR_SET,
  PAIR_ID_SET,
  OUT_ASSET_SET,
  IN_ASSET_SET,
  OUT_AMOUNT_SET,
} from "../constants/asset";
import { combineReducers } from "redux";

const pairs = (
  state = {
    list: [],
    pagination: {},
  },
  action
) => {
  if (action.type === PAIRS_SET) {
    return {
      list: action.list,
      pagination: action.pagination,
    };
  }

  return state;
};

const _ = (
  state = {
    list: [],
    pagination: {},
    cAssets: [],
    inProgress: false,
    map: {},
  },
  action
) => {
  if (action.type === ASSETS_SET) {
    return {
      ...state,
      list: action.list,
      cAssets: action.cAssets,
      pagination: action.pagination,
      map: action.map,

    };
  }

  return state;
};

const pairId = (state = null, action) => {
  if (action.type === PAIR_ID_SET) {
    return action.value || state;
  }

  return state;
};

const pair = (state = {}, action) => {
  if (action.type === PAIR_SET) {
    return action.value || state;
  }

  return state;
};

const inAsset = (state = "", action) => {
  if (action.type === IN_ASSET_SET) {
    return action.value || "";
  }

  return state;
};

const outAsset = (state = "", action) => {
  if (action.type === OUT_ASSET_SET) {
    return action.value || "";
  }

  return state;
};

const outAmount = (state = 0, action) => {
  if (action.type === OUT_AMOUNT_SET) {
    return action.value || 0;
  }

  return state;
};

export default combineReducers({
  pairs,
  pairId,
  pair,
  _,
  outAsset,
  inAsset,
  outAmount,
});
