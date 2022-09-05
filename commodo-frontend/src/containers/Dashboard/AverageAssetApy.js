import { message } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { queryAssetStats } from "../../services/lend/query";
import { decimalConversion } from "../../utils/number";

const AverageAssetApy = ({ assetId, parent }) => {
  const [stats, setStats] = useState();

  useEffect(() => {
    if (assetId) {
      // TDOD: take the pool id dynamic.
      queryAssetStats(assetId, Long.fromNumber(1), (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setStats(result?.AssetStats);
      });
    }
  }, [assetId]);

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

AverageAssetApy.propTypes = {
  assetId: PropTypes.shape({
    low: PropTypes.number,
  }),
  parent: PropTypes.string,
};

export default AverageAssetApy;
