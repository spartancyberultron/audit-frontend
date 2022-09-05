import { message } from "antd";
import * as PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { queryAssetStats, queryLendPair } from "../../services/lend/query";
import { decimalConversion } from "../../utils/number";

const AssetApy = ({ assetId, poolId, parent, borrowPosition }) => {
  const [stats, setStats] = useState();

  useEffect(() => {
    if (assetId && poolId) {
      queryAssetStats(assetId, poolId, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setStats(result?.AssetStats);
      });
    }
  }, [assetId, poolId]);

  useEffect(() => {
    if (borrowPosition?.borrowingId) {
      queryLendPair(borrowPosition?.pairId, (error, pairResult) => {
        if (error) {
          message.error(error);
          return;
        }

        const lendPair = pairResult?.ExtendedPair;

        queryAssetStats(
          lendPair?.assetOut,
          lendPair?.assetOutPoolId,
          (error, result) => {
            if (error) {
              message.error(error);
              return;
            }

            setStats(result?.AssetStats);
          }
        );
      });
    }
  }, [borrowPosition]);

  return (
    <>
      {Number(
        decimalConversion(
          parent === "lend" ? stats?.lendApr : stats?.borrowApr
        ) * 100
      ).toFixed(DOLLAR_DECIMALS)}
      %
    </>
  );
};

AssetApy.propTypes = {
  assetId: PropTypes.shape({
    low: PropTypes.number,
  }),
  parent: PropTypes.string,
  poolId: PropTypes.shape({
    low: PropTypes.number,
  }),
  borrowPosition: PropTypes.shape({
    lendingId: PropTypes.shape({
      low: PropTypes.number,
    }),
    amountIn: PropTypes.shape({
      denom: PropTypes.string,
      amount: PropTypes.string,
    }),
  }),
};

export default AssetApy;
