import { combineReducers } from "redux";
import {
  AUCTION_LIST_SET,
  BIDDING_LIST_SET,
  BID_AMOUNT_SET,
  SET_AUCTIONED_ASSET,
  SET_SELECTED_AUCTIONED_ASSET,
} from "../constants/auction";

const data = (
  state = {
    list: [],
    pagination: {},
  },
  action
) => {
  if (action.type === AUCTION_LIST_SET) {
    return {
      ...state,
      list: action.list,
      pagination: action.pagination,
    };
  }

  return state;
};

const bidAmount = (state = 0, action) => {
  if (action.type === BID_AMOUNT_SET) {
    return action.value;
  }

  return state;
};
const auctionedAsset = (state = [{
  atom: false,
  akt: false,
  cmdx: false,
  dvpn: false
}], action) => {
  if (action.type === SET_AUCTIONED_ASSET) {
    return action.value;
  }

  return state;
};

const bidding = (
  state = {
    list: [],
    pagination: {},
    bidder: "",
  },
  action
) => {
  if (action.type === BIDDING_LIST_SET) {
    return {
      ...state,
      list: action.list,
      pagination: action.pagination,
      bidder: action.bidder,
    };
  }

  return state;
};

const selectedAuctionedAsset = (state = [], action) => {
  if (action.type === SET_SELECTED_AUCTIONED_ASSET) {
    return action.value;
  }

  return state;
};

export default combineReducers({
  data,
  bidAmount,
  bidding,
  auctionedAsset,
  selectedAuctionedAsset,
});
