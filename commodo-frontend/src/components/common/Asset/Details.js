import { List, message } from "antd";
import * as PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import {
  queryAssetStats,
  queryModuleBalance
} from "../../../services/lend/query";
import {
  amountConversionWithComma,
  denomConversion
} from "../../../utils/coin";
import { decimalConversion, marketPrice } from "../../../utils/number";
import { iconNameFromDenom } from "../../../utils/string";
import { SvgIcon, TooltipIcon } from "../index";

const Details = ({ asset, poolId, markets, refreshBalance, parent }) => {
  const [stats, setStats] = useState();
  const [moduleBalanceStats, setModuleBalanceStats] = useState([]);

  useEffect(() => {
    if (asset?.id && poolId) {
      queryAssetStats(asset?.id, poolId, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setStats(result?.AssetStats);
      });
    } else if (stats?.poolId) {
      setStats();
    }
  }, [asset, poolId, refreshBalance]);

  useEffect(() => {
    if (poolId) {
      queryModuleBalance(poolId, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setModuleBalanceStats(result?.ModuleBalance?.moduleBalanceStats);
      });
    }
  }, [poolId, refreshBalance]);

  let assetStats = moduleBalanceStats?.filter(
    (item) => item?.assetId?.toNumber() === asset?.id?.toNumber()
  )[0];

  let data = [
    {
      title: parent === "lend" ? "Deposited" : "Borrowed",
      counts: `$${amountConversionWithComma(
        Number(
          (parent === "lend" ? stats?.totalLend : stats?.totalBorrowed) || 0
        ) * marketPrice(markets, asset?.denom),
        DOLLAR_DECIMALS
      )}`,
      tooltipText:
        parent === "lend" ? "Total funds Deposited" : "Total funds Borrowed",
    },
    {
      title: "Available",
      counts: `$${amountConversionWithComma(
        marketPrice(markets, assetStats?.balance?.denom) *
          assetStats?.balance.amount || 0,
        DOLLAR_DECIMALS
      )}`,
      tooltipText:
        parent === "lend" ? "Total funds Available" : "Total funds Available",
    },
    {
      title: "Utilization",
      counts: (
        <>
          {Number(decimalConversion(stats?.utilisationRatio) * 100).toFixed(
            DOLLAR_DECIMALS
          )}
          %
        </>
      ),
      tooltipText:
        parent === "lend" ? "Asset Utilization" : "Asset Utilization",
    },
    {
      title: parent === "lend" ? "Lend APY" : "Borrow APY",
      counts: (
        <>
          {Number(
            decimalConversion(
              parent === "lend" ? stats?.lendApr : stats?.borrowApr
            ) * 100
          ).toFixed(DOLLAR_DECIMALS)}
          %
        </>
      ),
      tooltipText:
        parent === "lend" ? "Lend APY of Asset" : "Borrow APY of Asset",
    },
  ];

  return (
    <>
      <div className="card-head">
        <div className="head-left">
          <div className="assets-col">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(asset?.denom)} />
            </div>
            {denomConversion(asset?.denom)}
          </div>
        </div>
        <div className="head-right">
          <span>Oracle Price</span> : ${marketPrice(markets, asset?.denom)}
        </div>
      </div>
      <List
        grid={{
          gutter: 16,
        }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <div>
              <p>
                {item.title} <TooltipIcon text={item.tooltipText} />
              </p>
              <h3>{item.counts}</h3>
            </div>
          </List.Item>
        )}
      />
    </>
  );
};

Details.propTypes = {
  refreshBalance: PropTypes.number.isRequired,
  asset: PropTypes.shape({
    denom: PropTypes.string,
  }),
  markets: PropTypes.arrayOf(
    PropTypes.shape({
      rates: PropTypes.shape({
        low: PropTypes.number,
      }),
    })
  ),
  parent: PropTypes.string,
  poolId: PropTypes.shape({
    low: PropTypes.number,
  }),
};

const stateToProps = (state) => {
  return {
    markets: state.oracle.market.list,
    refreshBalance: state.account.refreshBalance,
  };
};

export default connect(stateToProps)(Details);
