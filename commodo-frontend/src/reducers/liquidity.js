import { combineReducers } from "redux";
import { POOL_PRICE_SET } from "../constants/liquidity";

const poolPriceMap = (state = {}, action) => {
  if (action.type === POOL_PRICE_SET) {
    return {
      ...state,
      [action.denom]: action.value,
    };
  }

  return state;
};

export default combineReducers({
  poolPriceMap,
});
