import { Button, Slider, message, Spin } from "antd";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { SvgIcon } from "../../../../components/common";
import CustomInput from "../../../../components/CustomInput";
import TooltipIcon from "../../../../components/TooltipIcon";
import { useParams } from "react-router";
import {
  amountConversion,
  amountConversionWithComma,
  getAmount,
  getDenomBalance,
} from "../../../../utils/coin";
import { denomToSymbol, iconNameFromDenom, toDecimals } from "../../../../utils/string";
import variables from "../../../../utils/variables";
import "./index.scss";
import PricePool from "./PricePool";
import {
  setPair,
  setAssetIn,
  setAssetOut,
  setAmountIn,
  setAmountOut,
  setCollateralRatio,
} from "../../../../actions/asset";
import { commaSeparator, decimalConversion, marketPrice } from "../../../../utils/number";
import "./index.scss";
import VaultDetails from "./VaultDetails";
import { connect, useDispatch } from "react-redux";
import { ValidateInputNumber } from "../../../../config/_validation";
import { setComplete } from "../../../../actions/swap";
import { setVault } from "../../../../actions/account";
import { comdex } from "../../../../config/network";
import { DEFAULT_FEE, DOLLAR_DECIMALS, PRODUCT_ID } from "../../../../constants/common";
import { signAndBroadcastTransaction } from "../../../../services/helper";
import { getTypeURL } from "../../../../services/transaction";
import Snack from "../../../../components/common/Snack";
import { useSelector } from "react-redux";
import Long from "long";
import { queryPair, queryPairVault } from "../../../../services/asset/query";
import { setExtendedPairVaultListData, setSelectedExtentedPairvault } from "../../../../actions/locker";
import { queryUserVaultsInfo } from "../../../../services/vault/query";
import { setOwnerCurrentCollateral } from "../../../../actions/mint";

