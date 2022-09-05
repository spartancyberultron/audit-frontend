import { QueryClientImpl } from "comdex-codec/build/comdex/auction/v1beta1/query";
import Long from "long";
import { createQueryClient } from "../helper";
import { PRODUCT_ID } from "../../constants/common";

let myClient = null;


export const getQueryService = (callback) => {
  if (myClient) {
    const queryService = new QueryClientImpl(myClient);

    return callback(null, queryService);
  } else {
    createQueryClient((error, client) => {
      if (error) {
        return callback(error);
      }
      myClient = client;
      const queryService = new QueryClientImpl(client);

      return callback(null, queryService);
    });
  }
};



export const queryDutchAuctionList = (
  offset,
  limit,
  countTotal,
  reverse,
  callback
) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }
    queryService
      .QueryDutchAuctions({
        appId: Long.fromNumber(PRODUCT_ID),
        // pagination: {
        //   key: "",
        //   offset: Long.fromNumber(offset),
        //   limit: Long.fromNumber(limit),
        //   countTotal: countTotal,
        //   reverse: reverse,
        // },
      })
      .then((result) => {

        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};



export const queryDutchBiddingList = (bidder, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .QueryDutchBiddings({
        bidder,
        appId: Long.fromNumber(PRODUCT_ID),
        history: false,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};


export const queryAuctionParams = (callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .QueryAuctionParams({
        appId: Long.fromNumber(PRODUCT_ID),
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => callback(error?.message));
  });
};



export const queryDebtAuctionList = (
  offset,
  limit,
  countTotal,
  reverse,
  callback
) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .QueryDebtAuctions({
        appId: Long.fromNumber(PRODUCT_ID),
        // pagination: {
        //   key: "",
        //   offset: Long.fromNumber(offset),
        //   limit: Long.fromNumber(limit),
        //   countTotal: countTotal,
        //   reverse: reverse,
        // },
      })
      .then((result) => {

        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};



export const queryDebtBiddingList = (bidder, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .QueryDebtBiddings({
        bidder,
        appId: Long.fromNumber(PRODUCT_ID),
        history: false,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};



export const querySurplusAuctionList = (
  offset,
  limit,
  countTotal,
  reverse,
  callback
) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .QuerySurplusAuctions({
        appId: Long.fromNumber(PRODUCT_ID),
        pagination: {
          key: "",
          offset: Long.fromNumber(offset),
          limit: Long.fromNumber(limit),
          countTotal: countTotal,
          reverse: reverse,
        },
      })
      .then((result) => {

        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};


export const querySurplusBiddingList = (bidder, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .QuerySurplusBiddings({
        bidder,
        appId: Long.fromNumber(PRODUCT_ID),
        history: false,
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};