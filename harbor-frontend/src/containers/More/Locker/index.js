import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, message, Tabs } from 'antd';
import React, { useEffect, useState } from 'react'
import { Col, Row, SvgIcon } from '../../../components/common';
import './index.scss'
import Lock from "./lock";
import Create from "./create";
import { setBalanceRefresh } from "../../../actions/account";
import { vestingIssuedTokens, withdrawableHarbor } from "../../../services/vestingContractsRead";
import { denomToSymbol, iconNameFromDenom } from "../../../utils/string";
import { amountConversionWithComma } from "../../../utils/coin";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import { transactionForClaimLockedHarbor } from "../../../services/vestingContractsWrite";
import TooltipIcon from "../../../components/TooltipIcon";
import { commaSeparator } from "../../../utils/number";

const { TabPane } = Tabs;

const Vesting = ({
    address,
    refreshBalance,
    setBalanceRefresh,
    issuedveHARBOR
}) => {
    const [issuedToken, setIssuedTokens] = useState();
    const [withdrawableToken, setWithdrawableToken] = useState();
    const [loading, setLoading] = useState(false)
    const [activeKey, setActiveKey] = useState("1")
    const callback = (key) => {
        setActiveKey(key)
    };

    // Query 
    const fetchVestingLockNFTId = (address) => {
        vestingIssuedTokens(address).then((res) => {
            setIssuedTokens(res)
        }).catch((error) => {

            console.log(error);
        })
    }
    const fetchWithdrawableHarbor = (address) => {
        withdrawableHarbor(address).then((res) => {
            setWithdrawableToken(res?.amount)
        }).catch((error) => {
            console.log(error);
        })
    }
    const handleClaimLockedharbor = () => {
        setLoading(true)
        if (address) {
            transactionForClaimLockedHarbor(address, (error, result) => {
                if (error) {
                    message.error("Transaction failed")
                    setLoading(false)
                    return;
                }
                message.success("Success")
                setBalanceRefresh(refreshBalance + 1);
                setLoading(false)
            })
        }
        else {
            setLoading(false)
            message.error("Please Connect Wallet")
        }
    }

    useEffect(() => {
        if (address) {
            fetchVestingLockNFTId(address)
            fetchWithdrawableHarbor(address)
        }
    }, [address, refreshBalance])

    const BackButton = {
        right: (
            <>
                <Row >
                    <Row>
                        <Col>
                            <div className="totol-voting-main-container mr-3">
                                <div className="total-voting-container">
                                    <div className="total-veHARBOR">
                                        My veHARBOR : <span className='fill-box'><span>{commaSeparator(Number(issuedveHARBOR).toFixed(6) || 0)}</span> veHARBOR </span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <div className="locker-up-main-container">
                        <div className="locker-up-container">
                            <div className="claim-container ">
                                <div className="claim-btn">
                                    <Button
                                        type="primary"
                                        className="btn-filled mr-1"
                                        loading={loading}
                                        disabled={!Number(withdrawableToken?.amount)}
                                        onClick={() => handleClaimLockedharbor()}
                                    >Claim</Button>
                                </div>
                                <div className="claim-value">
                                    <div className="icon">
                                        <div className="assets-icon">
                                            <SvgIcon
                                                name={iconNameFromDenom(withdrawableToken?.denom)}
                                            />
                                        </div>
                                    </div>
                                    <div className="value">{withdrawableToken?.amount ? amountConversionWithComma(withdrawableToken?.amount, DOLLAR_DECIMALS) : Number(0).toFixed(DOLLAR_DECIMALS)}</div>
                                </div> {"   "} <span className="ml-2"> <TooltipIcon text="Total unlocked HARBOR to claim" /></span>
                            </div>
                        </div>
                    </div>

                </Row>
            </>
        ),
    };
    return (
        <>
            <div className="app-content-wrapper">
                <Row>
                    <Col>
                        <Tabs
                            className="comdex-tabs"
                            activeKey={activeKey}
                            onChange={callback}
                            tabBarExtraContent={activeKey === "2" ? BackButton : false}
                        >
                            <TabPane tab="Create" key="1">
                                <Create />
                            </TabPane>
                            <TabPane tab="Lock" key="2" disabled={!issuedToken?.length > 0}>
                                <Lock />
                            </TabPane>
                        </Tabs>
                    </Col>
                </Row>
            </div>
        </>
    )
}
Vesting.propTypes = {
    lang: PropTypes.string.isRequired,
    address: PropTypes.string,
    refreshBalance: PropTypes.number.isRequired,
    issuedveHARBOR: PropTypes.number.isRequired,
};
const stateToProps = (state) => {
    return {
        lang: state.language,
        address: state.account.address,
        refreshBalance: state.account.refreshBalance,
        issuedveHARBOR: state.vesting.issuedveHARBOR,
    };
};

const actionsToProps = {
    setBalanceRefresh,
};
export default connect(stateToProps, actionsToProps)(Vesting);