import { Table, Button } from "antd";
import { SvgIcon } from "../../../components/common";
import { iconNameFromDenom } from "../../../utils/string";
import {
  denomConversion,
  amountConversionWithComma,
} from "../../../utils/coin";
import TooltipIcon from "../../../components/TooltipIcon";
import moment from "moment";

export const Bidding = ({ biddingList }) => {
  const columnsBidding = [
    {
      title: (
        <>
          Auctioned Asset{" "}
          <TooltipIcon text="Asset used to buy the auctioned asset" />
        </>
      ),
      dataIndex: "inflowToken",
      key: "inflowToken",
      width: 200,
    },
    {
      title: (
        <>
          Bidding Asset <TooltipIcon text="Asset to be sold in the auction" />
        </>
      ),
      dataIndex: "outflowToken",
      key: "outflowToken",
      width: 250,
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 200,
      render: (end_time) => <div className="endtime-badge">{end_time}</div>,
    },
    {
      title: (
        <>
          Auction Status <TooltipIcon text="Auction status" />
        </>
      ),
      dataIndex: "auctionStatus",
      key: "auctionStatus",
      align: "center",
    },
    {
      title: (
        <>
          Bidding Status <TooltipIcon text="Bidding status" />
        </>
      ),
      dataIndex: "action",
      key: "action",
      align: "right",
    },
  ];

  biddingList?.reverse(); // showing newest bid first (ascending->descending)

  const tableBiddingData =
    biddingList &&
    biddingList.length > 0 &&
    biddingList.map((item, index) => {
      return {
        key: index,
        outflowToken: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon name={iconNameFromDenom(item?.bid?.denom)} />
              </div>
              {amountConversionWithComma(item?.bid?.amount || 0)}{" "}
              {denomConversion(item?.bid?.denom)}
            </div>
          </>
        ),
        inflowToken: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon
                  name={iconNameFromDenom(item?.auctionedCollateral?.denom)}
                />
              </div>
              {amountConversionWithComma(
                item?.auctionedCollateral?.amount || 0
              )}{" "}
              {denomConversion(item?.auctionedCollateral?.denom)}
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
    <Table
      className="custom-table more-table  bidding-bottom-table"
      dataSource={tableBiddingData}
      columns={columnsBidding}
      pagination={{ defaultPageSize: 5 }}
      scroll={{ x: "100%" }}
    />
  );
};

export default Bidding;
