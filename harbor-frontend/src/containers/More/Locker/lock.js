import React, { useEffect, useState } from 'react'
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import TooltipIcon from '../../../components/TooltipIcon';
import { Col, Row, SvgIcon } from '../../../components/common';
import { Table } from 'antd';
import { denomToSymbol, iconNameFromDenom } from '../../../utils/string';
import { vestingLockNFTId } from '../../../services/vestingContractsRead';
import { setBalanceRefresh } from "../../../actions/account";
import { setIssuedveHARBOR } from "../../../actions/vesting";
import { amountConversion, amountConversionWithComma } from '../../../utils/coin';
import moment from 'moment';
import { DOLLAR_DECIMALS } from '../../../constants/common';


const Lock = ({
    address,
    refreshBalance,
    setIssuedveHARBOR,
}) => {

    const [vestingNFTId, setVestingNFTId] = useState();
    const [inProcess, setInProcess] = useState(false)

    // Query 
    const fetchVestingLockNFTId = () => {
        setInProcess(true)
        vestingLockNFTId(address).then((res) => {
            setVestingNFTId(res?.nft)
            setInProcess(false)
        }).catch((error) => {
            setVestingNFTId('')
            setInProcess(false)
            console.log(error);
        })
    }

    const unixToGMTTime = (time) => {
        // *Removing miliSec from unix time 
        let newTime = Math.floor(time / 1000000000);
        var timestamp = moment.unix(newTime);
        timestamp = timestamp.format("DD-MMMM-YYYY")
        return timestamp;
    }

    const calculateTotalveHARBOR = () => {
        let totalveHARBORLocked = 0;
        let tokens = vestingNFTId && vestingNFTId?.vtokens?.reverse().map((item) => {
            return Number(amountConversion(item?.vtoken?.amount));
        })
        totalveHARBORLocked = tokens?.reduce((partialSum, a) => partialSum + a, 0)
        { totalveHARBORLocked && setIssuedveHARBOR(totalveHARBORLocked) }
    }

    // UseEffect calls 
    useEffect(() => {
        fetchVestingLockNFTId()
        calculateTotalveHARBOR()
    }, [address, refreshBalance])

    useEffect(() => {
        calculateTotalveHARBOR()
    }, [address, vestingNFTId])


    const columns = [
        {
            title: "NFT ID",
            dataIndex: "pair",
            key: "pair",
            // width: 200,
        },
        {
            title: (
                <>
                    Locked HARBOR{" "}
                    <TooltipIcon text="Locked HARBOR" />
                </>
            ),
            dataIndex: "amount",
            key: "balance",
            // width: 300,
        },
        {
            title: <>
                Issued veHARBOR{" "}
                <TooltipIcon text="Total veHARBOR issued for the locked HARBOR" />
            </>,
            dataIndex: "value",
            key: "value",
            // width: 300,
        },
        {
            title: (
                <>
                    Locked Date <TooltipIcon text="Date of HARBOR locked" />
                </>
            ),
            dataIndex: "opening",
            key: "opening",
            // width: 300,
        },
        {
            title: (
                <>
                    Unlock Date <TooltipIcon text="Date of unlocking for locked HARBOR" />
                </>
            ),
            dataIndex: "expires",
            key: "expires",
            // width: 300,
        },
    ];

    const tableData =
        vestingNFTId && vestingNFTId?.vtokens?.reverse().map((item, index) => {
            return {
                key: index,
                pair: <>
                    <div className="assets-withicon">
                        <div className="assets-icon">
                            <SvgIcon
                                name={iconNameFromDenom('uharbor')}
                            />
                        </div>
                        <div className="nft-container">
                            <div className="nft-id">{vestingNFTId?.token_id}</div>
                            <div className="name">NFT ID</div>
                        </div>
                    </div>
                </>,
                amount: <>
                    <div className="amount-container">
                        <div className="amount">{amountConversionWithComma(item?.token?.amount)}</div>
                        <div className="denom">{denomToSymbol(item?.token?.denom)}</div>
                    </div>
                </>,
                value: <>
                    <div className="amount-container">
                        <div className="amount">{amountConversionWithComma(item?.vtoken?.amount)}</div>
                        <div className="denom">veHARBOR</div>
                    </div>
                </>,
                opening: <>
                    <div className="amount-container opening-time-badge">
                        <div className="amount">{unixToGMTTime(item?.start_time)}</div>
                        {/* <div className="denom">Expires 20 days ago</div> */}
                    </div>
                </>,
                expires: <>
                    <div className="amount-container">
                        <div className="amount">{unixToGMTTime(item?.end_time)}</div>
                        {/* <div className="denom">Expires 20 days ago</div> */}
                    </div>
                </>,
            }
        })



    return (
        <>
            <div className="app-content-wrappers  more-locker-lock-table">

                <Row>
                    <Col>
                        <Table
                            className="custom-table"
                            dataSource={tableData}
                            columns={columns}
                            loading={inProcess}
                            pagination={{ defaultPageSize: 10 }}
                            scroll={{ x: "100%" }}
                        />
                    </Col>
                </Row>
            </div>
        </>
    )
}

Lock.propTypes = {
    lang: PropTypes.string.isRequired,
    address: PropTypes.string,
    refreshBalance: PropTypes.number.isRequired,
};
const stateToProps = (state) => {
    return {
        lang: state.language,
        address: state.account.address,
        refreshBalance: state.account.refreshBalance,
    };
};
const actionsToProps = {
    setBalanceRefresh,
    setIssuedveHARBOR,
};


export default connect(stateToProps, actionsToProps)(Lock);