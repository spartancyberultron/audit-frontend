import { message } from "antd";
import * as PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import { queryAssetStats } from "../../../services/lend/query";
import { amountConversionWithComma } from "../../../utils/coin";
import { marketPrice } from "../../../utils/number";

export const TotalDeposit = ({ lendPool, assetMap, markets }) => {
  const [assetStats, setAssetStats] = useState({});

  useEffect(() => {
    if (lendPool?.poolId) {
      fetchAssetStats(lendPool?.mainAssetId, lendPool?.poolId);
      fetchAssetStats(lendPool?.firstBridgedAssetId, lendPool?.poolId);
      fetchAssetStats(lendPool?.secondBridgedAssetId, lendPool?.poolId);
    }
  }, [lendPool]);

  const fetchAssetStats = (assetId, poolId) => {
    queryAssetStats(assetId, poolId, (error, result) => {
      if (error) {
        message.error(error);
        return;
      }
      setAssetStats((prevState) => ({
        [assetId]: result?.AssetStats,
        ...prevState,
      }));
    });
  };

  const getTotalDeposited = () => {
    const sum =
      Number(
        assetStats[lendPool?.mainAssetId]?.totalLend *
          marketPrice(markets, assetMap?.[lendPool?.mainAssetId]?.denom)
      ) +
      Number(
        assetStats[lendPool?.firstBridgedAssetId]?.totalLend *
          marketPrice(markets, assetMap?.[lendPool?.firstBridgedAssetId]?.denom)
      ) +
      Number(
        assetStats[lendPool?.secondBridgedAssetId]?.totalLend *
          marketPrice(
            markets,
            assetMap?.[lendPool?.secondBridgedAssetId]?.denom
          )
      );

    return `$${amountConversionWithComma(sum || 0, DOLLAR_DECIMALS)}`;
  };
  return <div>{getTotalDeposited()}</div>;
};

TotalDeposit.propTypes = {
  assetMap: PropTypes.object,
  markets: PropTypes.arrayOf(
    PropTypes.shape({
      rates: PropTypes.shape({
        low: PropTypes.number,
      }),
    })
  ),
  lendPool: PropTypes.shape({
    mainAssetId: PropTypes.shape({
      low: PropTypes.number,
    }),
    firstBridgedAssetId: PropTypes.shape({
      low: PropTypes.number,
    }),
    secondBridgedAssetId: PropTypes.shape({
      low: PropTypes.number,
    }),
  }),
};

const stateToProps = (state) => {
  return {
    markets: state.oracle.market.list,
    assetMap: state.asset._.map,
  };
};

export default connect(stateToProps)(TotalDeposit);
