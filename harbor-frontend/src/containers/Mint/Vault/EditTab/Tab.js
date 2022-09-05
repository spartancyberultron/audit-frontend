import "../index.scss";
import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../../../components/common";
import React, { useEffect, useState } from "react";
import { Button, message, Slider } from "antd";
import TooltipIcon from "../../../../components/TooltipIcon";
import { denomToSymbol, iconNameFromDenom } from "../../../../utils/string";
import { amountConversion, getDenomBalance } from "../../../../utils/coin";
import { signAndBroadcastTransaction } from "../../../../services/helper";
import { defaultFee } from "../../../../services/transaction";
import { getAmount } from "../../../../utils/coin";
import { getTypeURL } from "../../../../services/transaction";
import CustomInput from "../../../../components/CustomInput";
import {
  commaSeparator,
  decimalConversion,
  formatNumber,
  marketPrice,
  truncateToDecimals,
} from "../../../../utils/number";
import { ValidateInputNumber } from "../../../../config/_validation";
import { DOLLAR_DECIMALS, PRODUCT_ID } from "../../../../constants/common";
import { setExtendedPairVaultListData, setEstimatedLiquidationPrice } from "../../../../actions/locker";
import {
  queryOwnerVaults,
  queryOwnerVaultsInfo,
  queryUserVaultsInfo,
} from "../../../../services/vault/query";
import { connect } from "react-redux";
import { setPairs } from "../../../../actions/asset";
import { setAccountVaults } from "../../../../actions/account";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setBalanceRefresh } from "../../../../actions/account";
import { setOwnerVaultId, setOwnerVaultInfo } from "../../../../actions/locker";
import { useParams } from "react-router";
import Long from "long";
import { queryPairVault } from "../../../../services/asset/query";
import { setOwnerCurrentCollateral } from "../../../../actions/mint";

