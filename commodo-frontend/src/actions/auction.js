import {
  AUCTION_LIST_SET,
  BIDDING_LIST_SET,
  BID_AMOUNT_SET,
  SET_AUCTIONED_ASSET,
  SET_SELECTED_AUCTIONED_ASSET,
} from "../constants/auction";

export const setAuctions = (list, pagination) => {
  return {
    type: AUCTION_LIST_SET,
    list,
    pagination,
  };
};

export const setBiddings = (list, pagination, bidder) => {
  return {
    type: BIDDING_LIST_SET,
    list,
    pagination,
    bidder,
  };
};

export const setBidAmount = (value) => {
  return {
    type: BID_AMOUNT_SET,
    value,
  };
};

export const setAuctionedAsset = (value) => {
  return {
    type: SET_AUCTIONED_ASSET,
    value,
  };
};
export const setSelectedAuctionedAsset = (value) => {
  return {
    type: SET_SELECTED_AUCTIONED_ASSET,
    value,
  };
};

