import { Button, message } from 'antd';
import * as PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from 'react'
import { connect } from "react-redux";
import { Col, Row, SvgIcon } from '../../../components/common';
import CustomInput from '../../../components/CustomInput';
import TooltipIcon from '../../../components/TooltipIcon';
import { amountConversion, amountConversionWithComma, denomConversion, getAmount, getDenomBalance } from '../../../utils/coin';
import { iconNameFromDenom, toDecimals } from '../../../utils/string';
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { ValidateInputNumber } from '../../../config/_validation';
import { setAmountIn } from '../../../actions/asset';
import { DatePicker, Space } from 'antd';
import { Radio } from 'antd';
import { vestingCreateWeightage } from '../../../services/vestingContractsRead';
import { transactionForCreateVesting } from '../../../services/vestingContractsWrite';
import { PRODUCT_ID } from '../../../constants/common';
import { setBalanceRefresh } from "../../../actions/account";
import { setVestingRadioInput } from "../../../actions/vesting";
import { marketPrice } from '../../../utils/number';
import moment from 'moment';


const Create = ({
    lang,
    address,
    refreshBalance,
    setBalanceRefresh,
    balances,
    markets,
    vestingRadioInput,
}) => {
    const dispatch = useDispatch();
    const inAmount = useSelector((state) => state.asset.inAmount);

    const [loading, setLoading] = useState(false);
    const [inputValidationError, setInputValidationError] = useState(false);
    const [radioValue, setRadioValue] = useState("t1");
    const [totalVestingData, setTotalVestingData] = useState();
    const [veHarbor, setVeHarbor] = useState(0);
    const [unlockDate, setUnlockDate] = useState(moment().add(1, 'week').format("DD - MMMM - YYYY"));
    const dateFormat = 'DD-MMMM-YYYY';


    // Query 
    const fetchVestingCreateWeightage = () => {
        vestingCreateWeightage().then((res) => {
            setTotalVestingData(res)
        }).catch((error) => {
            console.log(error);
        })
    }

    const handleSubmit = () => {
        setLoading(true)
        if (address) {
            if (inAmount) {
                transactionForCreateVesting(address, PRODUCT_ID, radioValue, inAmount, (error, result) => {
                    if (error) {
                        message.error("Transaction failed")
                        setLoading(false)
                        return;
                    }
                    message.success("Success")
                    dispatch(setAmountIn());
                    setVeHarbor(0)
                    setBalanceRefresh(refreshBalance + 1);
                    setLoading(false)
                })
            } else {
                setLoading(false)
                dispatch(setAmountIn());
                setVeHarbor(0)
                message.error("Please enter amount")
            }
        }
        else {
            setLoading(false)
            message.error("Please Connect Wallet")
        }
    }

    const onRadioInputChange = (e) => {
        setRadioValue(e.target.value);
        dispatch(setVestingRadioInput(e.target.value))
        calculateveHarbor(inAmount, e.target.value)
        let newUnlockDate = calculateDateValue(e.target.value);
        setUnlockDate(newUnlockDate)
    };

    const handleFirstInputChange = (value) => {
        value = toDecimals(value).toString().trim();
        setInputValidationError(
            ValidateInputNumber(
                Number(getAmount(value)),
                getDenomBalance(balances, "uharbor")
            )
        );
        dispatch(setAmountIn(value));
        calculateveHarbor(value, vestingRadioInput);
    };

    const calculateveHarbor = (value, vestingRadioInput = "t1") => {
        if (vestingRadioInput === "t1") {
            let amount = getAmount(value)
            let calculateveharborAmount = amount * totalVestingData?.t1?.weight;
            calculateveharborAmount = amountConversion(calculateveharborAmount);
            setVeHarbor(calculateveharborAmount);

        }
        else if (vestingRadioInput === "t2") {
            let amount = getAmount(value)
            let calculateveharborAmount = amount * totalVestingData?.t2?.weight;
            calculateveharborAmount = amountConversion(calculateveharborAmount);
            setVeHarbor(calculateveharborAmount);

        }
        else if (vestingRadioInput === "t3") {
            let amount = getAmount(value)
            let calculateveharborAmount = amount * totalVestingData?.t3?.weight;
            calculateveharborAmount = amountConversion(calculateveharborAmount);
            setVeHarbor(calculateveharborAmount);
        }
        else if (vestingRadioInput === "t4") {
            let amount = getAmount(value)
            let calculateveharborAmount = amount * totalVestingData?.t4?.weight;
            calculateveharborAmount = amountConversion(calculateveharborAmount);
            setVeHarbor(calculateveharborAmount);
        }
    }

    const handleMaxClick = () => {
        let maxValue = amountConversion(getDenomBalance(balances, "uharbor"))
        calculateveHarbor(maxValue, vestingRadioInput)
        dispatch(setAmountIn(maxValue));
    }

    const calculateDateValue = (value = "t1") => {
        let currentData = moment().format(dateFormat)
        if (value === "t1") {
            let new_date = moment(currentData, "DD-MMMM-YYYY").add(1, 'week').format(dateFormat);
            return new_date;
        }
        else if (value === "t2") {
            let new_date = moment(currentData, "DD-MMMM-YYYY").add(1, 'month').format(dateFormat);
            return new_date;
        }
        else if (value === "t3") {
            let new_date = moment(currentData, "DD-MMMM-YYYY").add(1, 'year').format(dateFormat);
            return new_date;
        }
        else if (value === "t4") {
            let new_date = moment(currentData, "DD-MMMM-YYYY").add(4, 'year').format(dateFormat);
            return new_date;
        }
        console.log(currentData, "current date");
        console.log(new_date, "newData");
    }

    // calculateDateValue()

    // UseEffect calls 
    useEffect(() => {
        fetchVestingCreateWeightage()
    }, [address, refreshBalance])

    return (
        <>
            <div className=" locker-create-main-wrapper">
                <div className="farm-content-card earn-deposite-card earn-main-deposite locker-main-container">
                    <div className="locker-title">Create New Lock</div>
                    <div className="amount-available-main-container">
                        <div className="amount-container">Amount</div>
                        <div className="available-container">
                            <div className="label-right">
                                Available
                                <span className="ml-1">
                                    {amountConversionWithComma(getDenomBalance(balances, "uharbor") || 0)} {denomConversion("uharbor")}
                                </span>
                                <div className="maxhalf">
                                    <Button className="active" onClick={() => handleMaxClick()} >
                                        Max
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="assets-select-card  ">
                        <div className="assets-right">
                            <div className="input-select">
                                <CustomInput
                                    value={inAmount}
                                    onChange={(event) => {
                                        handleFirstInputChange(event.target.value);
                                    }}
                                    validationError={inputValidationError}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="date-main-container mt-4">
                        <div className="amount-available-main-container">
                            <div className="amount-container">Date <TooltipIcon text="Expected unlock date for locked HARBOR" /></div>
                        </div>
                        <div className="assets-select-card  ">
                            <div className="assets-right">
                                <div className="input-select">
                                    <Space direction="vertical">
                                        <DatePicker value={moment(unlockDate, dateFormat)} format={dateFormat} disabled />
                                    </Space>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="date-main-container mt-4">
                        <div className="amount-available-main-container">
                            <div className="amount-container">Expires</div>
                        </div>
                        <div className="radio-input-main-container mt-2">
                            <div className="assets-right">
                                <div className="input-select">
                                    <Radio.Group onChange={onRadioInputChange} value={radioValue}>
                                        <Radio value="t1" >1 Week <TooltipIcon text="1 week - 1000/208 = 4.80 veHARBOR" /></Radio>
                                        <Radio value="t2" >1 Month <TooltipIcon text="1 month - 1000/48 = 20.83 veHARBOR" /></Radio>
                                        <Radio value="t3" >1 Years <TooltipIcon text="1 year - 1000/4 = 250 veHARBOR" /></Radio>
                                        <Radio value="t4" >4 Years <TooltipIcon text="4 year = 1000 veHARBOR" /></Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="voting-main-container mt-4 ml-1">
                        <div className="voting-title">Your voting power will be:</div>
                        <div className="value-main-container">
                            <div className="harbor-value">{veHarbor} veHARBOR</div>
                            <div className="harbor-locked-value">

                            </div>
                        </div>
                    </div>
                    <div className="assets-poolSelect-btn">
                        <div className="assets-form-btn text-center  mb-2">
                            <Button
                                type="primary"
                                className="btn-filled"
                                loading={loading}
                                onClick={() => handleSubmit()}
                                disabled={
                                    !Number(inAmount) ||
                                    inputValidationError?.message
                                }
                            >
                                Lock
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
Create.prototype = {
    lang: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    refreshBalance: PropTypes.number.isRequired,
    balances: PropTypes.arrayOf(
        PropTypes.shape({
            denom: PropTypes.string.isRequired,
            amount: PropTypes.string,
        })
    ),
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
    vestingRadioInput: PropTypes.string,

}
const stateToProps = (state) => {
    return {
        lang: state.language,
        address: state.account.address,
        refreshBalance: state.account.refreshBalance,
        balances: state.account.balances.list,
        markets: state.oracle.market.list,
        vestingRadioInput: state.vesting.vestingRadioInput,
    };
};
const actionsToProps = {
    setBalanceRefresh,
    // setVestingRadioInput,
};

export default connect(stateToProps, actionsToProps)(Create);