const Mint = ({
  lang,
  address,
  pair,
  balances,
  setPair,
  setAmountIn,
  setAmountOut,
  setComplete,
  inAmount,
  outAmount,
  markets,
  collateralRatio,
  setCollateralRatio,
  vault,
  refreshBalance,
  setOwnerCurrentCollateral,
  ownerVaultInfo,
  ownerCurrrentCollateral,
}) => {
  // pathVaultId ----> extentedPairvaultId
  const { pathVaultId } = useParams();


  const [inProgress, setInProgress] = useState(false);
  const [validationError, setValidationError] = useState();
  const [debtValidationError, setDebtValidationError] = useState();
  const [loading, setLoading] = useState(false);
  const [currentExtentedVaultdata, setCurrentExtentedVaultdata] = useState();
  const [editType, setEditType] = useState("Mint")

  const dispatch = useDispatch();
  const selectedExtentedPairVaultListData = useSelector((state) => state.locker.extenedPairVaultListData);
  const pairId = selectedExtentedPairVaultListData && selectedExtentedPairVaultListData[0]?.pairId?.low;
  const ownerVaultId = useSelector((state) => state.locker.ownerVaultId);

  const getOwnerVaultInfo = (ownerVaultId) => {
    queryUserVaultsInfo(ownerVaultId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      let ownerCollateral = decimalConversion(data?.vaultsInfo?.collateralizationRatio) * 100
      ownerCollateral = Number(ownerCollateral).toFixed(DOLLAR_DECIMALS)
      setOwnerCurrentCollateral(ownerCollateral)
    });
  };

  const getLiquidationPrice = () => {
    // formula = ((Liquidiation Ratio) * (Composite already minted + Composite to be minted) )/ (Quantity of Asset Locked + Quantity of Asset to be Locked)
    let liquidationRatio = Number(decimalConversion(selectedExtentedPairVaultListData[0]?.minCr)) // no converting into %
    let mintedCMST = 0;
    let currentAmountOut = Number(outAmount);
    let lockedAmountOut = 0;
    let currentAmountIn = Number(inAmount);
    let calculatedAmount = (liquidationRatio * ((mintedCMST + currentAmountOut) / (lockedAmountOut + currentAmountIn)))
    calculatedAmount = commaSeparator(Number(calculatedAmount || 0).toFixed(DOLLAR_DECIMALS));
    return calculatedAmount;
  };

  const onChange = (value) => {
    value = toDecimals(value).toString().trim();

    if (ownerVaultId) {
      handleAmountInChangeWhenVaultExist(value)
    } else {
      handleAmountInChange(value);
    }
    setValidationError(
      ValidateInputNumber(getAmount(value), collateralAssetBalance)
    );
  };

  const onSecondInputChange = (value) => {
    value = toDecimals(value).toString().trim();
    handleAssetOutChange(value)
  }

  const handleAmountInChangeWhenVaultExist = (value) => {
    let debtFloor = Number(selectedExtentedPairVaultListData[0]?.debtFloor);

    setValidationError(
      ValidateInputNumber(getAmount(value), collateralAssetBalance)
    );
    setAmountIn(value);
    let dataAmount = calculateAmountOut(
      value,
      selectedTokenPrice,
      Number(ownerCurrrentCollateral) / 100,
      marketPrice(markets, pair && pair?.denomOut)
    );
    setAmountOut(dataAmount);
  }

  const handleAmountInChange = (value) => {
    let debtFloor = Number(selectedExtentedPairVaultListData[0]?.debtFloor);

    setValidationError(
      ValidateInputNumber(getAmount(value), collateralAssetBalance)
    );
    setAmountIn(value);
    let dataAmount = calculateAmountOut(
      value,
      selectedTokenPrice,
      collateralRatio / 100,
      marketPrice(markets, pair && pair?.denomOut)
    );
    setAmountOut(dataAmount);
    setDebtValidationError(
      ValidateInputNumber(getAmount(dataAmount), "", "", debtFloor)
    );

  };

  const collateralAssetBalance = getDenomBalance(balances, pair && pair?.denomIn) || 0;
  // eslint-disable-next-line no-unused-vars
  const stableAssetBalance = getDenomBalance(balances, 'ucmst') || 0;

  const calculateAmountOut = (
    inAmount,
    inAssetPrice,
    ratio,
    amountOutPrice
  ) => {
    const amount = (inAmount * inAssetPrice) / (ratio * amountOutPrice);
    return ((isFinite(amount) && amount) || 0).toFixed(6);
  };

  const selectedTokenPrice = marketPrice(markets, pair && pair?.denomIn);
  const stableTokenPrice = marketPrice(markets, pair && pair?.denomOut);

  let minCrRatio = decimalConversion(selectedExtentedPairVaultListData[0]?.minCr) * 100;
  minCrRatio = Number(minCrRatio);
  let safeCrRatio = minCrRatio + 50;

  const showInAssetValue = () => {
    const oralcePrice = marketPrice(markets, pair?.denomIn);
    const total = oralcePrice * inAmount;

    return `≈ $${Number(total && isFinite(total) ? total : 0).toFixed(
      DOLLAR_DECIMALS
    )}`;
  };

  const showOutAssetValue = () => {
    const oralcePrice = marketPrice(markets, pair?.denomOut);
    const total = oralcePrice * outAmount;

    return `≈ $${Number(total && isFinite(total) ? total : 0).toFixed(
      DOLLAR_DECIMALS
    )}`;
  };

  const handleSliderChange = (value) => {
    let amountOutCalculated;
    let debtFloor = Number(selectedExtentedPairVaultListData[0]?.debtFloor);
    setCollateralRatio(value);
    setAmountOut(
      calculateAmountOut(
        inAmount,
        selectedTokenPrice,
        value / 100,
        marketPrice(markets, pair && pair?.denomOut)
      )
    );
    amountOutCalculated = calculateAmountOut(
      inAmount,
      selectedTokenPrice,
      value / 100,
      marketPrice(markets, pair && pair?.denomOut)
    )

    setDebtValidationError(
      ValidateInputNumber(getAmount(amountOutCalculated), "", "", debtFloor)
    );
  };

  const handleMaxClick = () => {
    if (pair && pair?.denomIn === comdex.coinMinimalDenom) {
      return Number(collateralAssetBalance) > DEFAULT_FEE
        ? handleAmountInChange(
          amountConversion(collateralAssetBalance - DEFAULT_FEE)
        )
        : handleAmountInChange();
    } else {
      return handleAmountInChange(amountConversion(collateralAssetBalance));
    }
  };

  const handleOutMaxClick = () => {
    setAmountOut(calculateWithdrawableAmount())
    setCollateralRatio(minCrRatio)
  };

  const handleAssetOutChange = (value) => {
    setAmountOut(value)
    let debtFloor = Number(selectedExtentedPairVaultListData[0]?.debtFloor);
    setDebtValidationError(
      ValidateInputNumber(getAmount(value), "", "", debtFloor)
    );
    let currentCr = collateralRatio;
    let amountOut = value;
    let amountInPrice = Number(selectedTokenPrice)
    let amountIn = inAmount;

    // Calculating amountIn
    let calculateAmountIn = ((currentCr * amountOut) / amountInPrice) / 100;
    // eslint-disable-next-line no-unused-vars
    calculateAmountIn = ((isFinite(calculateAmountIn) && calculateAmountIn) || 0).toFixed(6)

    // Calculating current Collateral Ratio
    let calculateCurrrentCr = ((amountIn * amountInPrice) / (value * stableTokenPrice) * 100);
    calculateCurrrentCr = Number(calculateCurrrentCr).toFixed(DOLLAR_DECIMALS);
    setCollateralRatio(calculateCurrrentCr)
  }

  const resetValues = () => {
    setAmountIn(0);
    setAmountOut(0);
  };

  const handleCreate = () => {
    if (!address) {
      message.error("Address not found, please connect to Keplr");
      return;
    }

    if (ownerVaultId) {

      setInProgress(true);
      message.info("Transaction initiated");
      signAndBroadcastTransaction(
        {
          message: {
            typeUrl: getTypeURL("drawAndRepay"),
            value: {
              from: address,
              appId: Long.fromNumber(PRODUCT_ID),
              extendedPairVaultId: Long.fromNumber(pathVaultId),
              userVaultId: Long.fromNumber(ownerVaultId),
              amount: getAmount(inAmount),
            },
          },
          fee: {
            amount: [{ denom: "ucmdx", amount: DEFAULT_FEE.toString() }],
            gas: "2500000",
          },
        },
        address,
        (error, result) => {
          setInProgress(false);
          if (error) {
            message.error(error);
            resetValues();
            return;
          }

          if (result?.code) {
            message.info(result?.rawLog);
            resetValues();
            return;
          }

          setComplete(true);
          message.success(
            <Snack
              message={variables[lang].tx_success}
              hash={result?.transactionHash}
            />
          );
          resetValues();
          dispatch({
            type: "BALANCE_REFRESH_SET",
            value: refreshBalance + 1,
          });
        }
      );
      return;
    } else {

      setInProgress(true);
      message.info("Transaction initiated");
      signAndBroadcastTransaction(
        {
          message: {
            typeUrl: getTypeURL("create"),
            value: {
              from: address,
              appId: Long.fromNumber(PRODUCT_ID),
              extendedPairVaultId: Long.fromNumber(pathVaultId),
              amountIn: getAmount(inAmount),
              amountOut: getAmount(outAmount),
            },
          },
          fee: {
            amount: [{ denom: "ucmdx", amount: DEFAULT_FEE.toString() }],
            gas: "2500000",
          },
        },
        address,
        (error, result) => {
          setInProgress(false);
          if (error) {
            message.error(error);
            resetValues();
            return;
          }

          if (result?.code) {
            message.info(result?.rawLog);
            resetValues();
            return;
          }

          setComplete(true);
          message.success(
            <Snack
              message={variables[lang].tx_success}
              hash={result?.transactionHash}
            />
          );
          resetValues();
          dispatch({
            type: "BALANCE_REFRESH_SET",
            value: refreshBalance + 1,
          });
        }
      );
    }
  };

  const fetchQueryPairValut = (pairVaultId) => {
    setLoading(true)
    queryPairVault(pairVaultId, (error, data) => {
      if (error) {
        message.error(error);
        setLoading(false)
        return;
      }
      setCurrentExtentedVaultdata(data?.pairVault)
      dispatch(setExtendedPairVaultListData(data?.pairVault))
      dispatch(setSelectedExtentedPairvault(data?.pairVault))
      setLoading(false)
    })
  }

  const getAssetDataByPairId = (pairId) => {
    queryPair(pairId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setPair(data?.pairInfo)
    })
  }

  const calculateWithdrawableAmount = () => {
    let amountIn = Number(inAmount);
    let amountInPrice = Number(selectedTokenPrice);
    let minCr = minCrRatio;
    let calculateWithdrawable = Number(((amountIn * amountInPrice) / minCr) * 100).toFixed(DOLLAR_DECIMALS)
    return calculateWithdrawable;
  }

  calculateWithdrawableAmount()

  useEffect(() => {
    if (ownerVaultId) {
      setEditType("Deposit And Draw")
    }
    else {
      setEditType("Mint")
    }
  }, [ownerVaultId])

  useEffect(() => {
    if (ownerVaultInfo?.id) {
      getOwnerVaultInfo(ownerVaultInfo?.id)
    }
    else {
      setOwnerCurrentCollateral(0)
    }
  }, [ownerVaultInfo, refreshBalance])

  useEffect(() => {
    if (!ownerVaultId) {
      setOwnerCurrentCollateral(0)
    }
  }, [ownerVaultId, ownerVaultInfo])

  useEffect(() => {
    resetValues()
    fetchQueryPairValut(pathVaultId);
    if (pairId) {
      getAssetDataByPairId(pairId);
    }
  }, [address, pairId, refreshBalance])

  useEffect(() => {
    resetValues();
  }, []);

  useEffect(() => {
    setCollateralRatio(safeCrRatio);
  }, [safeCrRatio]);


  const marks = {
    0: "0%",
    [minCrRatio]: `Min`,
    [safeCrRatio]: `Safe`,
    500: "500%"
  };

  if (loading) {
    return <div className="spinner"><Spin /></div>
  }

  return (
    <>
      <div className="details-wrapper">
        <div className="details-left farm-content-card earn-deposite-card vault-mint-card">
          <div className="mint-title">Configure Your Vault</div>
          <div className="assets-select-card">
            <div className="assets-left">
              <label className="leftlabel">
                Deposit  <TooltipIcon text="Asset that will be locked as collateral in the vault" />
              </label>
              <div className="assets-select-wrapper">
                {/* Icon Container Start  */}
                <div className="farm-asset-icon-container">
                  <div className="select-inner">
                    <div className="svg-icon">
                      <div className="svg-icon-inner">
                        <SvgIcon name={pair && pair.denomIn ? iconNameFromDenom(pair && pair?.denomIn) : ""} />
                        <span> {pair && pair.denomIn ? denomToSymbol(pair && pair?.denomIn) : "Loading..."}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Icon Container End  */}
              </div>
            </div>
            <div className="assets-right">
              <div className="label-right">
                Available
                <span className="ml-1">
                  {amountConversionWithComma(collateralAssetBalance)} {denomToSymbol(pair && pair?.denomIn)}
                </span>
                <div className="maxhalf">
                  <Button
                    className="active"
                    onClick={() =>
                      handleMaxClick()
                    }
                  >
                    max
                  </Button>
                </div>
              </div>
              <div className="input-select">
                <CustomInput
                  value={inAmount}
                  onChange={(event) =>
                    onChange(event.target.value)
                  }
                  validationError={validationError}
                />
                <small>$ {showInAssetValue()}</small>
              </div>
            </div>
          </div>

          <div className={ownerVaultId ? "assets-select-card  vault-exist-margin" : "assets-select-card mt-4"}>
            <div className="assets-left">
              <label className="leftlabel">
                Withdraw <TooltipIcon text="CMST being borrowed from the vault based on the collateral value" />
              </label>
              <div className="assets-select-wrapper">
                {/* Icon Container Start  */}
                <div className="farm-asset-icon-container">
                  <div className="select-inner">
                    <div className="svg-icon">
                      <div className="svg-icon-inner">
                        <SvgIcon name={iconNameFromDenom("ucmst")} />{" "}
                        <span> CMST</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Icon Container End  */}
              </div>
            </div>
            <div className="assets-right">

              {!ownerVaultId && <div className="label-right">
                Withdrawable
                <span className="ml-1">
                  {calculateWithdrawableAmount()} {denomToSymbol(pair && pair?.denomOut)}
                </span>
                <div className="maxhalf">
                  <Button
                    className="active"
                    onClick={() => {
                      handleOutMaxClick()
                    }
                    }
                  >
                    max
                  </Button>
                </div>
              </div>
              }
              <div className="input-select">
                <CustomInput
                  value={outAmount}
                  onChange={(e) => {
                    onSecondInputChange(e.target.value)
                  }}
                  validationError={debtValidationError}
                  disabled={ownerVaultId ? true : false}
                />
                <small>$ {showOutAssetValue()}</small>
              </div>
            </div>
          </div>

          {!ownerVaultId && <div className="Interest-rate-container mt-4">
            <div className="slider-numbers mt-4">
              <Slider
                className={
                  "comdex-slider borrow-comdex-slider " +
                  (collateralRatio <= minCrRatio
                    ? " red-track"
                    : collateralRatio < safeCrRatio
                      ? " orange-track"
                      : collateralRatio >= safeCrRatio
                        ? " green-track"
                        : " ")
                }
                defaultValue={collateralRatio}
                marks={marks}
                value={collateralRatio}
                max={500}
                onChange={handleSliderChange}
                min={0}
                tooltipVisible={false}
              />
              {/* collateral container  */}
              <div className="slider-input-box-container mt-2">
                <div className="title">
                  <div className="title">Set Collateral Ratio</div>
                </div>
                <div className="input-box-container">
                  <CustomInput
                    defaultValue={collateralRatio}
                    onChange={(event) => {
                      handleSliderChange(event.target?.value);
                    }}
                    placeholder="0"
                    value={collateralRatio}
                  />
                  <span className="collateral-percentage">%</span>
                </div>

              </div>
              {/* Liquidation Container  */}
              <div className="slider-input-box-container mt-2">
                <div className="title">
                  <div className="title">Expected liquidation price</div>
                </div>
                <div className="input-box-container">
                  <div className="liquidation-price">
                    ${getLiquidationPrice()}
                  </div>
                </div>

              </div>
            </div>
          </div>
          }

          {/* <Info /> */}
          <div className="assets PoolSelect-btn">
            <div className="assets-form-btn text-center  mb-2">
              <Button
                loading={inProgress}
                disabled={
                  inProgress ||
                  !pair ||
                  !Number(inAmount) ||
                  !Number(outAmount) ||
                  validationError?.message ||
                  debtValidationError?.message ||
                  Number(collateralRatio) < minCrRatio
                }
                loading={inProgress}
                type="primary"
                className={ownerVaultId ? "btn-filled mt-4" : "btn-filled"}
                onClick={() => handleCreate()}
              >
                {editType}
              </Button>
            </div>
          </div>
        </div>

        <div className="details-right ">
          <PricePool />
          <VaultDetails item={currentExtentedVaultdata} />
        </div>
      </div>
    </>
  );
};

