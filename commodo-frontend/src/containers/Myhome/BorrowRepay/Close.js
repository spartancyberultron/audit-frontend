import { Select } from "antd";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { setBalanceRefresh } from "../../../actions/account";
import { Col, Row, SvgIcon, TooltipIcon } from "../../../components/common";
import Details from "../../../components/common/Asset/Details";
import HealthFactor from "../../../components/HealthFactor";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getDenomBalance
} from "../../../utils/coin";
import { commaSeparator, marketPrice } from "../../../utils/number";
import { iconNameFromDenom } from "../../../utils/string";
import ActionButton from "./ActionButton";
import "./index.less";

const CloseTab = ({
  lang,
  dataInProgress,
  borrowPosition,
  pool,
  assetMap,
  address,
  refreshBalance,
  setBalanceRefresh,
  markets,
  balances,
  pair,
}) => {
  const selectedAssetId = pair?.assetOut?.toNumber();

  const availableBalance =
    getDenomBalance(balances, borrowPosition?.amountOut?.denom) || 0;

  const handleRefresh = () => {
    setBalanceRefresh(refreshBalance + 1);
  };

  return (
    <div className="details-wrapper">
      <div className="details-left commodo-card">
        <div className="assets-select-card mb-3">
          <div className="assets-left">
            <label className="left-label">Close position</label>
            <div className="assets-select-wrapper">
              <div className="assets-select-wrapper">
                <Select
                  className="assets-select"
                  dropdownClassName="asset-select-dropdown"
                  defaultValue="1"
                  placeholder={
                    <div className="select-placeholder">
                      <div className="circle-icon">
                        <div className="circle-icon-inner" />
                      </div>
                      Select
                    </div>
                  }
                  defaultActiveFirstOption={true}
                  showArrow={false}
                  disabled
                >
                  <Option key="1">
                    <div className="select-inner">
                      <div className="svg-icon">
                        <div className="svg-icon-inner">
                          <SvgIcon
                            name={iconNameFromDenom(
                              borrowPosition?.amountOut?.denom
                            )}
                          />
                        </div>
                      </div>
                      <div className="name">
                        {denomConversion(borrowPosition?.amountOut?.denom)}{" "}
                      </div>
                    </div>
                  </Option>
                </Select>
              </div>
            </div>
          </div>
          <div className="assets-right">
            <div className="label-right">
              Available
              <span class="ml-1">
                {amountConversionWithComma(availableBalance)}{" "}
                {denomConversion(borrowPosition?.amountOut?.denom)}
              </span>
            </div>
            <div>
              <div className="input-select">
                <h2 className="mt-3">
                  {amountConversionWithComma(borrowPosition?.updatedAmountOut)}{" "}
                </h2>
              </div>
              <small className="mt-1">
                $
                {commaSeparator(
                  Number(
                    amountConversion(borrowPosition?.updatedAmountOut) *
                      marketPrice(markets, assetMap[selectedAssetId]?.denom) ||
                      0
                  ).toFixed(DOLLAR_DECIMALS)
                )}
              </small>{" "}
            </div>
          </div>
        </div>
        <Row>
          <Col sm="12" className="mt-2 mx-auto card-bottom-details">
            <Row className="mt-3">
              <Col>
                <label>Health Factor</label>
                <TooltipIcon text="Numeric representation of your position's safety" />
              </Col>
              <Col className="text-right">
                <HealthFactor
                  borrow={borrowPosition}
                  pair={pair}
                  pool={pool}
                  inAmount={borrowPosition?.amountIn?.amount}
                  outAmount={Number(borrowPosition?.updatedAmountOut)}
                />{" "}
              </Col>
            </Row>
          </Col>
        </Row>
        <div className="assets-form-btn">
          <ActionButton
            name="Close"
            lang={lang}
            disabled={
              dataInProgress ||
              !selectedAssetId ||
              Number(availableBalance) <
                Number(borrowPosition?.updatedAmountOut)
            }
            amount={amountConversion(borrowPosition?.updatedAmountOut)}
            address={address}
            borrowId={borrowPosition?.borrowingId}
            denom={borrowPosition?.amountOut?.denom}
            refreshData={handleRefresh}
          />
        </div>
      </div>
      <div className="details-right">
        <div className="commodo-card">
          <Details
            asset={assetMap[pool?.firstBridgedAssetId?.toNumber()]}
            poolId={pool?.poolId}
            parent="borrow"
          />
          <div className="mt-5">
            <Details
              asset={assetMap[pool?.secondBridgedAssetId?.toNumber()]}
              poolId={pool?.poolId}
              parent="borrow"
            />
          </div>
        </div>
        <div className="commodo-card">
          <Details
            asset={assetMap[pool?.mainAssetId?.toNumber()]}
            poolId={pool?.poolId}
            parent="borrow"
          />
        </div>
      </div>
    </div>
  );
};

CloseTab.propTypes = {
  dataInProgress: PropTypes.bool.isRequired,
  lang: PropTypes.string.isRequired,
  setBalanceRefresh: PropTypes.func.isRequired,
  address: PropTypes.string,
  assetMap: PropTypes.object,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  borrowPosition: PropTypes.shape({
    lendingId: PropTypes.shape({
      low: PropTypes.number,
    }),
    amountIn: PropTypes.shape({
      denom: PropTypes.string,
      amount: PropTypes.string,
    }),
  }),
  pair: PropTypes.shape({
    id: PropTypes.shape({
      low: PropTypes.number,
    }),
    assetIn: PropTypes.shape({
      low: PropTypes.number,
    }),
    amountOut: PropTypes.shape({
      low: PropTypes.number,
    }),
  }),
  pool: PropTypes.shape({
    poolId: PropTypes.shape({
      low: PropTypes.number,
    }),
    firstBridgedAssetId: PropTypes.shape({
      low: PropTypes.number,
    }),
    secondBridgedAssetId: PropTypes.shape({
      low: PropTypes.number,
    }),
  }),
  refreshBalance: PropTypes.number.isRequired,
};

const stateToProps = (state) => {
  return {
    address: state.account.address,
    pool: state.lend.pool._,
    pair: state.lend.pair,
    balances: state.account.balances.list,
    assetMap: state.asset._.map,
    lang: state.language,
    refreshBalance: state.account.refreshBalance,
    markets: state.oracle.market.list,
  };
};

const actionsToProps = {
  setBalanceRefresh,
};

export default connect(stateToProps, actionsToProps)(CloseTab);
