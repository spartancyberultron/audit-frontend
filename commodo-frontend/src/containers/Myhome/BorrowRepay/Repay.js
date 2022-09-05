import { Select } from "antd";
import * as PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { setBalanceRefresh } from "../../../actions/account";
import { Col, Row, SvgIcon, TooltipIcon } from "../../../components/common";
import CustomRow from "../../../components/common/Asset/CustomRow";
import Details from "../../../components/common/Asset/Details";
import AssetStats from "../../../components/common/Asset/Stats";
import CustomInput from "../../../components/CustomInput";
import HealthFactor from "../../../components/HealthFactor";
import { ValidateInputNumber } from "../../../config/_validation";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getAmount,
  getDenomBalance
} from "../../../utils/coin";
import { commaSeparator, marketPrice } from "../../../utils/number";
import { iconNameFromDenom, toDecimals } from "../../../utils/string";
import ActionButton from "./ActionButton";
import "./index.less";

const { Option } = Select;

const RepayTab = ({
  lang,
  dataInProgress,
  borrowPosition,
  pool,
  assetMap,
  balances,
  address,
  refreshBalance,
  refreshBorrowPosition,
  setBalanceRefresh,
  markets,
  pair,
}) => {
  const [amount, setAmount] = useState();
  const [validationError, setValidationError] = useState();
  const [assetList, setAssetList] = useState();

  const selectedAssetId = pair?.assetOut?.toNumber();
  const availableBalance =
    getDenomBalance(balances, assetMap[selectedAssetId]?.denom) || 0;

  useEffect(() => {
    if (pool?.poolId) {
      setAssetList([
        assetMap[pool?.mainAssetId?.toNumber()],
        assetMap[pool?.firstBridgedAssetId?.toNumber()],
        assetMap[pool?.secondBridgedAssetId?.toNumber()],
      ]);
    }
  }, [pool]);

  const handleInputChange = (value) => {
    value = toDecimals(value).toString().trim();

    setAmount(value);
    setValidationError(
      ValidateInputNumber(
        getAmount(value),
        borrowPosition?.updatedAmountOut,
        "repay"
      )
    );
  };

  const handleRefresh = () => {
    refreshBorrowPosition();
    setBalanceRefresh(refreshBalance + 1);
    setAmount();
  };

  return (
    <div className="details-wrapper">
      <div className="details-left commodo-card">
        <CustomRow assetList={assetList} poolId={pool?.poolId?.low} />
        <div className="assets-select-card mb-3">
          <div className="assets-left">
            <label className="left-label">Repay Asset</label>
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
                              assetMap[selectedAssetId]?.denom
                            )}
                          />
                        </div>
                      </div>
                      <div className="name">
                        {denomConversion(assetMap[selectedAssetId]?.denom)}
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
              <span className="ml-1">
                {amountConversionWithComma(availableBalance)}{" "}
                {denomConversion(assetMap[selectedAssetId]?.denom)}
              </span>
            </div>
            <div>
              <div className="input-select">
                <CustomInput
                  value={amount}
                  onChange={(event) => handleInputChange(event.target.value)}
                  validationError={validationError}
                />{" "}
              </div>
              <small>
                $
                {commaSeparator(
                  Number(
                    amount *
                      marketPrice(markets, assetMap[selectedAssetId]?.denom) ||
                      0
                  ).toFixed(DOLLAR_DECIMALS)
                )}{" "}
              </small>{" "}
            </div>
          </div>
        </div>
        <Row>
          <Col sm="12" className="mt-2 mx-auto card-bottom-details">
            <Row>
              <Col>
                <label>Remaining to Repay</label>
              </Col>
              <Col className="text-right">
                <div>
                  {amountConversionWithComma(borrowPosition?.updatedAmountOut)}{" "}
                  {denomConversion(borrowPosition?.amountOut?.denom)}
                </div>
                <small className="font-weight-light">
                  $
                  {commaSeparator(
                    Number(
                      amountConversion(borrowPosition?.updatedAmountOut) *
                        marketPrice(
                          markets,
                          assetMap[selectedAssetId]?.denom
                        ) || 0
                    ).toFixed(DOLLAR_DECIMALS)
                  )}
                </small>
              </Col>
            </Row>
            <Row className="mt-2">
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
                  outAmount={
                    amount
                      ? Number(borrowPosition?.updatedAmountOut) -
                        Number(getAmount(amount))
                      : borrowPosition?.updatedAmountOut
                  }
                />{" "}
              </Col>
            </Row>
            <AssetStats pair={pair} pool={pool} />
          </Col>
        </Row>
        <div className="assets-form-btn">
          <ActionButton
            name="Repay"
            lang={lang}
            disabled={
              !Number(amount) ||
              dataInProgress ||
              !selectedAssetId ||
              validationError?.message
            }
            amount={amount}
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

RepayTab.propTypes = {
  dataInProgress: PropTypes.bool.isRequired,
  lang: PropTypes.string.isRequired,
  refreshBorrowPosition: PropTypes.func.isRequired,
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
    assetMap: state.asset._.map,
    balances: state.account.balances.list,
    lang: state.language,
    refreshBalance: state.account.refreshBalance,
    markets: state.oracle.market.list,
  };
};

const actionsToProps = {
  setBalanceRefresh,
};

export default connect(stateToProps, actionsToProps)(RepayTab);
