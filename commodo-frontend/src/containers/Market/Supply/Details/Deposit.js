import { Button, message, Select, Spin } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import { setBalanceRefresh } from "../../../../actions/account";
import { Col, Row, SvgIcon } from "../../../../components/common";
import CustomRow from "../../../../components/common/Asset/CustomRow";
import Details from "../../../../components/common/Asset/Details";
import AssetStats from "../../../../components/common/Asset/Stats";
import Snack from "../../../../components/common/Snack";
import CustomInput from "../../../../components/CustomInput";
import { comdex } from "../../../../config/network";
import { ValidateInputNumber } from "../../../../config/_validation";
import {
  APP_ID,
  DEFAULT_FEE,
  DOLLAR_DECIMALS
} from "../../../../constants/common";
import { signAndBroadcastTransaction } from "../../../../services/helper";
import { defaultFee } from "../../../../services/transaction";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getAmount,
  getDenomBalance
} from "../../../../utils/coin";
import { commaSeparator, marketPrice } from "../../../../utils/number";
import { iconNameFromDenom, toDecimals } from "../../../../utils/string";
import variables from "../../../../utils/variables";
import "./index.less";

const { Option } = Select;

const DepositTab = ({
  lang,
  dataInProgress,
  pool,
  assetMap,
  balances,
  address,
  markets,
  setBalanceRefresh,
  refreshBalance,
}) => {
  const [assetList, setAssetList] = useState();
  const [selectedAssetId, setSelectedAssetId] = useState();
  const [amount, setAmount] = useState();
  const [validationError, setValidationError] = useState();
  const [inProgress, setInProgress] = useState(false);
  const navigate = useNavigate();

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

  const handleAssetChange = (value) => {
    setSelectedAssetId(value);
    setAmount(0);
    setValidationError();
  };

  const handleInputChange = (value) => {
    value = toDecimals(value).toString().trim();

    setAmount(value);
    setValidationError(ValidateInputNumber(getAmount(value), availableBalance));
  };

  const handleClick = () => {
    setInProgress(true);

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.lend.v1beta1.MsgLend",
          value: {
            appId: Long.fromNumber(APP_ID),
            lender: address,
            poolId: pool?.poolId,
            assetId: Long.fromNumber(selectedAssetId),
            amount: {
              amount: getAmount(amount),
              denom: assetMap[selectedAssetId]?.denom,
            },
          },
        },
        fee: defaultFee(),
        memo: "",
      },
      address,
      (error, result) => {
        setInProgress(false);
        setAmount(0);
        if (error) {
          message.error(error);
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }

        message.success(
          <Snack
            message={variables[lang].tx_success}
            hash={result?.transactionHash}
          />
        );

        setBalanceRefresh(refreshBalance + 1);
        navigate("/myhome");
      }
    );
  };

  const handleMaxClick = () => {
    if (assetMap[selectedAssetId]?.denom === comdex.coinMinimalDenom) {
      return Number(availableBalance) > DEFAULT_FEE
        ? handleInputChange(amountConversion(availableBalance - DEFAULT_FEE))
        : handleInputChange();
    } else {
      return handleInputChange(amountConversion(availableBalance));
    }
  };

  return (
    <div className="details-wrapper">
      {!dataInProgress ? (
        <>
          <div className="details-left commodo-card">
            <CustomRow assetList={assetList} poolId={pool?.poolId?.low} />
            <div className="assets-select-card mb-0">
              <div className="assets-left">
                <label className="left-label">Lend</label>
                <div className="assets-select-wrapper">
                  <Select
                    className="assets-select"
                    dropdownClassName="asset-select-dropdown"
                    onChange={handleAssetChange}
                    placeholder={
                      <div className="select-placeholder">
                        <div className="circle-icon">
                          <div className="circle-icon-inner" />
                        </div>
                        Select
                      </div>
                    }
                    defaultActiveFirstOption={true}
                    suffixIcon={
                      <SvgIcon name="arrow-down" viewbox="0 0 19.244 10.483" />
                    }
                  >
                    {assetList?.length > 0 &&
                      assetList?.map((record) => {
                        const item = record?.denom ? record?.denom : record;

                        return (
                          <Option key={item} value={record?.id?.toNumber()}>
                            <div className="select-inner">
                              <div className="svg-icon">
                                <div className="svg-icon-inner">
                                  <SvgIcon name={iconNameFromDenom(item)} />
                                </div>
                              </div>
                              <div className="name">
                                {denomConversion(item)}
                              </div>
                            </div>
                          </Option>
                        );
                      })}
                  </Select>
                </div>
              </div>
              <div className="assets-right">
                <div className="label-right">
                  Available
                  <span className="ml-1">
                    {amountConversionWithComma(
                      getDenomBalance(
                        balances,
                        assetMap[selectedAssetId]?.denom
                      ) || 0
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
                      onChange={(event) =>
                        handleInputChange(event.target.value)
                      }
                      validationError={validationError}
                    />
                  </div>
                  $
                  {commaSeparator(
                    Number(
                      amount *
                        marketPrice(
                          markets,
                          assetMap[selectedAssetId]?.denom
                        ) || 0
                    ).toFixed(DOLLAR_DECIMALS)
                  )}{" "}
                </div>
              </div>
            </div>
            <Row>
              <Col sm="12" className="mt-3 mx-auto card-bottom-details">
                <AssetStats
                  assetId={selectedAssetId}
                  pool={pool}
                  parent="lend"
                />
              </Col>
            </Row>
            <div className="assets-form-btn">
              <Button
                type="primary"
                className="btn-filled"
                loading={inProgress}
                disabled={
                  !Number(amount) ||
                  validationError?.message ||
                  inProgress ||
                  !selectedAssetId
                }
                onClick={handleClick}
              >
                Lend
              </Button>
            </div>
          </div>
          <div className="details-right">
            <div className="commodo-card">
              <Details
                asset={assetMap[pool?.firstBridgedAssetId?.toNumber()]}
                poolId={pool?.poolId}
                parent="lend"
              />
              <div className="mt-5">
                <Details
                  asset={assetMap[pool?.secondBridgedAssetId?.toNumber()]}
                  poolId={pool?.poolId}
                  parent="lend"
                />
              </div>
            </div>
            <div className="commodo-card">
              <Details
                asset={assetMap[pool?.mainAssetId?.toNumber()]}
                poolId={pool?.poolId}
                parent="lend"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="loader">
          <Spin />
        </div>
      )}
    </div>
  );
};

DepositTab.propTypes = {
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
  markets: PropTypes.arrayOf(
    PropTypes.shape({
      rates: PropTypes.shape({
        low: PropTypes.number,
      }),
    })
  ),
  pool: PropTypes.shape({
    poolId: PropTypes.shape({
      low: PropTypes.number,
    }),
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
  refreshBalance: PropTypes.number.isRequired,
};

const stateToProps = (state) => {
  return {
    address: state.account.address,
    pool: state.lend.pool._,
    assetMap: state.asset._.map,
    balances: state.account.balances.list,
    lang: state.language,
    markets: state.oracle.market.list,
    refreshBalance: state.account.refreshBalance,
  };
};

const actionsToProps = { setBalanceRefresh };

export default connect(stateToProps, actionsToProps)(DepositTab);