const Edit = ({
  address,
  pair,
  markets,
  ownerVaultId,
  ownerVaultInfo,
  setOwnerVaultId,
  setOwnerCurrentCollateral,
  setOwnerVaultInfo,
  setBalanceRefresh,
  refreshBalance,
  balances,
  setEstimatedLiquidationPrice,
}) => {
  const dispatch = useDispatch();
  const { pathVaultId } = useParams();

  const vault = useSelector((state) => state.account.vault);

  const selectedExtentedPairVaultListData = useSelector(
    (state) => state.locker.extenedPairVaultListData
  );

  const [inProgress, setInProgress] = useState(false);
  const [inputAmount, setInputAmount] = useState();
  const [editType, setEditType] = useState("deposit");
  const [inputValidationError, setInputValidationError] = useState();
  const [newCollateralRatio, setNewCollateralRatio] = useState();
  const [collateralRatio, setCollateralRatio] = useState();
  const [deposit, setDeposit] = useState();
  const [withdraw, setWithdraw] = useState();
  const [repay, setRepay] = useState();
  const [draw, setDraw] = useState();
  const [showDepositMax, setShowDepositMax] = useState(true);
  const [showWithdrawMax, setShowWithdrawMax] = useState(false);
  const [showDrawMax, setShowDrawMax] = useState(false);
  const [showRepayMax, setShowRepayMax] = useState(false);

  const selectedExtendedPairVaultListData = useSelector(
    (state) => state.locker.extenedPairVaultListData[0]
  );
  const estimatedLiquidationPrice = useSelector(
    (state) => state.locker.estimatedLiquidationPrice,
  );
  useEffect(() => {
    fetchQueryPairValut(pathVaultId);
  }, [address]);

  useEffect(() => {
    if (address && selectedExtentedPairVaultListData[0]?.id?.low) {
      getOwnerVaultId(
        PRODUCT_ID,
        address,
        selectedExtentedPairVaultListData[0]?.id?.low
      );
    } else {
      setOwnerVaultId("")
    }
  }, [address, vault]);

  useEffect(() => {
    if (ownerVaultId) {
      getOwnerVaultInfoByVaultId(ownerVaultId);
    }
    else {
      setOwnerVaultInfo('');
      setOwnerCurrentCollateral(0)
      setNewCollateralRatio(0)
    }
  }, [address, ownerVaultId]);
  useEffect(() => {
    if (ownerVaultInfo?.id) {
      if (ownerVaultId) {
        getOwnerVaultInfo(ownerVaultId)
      }
      else {
        setOwnerCurrentCollateral(0)
        setNewCollateralRatio(0)
      }
    }
    else {
      setOwnerCurrentCollateral(0)
      setNewCollateralRatio(0)
    }
  }, [address, ownerVaultInfo]);

  const resetValues = () => {
    setInputValidationError();
    setInputAmount();
    setDeposit();
    setWithdraw();
    setRepay();
    setDraw();
  };

  const currentCollateral = ownerVaultInfo?.amountIn || 0;

  const currentDebt = ownerVaultInfo?.amountOut || 0;

  const collateralPrice = marketPrice(markets, pair?.denomIn);

  const debtPrice = marketPrice(markets, pair?.denomOut);

  const collateralAssetBalance = getDenomBalance(balances, pair && pair?.denomIn) || 0;


  const getOwnerVaultId = (productId, address, extentedPairId) => {
    queryOwnerVaults(productId, address, extentedPairId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setOwnerVaultId(data?.vaultId?.low);
    });
  };

  const fetchQueryPairValut = (pairVaultId) => {
    queryPairVault(pairVaultId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      dispatch(setExtendedPairVaultListData(data?.pairVault));
    });
  };

  const getOwnerVaultInfoByVaultId = (ownerVaultId) => {
    queryOwnerVaultsInfo(ownerVaultId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setOwnerVaultInfo(data.vault);
    });
  };

  const getOwnerVaultInfo = (ownerVaultId) => {
    queryUserVaultsInfo(ownerVaultId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      let ownerCollateral = decimalConversion(data?.vaultsInfo?.collateralizationRatio) * 100
      ownerCollateral = Number(ownerCollateral).toFixed(DOLLAR_DECIMALS)
      setNewCollateralRatio(ownerCollateral)
    });
  };

  let minCrRatio = decimalConversion(selectedExtentedPairVaultListData[0]?.minCr) * 100;
  minCrRatio = Number(minCrRatio);
  let safeCrRatio = minCrRatio + 50;
  let interestAccumulated = Number(amountConversion(ownerVaultInfo?.interestAccumulated));

  const handleSubmit = () => {
    setInProgress(true);
    message.info("Transaction initiated");

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: getTypeURL(editType),
          value: {
            from: address,
            appId: Long.fromNumber(PRODUCT_ID),
            extendedPairVaultId: Long.fromNumber(
              selectedExtentedPairVaultListData[0]?.id?.low
            ),
            userVaultId: ownerVaultId,
            amount: getAmount(inputAmount),
          },
        },
        fee: defaultFee(),
        memo: "",
      },
      address,
      (error, result) => {
        setInProgress(false);

        if (error) {
          message.error(error);
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }

        resetValues();
        setBalanceRefresh(refreshBalance + 1);
        message.success("success");
        getOwnerVaultInfoByVaultId(ownerVaultId);
      }
    );
  };

  const getMaxRepay = () => {
    let debtFloor = Number(
      amountConversion(selectedExtentedPairVaultListData[0]?.debtFloor)
    );
    let interestAccumulated = Number(
      amountConversion(ownerVaultInfo?.interestAccumulated)
    );
    let currentBorrowed = Number(amountConversion(currentDebt));
    let maxRepay = currentBorrowed + interestAccumulated - debtFloor;
    maxRepay = truncateToDecimals(maxRepay, 6);
    if (maxRepay < 0) {
      maxRepay = "0";
    }
    return maxRepay;
  };

  useEffect(() => {
    if (editType === "deposit") {
      getLiquidationPrice(0, inputAmount);
    }
    if (editType === "withdraw") {
      getLiquidationPrice(0, -Math.abs(inputAmount || 0));
    }
    if (editType === "draw") {
      getLiquidationPrice(inputAmount, 0);
    }
    if (editType === "repay") {
      getLiquidationPrice(-Math.abs(inputAmount || 0), 0);
    }
  }, [inputAmount, newCollateralRatio]);

  useEffect(() => {
    setCollateralRatio(safeCrRatio);
  }, [safeCrRatio]);

  const getLiquidationPrice = (
    debtToBeBorrowed = Number(0),
    collateralToBeTaken = Number(0)
  ) => {
    const collateral = amountConversion(currentCollateral);
    const borrowed = amountConversion(currentDebt);
    const liquidationRatio =
      selectedExtendedPairVaultListData?.minCr;
    setEstimatedLiquidationPrice(
      decimalConversion(liquidationRatio) *
      ((Number(borrowed) + Number(debtToBeBorrowed)) /
        (Number(collateral) + Number(collateralToBeTaken)))
    );
  };

  const withdrawableCollateral = () => {
    let depositedAsset = Number(amountConversion(ownerVaultInfo?.amountIn))
    let minCr = minCrRatio / 100;
    // let safeMinCr = (minCrRatio / 100) + 1;
    let borrowedCMST = Number(amountConversion(ownerVaultInfo?.amountOut));
    let intrest = interestAccumulated + ((10 / 100) * interestAccumulated)
    let collateralAssetPrice = collateralPrice;
    let withdrawableAmount = depositedAsset - ((minCr * (borrowedCMST + intrest)) / collateralAssetPrice)
    // let withdrawableAmount = depositedAsset - ((safeMinCr * (borrowedCMST + intrest)) / collateralAssetPrice)
    withdrawableAmount = truncateToDecimals(withdrawableAmount, 6)
    if (withdrawableAmount < 0) {
      withdrawableAmount = "0";
    }
    return withdrawableAmount;
  }
  const availableToBorrow = () => {
    let collateralLocked = Number(amountConversion(ownerVaultInfo?.amountIn))
    let collateralAssetPrice = collateralPrice;
    let minCr = minCrRatio / 100;
    // let safeMinCr = (minCrRatio / 100) + 1;
    let mintedCMST = Number(amountConversion(ownerVaultInfo?.amountOut));
    let intrest = interestAccumulated + ((10 / 100) * interestAccumulated)
    let calculatedAmount = ((collateralLocked * collateralAssetPrice) / minCr) - (mintedCMST + intrest);
    calculatedAmount = truncateToDecimals(calculatedAmount, 6)
    if (calculatedAmount < 0) {
      calculatedAmount = "0";
    }
    return calculatedAmount;
  }

  const getDepositMax = () => {
    let availableBalance = amountConversion(collateralAssetBalance);
    checkValidation(availableBalance, "deposit")
    setInputAmount(availableBalance);
    setEditType("deposit")
    setDeposit(availableBalance);
    setWithdraw("");
    setDraw("");
    setRepay("");
  }
  const getWithdrawMax = () => {
    let availableBalance = withdrawableCollateral();
    checkValidation(availableBalance, "withdraw")
    setInputAmount(availableBalance);
    setEditType("withdraw")
    setDeposit("");
    setWithdraw(availableBalance);
    setDraw("");
    setRepay("");
  }
  const getDrawMax = () => {
    let availableBalance = availableToBorrow();
    checkValidation(availableBalance, "draw")
    setInputAmount(availableBalance);
    setEditType("draw")
    setDeposit("");
    setWithdraw("");
    setDraw(availableBalance);
    setRepay("");
  }
  const getRepayMax = () => {
    let availableBalance = getMaxRepay();
    checkValidation(availableBalance, "repay")
    setInputAmount(availableBalance);
    setEditType("repay")
    setDeposit("");
    setWithdraw("");
    setDraw("");
    setRepay(availableBalance);
  }

  const handleSliderChange = (value, type = editType) => {
    console.log(value);
    const newRatio = value / 100; // converting value to ratio
    console.log(newRatio, "newRatio");
    if (type === "deposit") {
      let newInput =
        (Number(currentDebt) * debtPrice * newRatio) / collateralPrice -
        Number(currentCollateral);
      newInput = Math.max(newInput, 0).toFixed(6)
      console.log(newInput, "new Input");
      setNewCollateralRatio(value);
      setDeposit(amountConversion(newInput));
      setInputAmount(amountConversion(newInput));
      setWithdraw(0);
      setDraw(0);
      setRepay(0);
      newInput = amountConversion(newInput, 6)
      setInputValidationError(
        ValidateInputNumber(
          Number(getAmount(newInput)),
          Number(getDenomBalance(balances, pair?.denomIn))
        )
      );
    } else if (type === "withdraw") {
      let newInput =
        Number(currentCollateral) -
        (Number(currentDebt) * debtPrice * newRatio) / collateralPrice;

      newInput = Math.max(newInput, 0)
      setNewCollateralRatio(value);
      setWithdraw(amountConversion(newInput));
      setInputAmount(amountConversion(newInput));
      setDeposit(0);
      setDraw(0);
      setRepay(0);
      newInput = amountConversion(newInput, 6)
      setInputValidationError(ValidateInputNumber(
        Number(getAmount(newInput)),
        Number(getAmount(withdrawableCollateral()))
      ));
    } else if (type === "repay") {
      let newInput =
        Number(currentDebt) -
        (Number(currentCollateral) * collateralPrice) / (debtPrice * newRatio);

      newInput = Math.max(newInput, 0)
      setNewCollateralRatio(value);
      setRepay(amountConversion(newInput));
      setInputAmount(amountConversion(newInput));
      setDeposit(0);
      setDraw(0);
      setWithdraw(0);
      newInput = amountConversion(newInput, 6)
      setInputValidationError(ValidateInputNumber(
        Number(getAmount(newInput)),
        Number(getAmount(getMaxRepay()))));
    } else {
      let newInput =
        (Number(currentCollateral) * collateralPrice) / (debtPrice * newRatio) -
        Number(currentDebt);

      newInput = Math.max(newInput, 0)
      setNewCollateralRatio(value);
      setDraw(amountConversion(newInput));
      setInputAmount(amountConversion(newInput));
      setDeposit(0);
      setWithdraw(0);
      setRepay(0);
      newInput = amountConversion(newInput, 6)
      setInputValidationError(ValidateInputNumber(
        Number(getAmount(newInput)),
        Number(getAmount(availableToBorrow()))
      ));
    }
  };

  const checkValidation = (value, type) => {
    if (type === "deposit") {
      const ratio =
        ((Number(currentCollateral) + Number(getAmount(value))) *
          collateralPrice) /
        (Number(currentDebt) * debtPrice);

      setNewCollateralRatio((ratio * 100).toFixed(1));
      setInputValidationError(
        ValidateInputNumber(
          Number(getAmount(value)),
          Number(getDenomBalance(balances, pair?.denomIn))
        )
      );
    } else if (type === "withdraw") {
      const ratio =
        ((Number(currentCollateral) - Number(getAmount(value))) *
          collateralPrice) /
        (Number(currentDebt) * debtPrice);

      setNewCollateralRatio((ratio * 100).toFixed(1));
      let withdrawableAmount = Number(withdrawableCollateral()).toFixed(6);
      setInputValidationError(
        ValidateInputNumber(
          Number(getAmount(value)),
          Number(getAmount(withdrawableAmount)))
      );
    } else if (type === "repay") {
      const ratio =
        (Number(currentCollateral) * collateralPrice) /
        ((Number(currentDebt) - Number(getAmount(value))) * debtPrice);

      setNewCollateralRatio((ratio * 100).toFixed(1));
      setInputValidationError(
        ValidateInputNumber(
          Number(getAmount(value)),
          Number(getAmount(getMaxRepay())))
      );
    } else {
      const ratio =
        (Number(currentCollateral) * collateralPrice) /
        ((Number(currentDebt) + Number(getAmount(value))) * debtPrice);

      setNewCollateralRatio((ratio * 100).toFixed(1));
      setInputValidationError(ValidateInputNumber(
        Number(getAmount(value)),
        Number(getAmount(availableToBorrow()))
      ));
    }
  };

  const marks = {
    0: "0%",
    [minCrRatio]: `Min`,
    [safeCrRatio]: `Safe`,
    500: "500%"
  };
  useEffect(() => {
    if (ownerVaultId) {
      getOwnerVaultInfoByVaultId(ownerVaultId)
    }
    else {
      setOwnerVaultInfo('');
      setOwnerCurrentCollateral(0)
    }
  }, [])



  return (
    <>
      <div className="edit-tab-card">
        <div className="borrw-content-card">
          <div className="borrow-edit-head">
            <div className="borrowedithead-colum">
              <label>Withdrawable Collateral</label>
              <div className="assets-col">
                <div className="assets-icons">
                  <div className="assets-icons-inner">
                    <SvgIcon name={iconNameFromDenom(pair && pair?.denomIn)} />
                  </div>
                </div>
                <h2>{withdrawableCollateral() || "0"} {denomToSymbol(pair && pair?.denomIn)}</h2>
              </div>
            </div>
            <div className="borrowedithead-colum">
              <label>Available To Borrow</label>
              <div className="assets-col">
                <div className="assets-icons">
                  <div className="assets-icons-inner">
                    <SvgIcon name={iconNameFromDenom("ucmst")} />
                  </div>
                </div>
                <h2>{availableToBorrow() || "0"} {denomToSymbol(pair && pair?.denomOut)}</h2>
              </div>
            </div>
          </div>
          <div className="brrow-edit-form">
            <Row>
              <Col sm="6" className="mb-3">
                <div className="label_max_button">
                  <label>
                    Deposit <TooltipIcon text="Deposit collateral to reduce chances of liquidation" />
                  </label>
                  {showDepositMax && <span className="ml-1" onClick={getDepositMax}>
                    <span className="available">Avl.</span>  {formatNumber(amountConversion(collateralAssetBalance, DOLLAR_DECIMALS))} {denomToSymbol(pair && pair?.denomIn)}
                  </span>}
                </div>

                <CustomInput
                  value={deposit}
                  onChange={(event) => {
                    setInputAmount(event.target.value);
                    setDeposit(event.target.value);
                    setWithdraw(0);
                    setDraw(0);
                    setRepay(0);
                    setInputValidationError(event.target.value);
                    checkValidation(event.target.value, editType);
                  }}
                  validationError={
                    editType === "deposit" ? inputValidationError : false
                  }
                  onFocus={() => {
                    setShowDepositMax(true)
                    setShowWithdrawMax(false)
                    setShowDrawMax(false)
                    setShowRepayMax(false)
                    setEditType("deposit")
                  }}
                />
              </Col>
              <Col sm="6" className="mb-3">
                <div className="label_max_button">
                  <label>
                    Withdraw <TooltipIcon text="Withdrawing your collateral would increase chances of liquidation" />
                  </label>
                  {showWithdrawMax && <span className="ml-1" onClick={() => {
                    getWithdrawMax()
                  }}>
                    <span className="available">Avl.</span>   {formatNumber(Number(withdrawableCollateral()).toFixed(DOLLAR_DECIMALS))} {denomToSymbol(pair && pair?.denomIn)}
                  </span>}
                </div>
                <CustomInput
                  value={withdraw}
                  onChange={(event) => {
                    setInputAmount(event.target.value);
                    setWithdraw(event.target.value);
                    setDeposit(0);
                    setDraw(0);
                    setRepay(0);
                    checkValidation(event.target.value, editType);
                  }}
                  validationError={
                    editType === "withdraw" ? inputValidationError : false
                  }
                  onFocus={() => {
                    setShowDepositMax(false)
                    setShowWithdrawMax(true)
                    setShowDrawMax(false)
                    setShowRepayMax(false)
                    setEditType("withdraw")
                  }}
                />
              </Col>
              <Col sm="6" className="mb-3">
                <div className="label_max_button">
                  <label>
                    Draw <TooltipIcon text="Borrow more CMST from your deposited collateral" />
                  </label>
                  {showDrawMax && <span className="ml-1" onClick={getDrawMax}>
                    <span className="available">Avl.</span>   {formatNumber(Number(availableToBorrow()).toFixed(DOLLAR_DECIMALS))} {denomToSymbol(pair && pair?.denomOut)}
                  </span>}
                </div>
                <CustomInput
                  value={draw}
                  onChange={(event) => {
                    setInputAmount(event.target.value);
                    setDraw(event.target.value);
                    setWithdraw(0);
                    setDeposit(0);
                    setRepay(0);
                    checkValidation(event.target.value, editType);
                  }}
                  validationError={
                    editType === "draw" ? inputValidationError : false
                  }
                  onFocus={() => {
                    setShowDepositMax(false)
                    setShowWithdrawMax(false)
                    setShowDrawMax(true)
                    setShowRepayMax(false)
                    setEditType("draw")
                  }}
                />
              </Col>
              <Col sm="6" className="mb-3">
                <div className="label_max_button">
                  <label>
                    Repay <TooltipIcon text="Partially repay your borrowed cAsset" />
                  </label>
                  {showRepayMax && <span className="ml-1" onClick={getRepayMax}>
                    <span className="available">Avl.</span>   {formatNumber(Number(getMaxRepay()).toFixed(DOLLAR_DECIMALS))} {denomToSymbol(pair && pair?.denomOut)}
                  </span>}
                </div>
                <CustomInput
                  value={repay}
                  onChange={(event) => {
                    setInputAmount(event.target.value);
                    setRepay(event.target.value);
                    setWithdraw(0);
                    setDraw(0);
                    setDeposit(0);
                    checkValidation(event.target.value, editType);
                  }}
                  validationError={
                    editType === "repay" ? inputValidationError : false
                  }
                  onFocus={() => {
                    setShowDepositMax(false)
                    setShowWithdrawMax(false)
                    setShowDrawMax(false)
                    setShowRepayMax(true)
                    setEditType("repay")
                  }}
                />
              </Col>
            </Row>
            <div className="Interest-rate-container mt-4">
              <div className="slider-numbers mt-4">
                <Slider
                  className={
                    "comdex-slider borrow-comdex-slider " +
                    (newCollateralRatio <= minCrRatio
                      ? " red-track"
                      : newCollateralRatio < safeCrRatio
                        ? " orange-track"
                        : newCollateralRatio >= 200
                          ? " green-track"
                          : " ")
                  }
                  defaultValue="150"
                  marks={marks}
                  value={newCollateralRatio}
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
                      value={newCollateralRatio}
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
                      $
                      {commaSeparator(
                        Number(estimatedLiquidationPrice || 0).toFixed(
                          DOLLAR_DECIMALS
                        )
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
          <div className="assets-form-btn">
            <Button
              type="primary"
              className="btn-filled"
              loading={inProgress}
              disabled={
                inProgress ||
                inputValidationError?.message ||
                !Number(inputAmount) ||
                Number(inputAmount) < 0 ||
                Number(newCollateralRatio) < minCrRatio
              }
              onClick={() => handleSubmit()}
            >
              {editType}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

Edit.propTypes = {
  setAccountVaults: PropTypes.func.isRequired,
  setEstimatedLiquidationPrice: PropTypes.func.isRequired,
  setPairs: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  setBalanceRefresh: PropTypes.func.isRequired,
  refreshBalance: PropTypes.number.isRequired,
  address: PropTypes.string,
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
  validationError: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      message: PropTypes.string.isRequired,
    }),
  ]),
  ownerVaultId: PropTypes.number,
  ownerVaultInfo: PropTypes.object,
};
const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    pair: state.asset.pair,
    pairs: state.asset.pairs,
    refreshBalance: state.account.refreshBalance,
    markets: state.oracle.market.list,
    balances: state.account.balances.list,
    ownerVaultId: state.locker.ownerVaultId,
    ownerVaultInfo: state.locker.ownerVaultInfo,
  };
};

const actionsToProps = {
  setPairs,
  setAccountVaults,
  setBalanceRefresh,
  setOwnerVaultId,
  setOwnerVaultInfo,
  setEstimatedLiquidationPrice,
  setOwnerCurrentCollateral,
};
export default connect(stateToProps, actionsToProps)(Edit);
