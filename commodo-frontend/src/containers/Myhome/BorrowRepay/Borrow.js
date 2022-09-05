import { Button, Select } from "antd";
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
  getAmount
} from "../../../utils/coin";
import {
  commaSeparator,
  decimalConversion,
  marketPrice
} from "../../../utils/number";
import {
  iconNameFromDenom,
  toDecimals,
  ucDenomToDenom
} from "../../../utils/string";
import ActionButton from "./ActionButton";
import "./index.less";

const { Option } = Select;

const BorrowTab = ({
  lang,
  dataInProgress,
  borrowPosition,
  lendPosition,
  pool,
  assetMap,
  assetRatesStatsMap,
  address,
  refreshBalance,
  setBalanceRefresh,
  markets,
  refreshBorrowPosition,
  pair,
}) => {
  const [amount, setAmount] = useState();
  const [validationError, setValidationError] = useState();
  const [assetList, setAssetList] = useState();

  const selectedAssetId = pair?.assetOut?.toNumber();

  const borrowable =
    (Number(
      borrowPosition?.amountIn?.amount *
        marketPrice(markets, ucDenomToDenom(borrowPosition?.amountIn?.denom)) *
        (pair?.isInterPool
          ? Number(
              decimalConversion(assetRatesStatsMap[lendPosition?.assetId]?.ltv)
            ) *
            Number(
              decimalConversion(
                assetRatesStatsMap[pool?.firstBridgedAssetId]?.ltv
              )
            )
          : Number(
              decimalConversion(assetRatesStatsMap[lendPosition?.assetId]?.ltv)
            )) || 0
    ) -
      Number(
        borrowPosition?.updatedAmountOut *
          marketPrice(markets, borrowPosition?.amountOut.denom)
      )) /
    marketPrice(markets, borrowPosition?.amountOut.denom);

  // Collateral deposited value * Max LTV of collateral minus already Borrowed asset value

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
      ValidateInputNumber(value, amountConversion(borrowable))
    );
  };

  const handleMaxClick = () => {
    return handleInputChange(amountConversion(borrowable));
  };

  const handleRefresh = () => {
    refreshBorrowPosition();
    setBalanceRefresh(refreshBalance + 1);
    setAmount();
  };

  let currentLTV = Number(
    ((Number(
      amount
        ? Number(borrowPosition?.updatedAmountOut) + Number(getAmount(amount))
        : borrowPosition?.updatedAmountOut
    ) *
      marketPrice(markets, borrowPosition?.amountOut?.denom)) /
      (Number(borrowPosition?.amountIn?.amount) *
        marketPrice(
          markets,
          ucDenomToDenom(borrowPosition?.amountIn?.denom)
        ))) *
      100
  );

  return (
    <div className="details-wrapper">
      <div className="details-left commodo-card">
        <CustomRow assetList={assetList} poolId={pool?.poolId?.low} />
        <div className="assets-select-card mb-3">
          <div className="assets-left">
            <label className="left-label">Asset</label>
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
              Borrowable
              <span className="ml-1">
                {amountConversionWithComma(
                  borrowPosition?.lendingId && pair?.assetOutPoolId
                    ? borrowable >= 0
                      ? borrowable
                      : 0
                    : 0
                )}{" "}
                {denomConversion(assetMap[selectedAssetId]?.denom)}
              </span>
              <div className="max-half">
                <Button className="active" onClick={handleMaxClick}>
                  Max
                </Button>
              </div>
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
          <Col sm="12" className="mt-3 mx-auto card-bottom-details">
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
                      ? Number(borrowPosition?.amountOut?.amount) +
                        Number(getAmount(amount))
                      : borrowPosition?.amountOut?.amount
                  }
                />
              </Col>
            </Row>
            <Row className="mt-2">
              <Col>
                <label>Current LTV</label>
              </Col>
              <Col className="text-right">
                {(isFinite(currentLTV) ? currentLTV : 0).toFixed(
                  DOLLAR_DECIMALS
                )}
                %
              </Col>
            </Row>
            <AssetStats pair={pair} pool={pool} />
          </Col>
        </Row>
        <div className="assets-form-btn">
          <ActionButton
            name="Borrow"
            lang={lang}
            disabled={
              !Number(amount) ||
              validationError?.message ||
              dataInProgress ||
              !selectedAssetId
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

BorrowTab.propTypes = {
  dataInProgress: PropTypes.bool.isRequired,
  lang: PropTypes.string.isRequired,
  refreshBorrowPosition: PropTypes.func.isRequired,
  setBalanceRefresh: PropTypes.func.isRequired,
  address: PropTypes.string,
  assetMap: PropTypes.object,
  assetRatesStatsMap: PropTypes.object,
  borrowPosition: PropTypes.shape({
    lendingId: PropTypes.shape({
      low: PropTypes.number,
    }),
    amountIn: PropTypes.shape({
      denom: PropTypes.string,
      amount: PropTypes.string,
    }),
  }),
  lendPosition: PropTypes.shape({
    poolId: PropTypes.shape({
      low: PropTypes.number,
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
    lang: state.language,
    refreshBalance: state.account.refreshBalance,
    markets: state.oracle.market.list,
    assetRatesStatsMap: state.lend.assetRatesStats.map,
  };
};

const actionsToProps = {
  setBalanceRefresh,
};

export default connect(stateToProps, actionsToProps)(BorrowTab);