Mint.prototype = {
  lang: PropTypes.string.isRequired,
  setAmountIn: PropTypes.func.isRequired,
  setAmountOut: PropTypes.func.isRequired,
  setAssetIn: PropTypes.func.isRequired,
  setAssetOut: PropTypes.func.isRequired,
  setCollateralRatio: PropTypes.func.isRequired,
  setComplete: PropTypes.func.isRequired,
  setPair: PropTypes.func.isRequired,
  setVault: PropTypes.func.isRequired,
  address: PropTypes.string,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  collateralRatio: PropTypes.number,
  inAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  markets: PropTypes.arrayOf(
    PropTypes.shape({
      rates: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
      symbol: PropTypes.string,
      script_id: PropTypes.string,
    })
  ),
  outAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pair: PropTypes.shape({
    denomIn: PropTypes.string,
    denomOut: PropTypes.string,
  }),
  pairs: PropTypes.shape({
    list: PropTypes.arrayOf(
      PropTypes.shape({
        denomIn: PropTypes.string,
        denomOut: PropTypes.string,
        liquidationRatio: PropTypes.string,
        id: PropTypes.shape({
          high: PropTypes.number,
          low: PropTypes.number,
          unsigned: PropTypes.bool,
        }),
      })
    ),
  }),
  refreshBalance: PropTypes.number.isRequired,
  vault: PropTypes.shape({
    collateral: PropTypes.shape({
      denom: PropTypes.string,
    }),
    debt: PropTypes.shape({
      denom: PropTypes.string,
    }),
    id: PropTypes.shape({
      low: PropTypes.number,
    }),
  }),
  ownerVaultInfo: PropTypes.array,
  ownerCurrrentCollateral: PropTypes.number.isRequired,
  ownerVaultId: PropTypes.string,
  vaults: PropTypes.arrayOf(
    PropTypes.shape({
      collateral: PropTypes.shape({
        amount: PropTypes.string,
        denom: PropTypes.string,
      }),
      debt: PropTypes.shape({
        amount: PropTypes.string,
        denom: PropTypes.string,
      }),
      id: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
    })
  ),
}
const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    pair: state.asset.pair,
    pairs: state.asset.pairs,
    inAmount: state.asset.inAmount,
    outAmount: state.asset.outAmount,
    markets: state.oracle.market.list,
    collateralRatio: state.asset.collateralRatio,
    balances: state.account.balances.list,
    vaults: state.account.vaults.list,
    vault: state.account.vault,
    refreshBalance: state.account.refreshBalance,
    ownerVaultInfo: state.locker.ownerVaultInfo,
    ownerCurrrentCollateral: state.mint.ownerCurrrentCollateral,
    ownerVaultId: state.locker.ownerVaultId,
  };
};

const actionsToProps = {
  setPair,
  setVault,
  setComplete,
  setAssetIn,
  setAssetOut,
  setAmountIn,
  setAmountOut,
  setCollateralRatio,
  setOwnerCurrentCollateral,
};
export default connect(stateToProps, actionsToProps)(Mint);
