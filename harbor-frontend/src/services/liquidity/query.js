import { QueryClientImpl } from "comdex-codec/build/comdex/liquidity/v1beta1/query";
import { createQueryClient } from "../helper";
import Long from 'long';
import { CSWAP_APP_ID, PRODUCT_ID } from "../../constants/common";

export const queryLiquidityPairs = (
    callback
) => {
    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

        queryService
            .Pairs({
                denoms: []
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => callback(error?.message));
    });
};

export const queryUserOrders = (
    pairId,
    address,
    callback
) => {

    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

        queryService
            .OrdersByOrderer({
                pairId, orderer: address.toString(),
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => callback(error?.message));
    });
};

export const queryPoolsList = (
    offset,
    limit,
    countTotal,
    reverse,
    callback
) => {
    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

        queryService
            .Pools({
                pairId: Long.fromNumber(0),
                disabled: "false"
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => {
                callback(error?.message)
            });
    });
};

export const queryLiquidityPair = (
    pairId,
    callback
) => {
    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

        queryService
            .Pair({
                pairId,
            })
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => callback(error?.message));
    });
};

export const queryLiquidityParams = (
    callback
) => {
    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

        queryService
            .Params()
            .then((result) => {
                callback(null, result);
            })
            .catch((error) => callback(error?.message));
    });
};

export const queryPool = (id, callback) => {
    createQueryClient((error, client) => {
        if (error) {
            callback(error);
            return;
        }

        const queryService = new QueryClientImpl(client);

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