import { Table, Button, message } from "antd";
import { Col, Row, SvgIcon } from "../../components/common";
import { iconNameFromDenom } from "../../utils/string";
import { denomConversion, amountConversionWithComma } from "../../utils/coin";
import TooltipIcon from "../../components/common/TooltipIcon/index";
import moment from "moment";

export const Bidding = ({ biddingList, inProgress }) => {
    const columnsBidding = [
        {
            title: (
                <>
                    Auctioned Asset <TooltipIcon text="Asset to be sold in the auction" />
                </>
            ),
            dataIndex: "inflowToken",
            key: "inflowToken",
            width: 200,
        },
        {
            title: (
                <>
                    Bidding Asset{" "}
                    <TooltipIcon text="Asset used to buy the auctioned asset" />
                </>
            ),
            dataIndex: "outflowToken",
            key: "outflowToken",
            width: 200,
            align: "center",
        },
        {
            title: "Timestamp",
            dataIndex: "timestamp",
            key: "timestamp",
            width: 200,
            align: "center",
            render: (end_time) => <div className="endtime-badge">{end_time}</div>,
        },
        {
            title: (
                <>
                    Auction Status <TooltipIcon text="Status of auction" />
                </>
            ),
            dataIndex: "auctionStatus",
            key: "auctionStatus",
            align: "center",
            width: 150,
        },
        {
            title: (
                <>
                    Bidding Status <TooltipIcon text="Bidding status of auction" />
                </>
            ),
            dataIndex: "action",
            key: "action",
            align: "right",
            width: 150,
        },
    ];

    const tableBiddingData =
        biddingList &&
        biddingList.length > 0 &&
        biddingList.map((item, index) => {
            return {
                key: index,
                outflowToken: (
                    <>
                        <div className="assets-with-icon">
                            <div className="assets-icon">
                                <SvgIcon
                                    name={iconNameFromDenom(item?.outflowTokenAmount?.denom)}
                                />
                            </div>
                            {amountConversionWithComma(item?.outflowTokenAmount?.amount || 0)}{" "}
                            {denomConversion(item?.outflowTokenAmount?.denom)}
                        </div>
                    </>
                ),
                inflowToken: (
                    <>
                        <div className="assets-with-icon">
                            <div className="assets-icon">
                                <SvgIcon
                                    name={iconNameFromDenom(item?.inflowTokenAmount?.denom)}
                                />
                            </div>
                            {amountConversionWithComma(item?.inflowTokenAmount?.amount || 0)}{" "}
                            {denomConversion(item?.inflowTokenAmount?.denom)}
                        </div>
                    </>
                ),
                timestamp: moment(item?.biddingTimestamp).format("MMM DD, YYYY HH:mm"),
                auctionStatus: (
                    <Button
                        size="small"
                        className={
                            item?.auctionStatus === "active"
                                ? "biddin-btn bid-btn-success"
                                : item?.auctionStatus === "inactive"
                                    ? "biddin-btn bid-btn-rejected"
                                    : ""
                        }
                    >
                        {item?.auctionStatus}
                    </Button>
                ),
                action: (
                    <Button
                        size="small"
                        className={
                            item?.biddingStatus === "placed"
                                ? "biddin-btn bid-btn-placed"
                                : item?.biddingStatus === "success"
                                    ? "biddin-btn bid-btn-success"
                                    : item?.biddingStatus === "rejected"
                                        ? "biddin-btn bid-btn-rejected"
                                        : ""
                        }
                    >
                        {item?.biddingStatus}
                    </Button>
                ),
            };
        });

    return (
        <div className="app-content-wrapper">
            <Row>
                <Col>
                    <div className="commodo-card py-3 bg-none">
                        <div className="card-content">
                            <Table
                                className="custom-table auction-table  bidding-bottom-table "
                                dataSource={tableBiddingData}
                                columns={columnsBidding}
                                pagination={{ defaultPageSize: 5 }}
                                loading={inProgress}
                                scroll={{ x: "100%" }}
                            />
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Bidding;
