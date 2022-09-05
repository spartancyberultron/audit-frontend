import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { useEffect, useState } from "react";
import {
  queryModuleBalance,
} from "../../../services/lend/query";
import { message } from "antd";
import { marketPrice } from "../../../utils/number";
import { amountConversionWithComma } from "../../../utils/coin";
import { DOLLAR_DECIMALS } from "../../../constants/common";

export const AvailableToBorrow = ({ lendPool, markets }) => {
  const [moduleBalanceStats, setModuleBalanceStats] = useState({});

  useEffect(() => {
    if (lendPool?.poolId) {
      fetchModuleBalance(lendPool?.poolId);
    }
  }, [lendPool]);

  const fetchModuleBalance = (poolId) => {
    queryModuleBalance(poolId, (error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      setModuleBalanceStats(result?.ModuleBalance?.moduleBalanceStats);
    });
  };

  const showAvailableToBorrow = () => {
    const values =
      moduleBalanceStats?.length > 0
        ? moduleBalanceStats.map((item) => {
            return (
              marketPrice(markets, item?.balance?.denom) * item?.balance.amount
            );
          })
        : [];

    const sum = values.reduce((a, b) => a + b, 0);

    return `$${amountConversionWithComma(sum || 0, DOLLAR_DECIMALS)}`;
  };

  return <div>{showAvailableToBorrow()}</div>;
};

AvailableToBorrow.propTypes = {
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
  };
};

export default connect(stateToProps)(AvailableToBorrow);
