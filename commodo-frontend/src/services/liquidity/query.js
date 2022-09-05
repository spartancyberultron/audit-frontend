import { QueryClientImpl } from "comdex-codec/build/comdex/liquidity/v1beta1/query";
import Long from "long";
import { CSWAP_APP_ID } from "../../constants/common";
import { createQueryClient } from "../helper";

let myClient = null;

const getQueryService = (callback) => {
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

export const queryParams = (callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Params()
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => callback(error?.message));
  });
};

export const queryPool = (id, callback) => {
  getQueryService((error, queryService) => {
    if (error) {
      callback(error);
      return;
    }

    queryService
      .Pool({
        appId: Long.fromNumber(CSWAP_APP_ID),
        poolId: Long.fromNumber(id),
      })
      .then((result) => {
        callback(null, result);
      })
      .catch((error) => {
        callback(error?.message);
      });
  });
};
