import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../../components/common";
import { connect } from "react-redux";
import { Table } from "antd";
import PlaceBidModal from "./PlaceBidModal";
import "../index.scss";
import FilterModal from "../FilterModal/FilterModal";
import { setPairs } from "../../../actions/asset";
import Bidding from "./Bidding";
import {
  querySurplusAuctionList,
  querySurplusBiddingList,
  queryAuctionParams,
} from "../../../services/auction";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from "../../../constants/common";
import { message } from "antd";
import { useState, useEffect } from "react";
import { iconNameFromDenom } from "../../../utils/string";
import { amountConversion, amountConversionWithComma, denomConversion } from "../../../utils/coin";
import moment from "moment";

const SurplusAuctions = ({ setPairs, address }) => {
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [inProgress, setInProgress] = useState(false);
  const [params, setParams] = useState({});
  const [auctions, setAuctions] = useState();
  const [biddings, setBiddings] = useState();

  useEffect(() => {
    fetchData();
    queryParams();
  }, [address]);

  const fetchData = () => {
    fetchAuctions((pageNumber - 1) * pageSize, pageSize, true, false);
    fetchBiddings(address);
  };

  const queryParams = () => {
    queryAuctionParams((error, result) => {
      if (error) {
        return;
      }

      setParams(result?.auctionParams);
    });
  };

  const handleChange = (value) => {
    setPageNumber(value.current - 1);
    setPageSize(value.pageSize);
    fetchAuctions(
      (value.current - 1) * value.pageSize,
      value.pageSize,
      true,
      false
    );
  };

  const fetchAuctions = (offset, limit, isTotal, isReverse) => {
    setInProgress(true);
    querySurplusAuctionList(
      offset,
      limit,
      isTotal,
      isReverse,
      (error, result) => {
        setInProgress(false);

        if (error) {
          message.error(error);
          return;
        }

        if (result?.auctions?.length > 0) {
          setAuctions(result && result.auctions);
        }
      }
    );
  };

  const fetchBiddings = (address) => {
    setInProgress(true);
    querySurplusBiddingList(address, (error, result) => {
      setInProgress(false);

      if (error) {
        message.error(error);
        return;
      }

      if (result?.biddings?.length > 0) {
        setBiddings(result && result.biddings);
      }
    });
  };

  const columns = [
    {
      title: "Auctioned Asset",
      dataIndex: "auctioned_asset",
      key: "auctioned_asset",
      width: 150,
    },
    {
      title: "Bidding Asset",
      dataIndex: "bridge_asset",
      key: "bridge_asset",
      width: 150,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 200,
    },
    {
      title: "End Time",
      dataIndex: "end_time",
      key: "end_time",
      width: 200,
      render: (end_time) => <div className="endtime-badge">{end_time}</div>,
    },
    {
      title: "Top Bid",
      dataIndex: "min_bid",
      key: "min_bid",
      width: 150,
      render: (bid) => (
        <>
          {amountConversion(bid?.amount || 0)} {denomConversion(bid?.denom)}
        </>
      ),
    },
    {
      title: (
        <>
          {/* <FilterModal setPairs={setPairs} /> */}
          Bid
        </>
      ),
      dataIndex: "action",
      key: "action",
      align: "right",
      width: 140,
      render: (item) => (
        <>
          <PlaceBidModal
            params={params}
            auction={item}
            refreshData={fetchData}
            discount={params?.auctionDiscountPercent}
          />
        </>
      ),
    },
  ];

  const tableData =
    auctions && auctions.length > 0
      ? auctions.map((item, index) => {
        return {
          key: index,
          id: item.id,
          auctioned_asset: (
            <>
              <div className="assets-withicon">
                <div className="assets-icon">
                  <SvgIcon
                    name={iconNameFromDenom(item?.sellToken?.denom)}
                  />
                </div>
                {denomConversion(item?.sellToken?.denom)}
              </div>
            </>
          ),
          bridge_asset: (
            <>
              <div className="assets-withicon display-center">
                <div className="assets-icon">
                  <SvgIcon
                    name={iconNameFromDenom(item?.buyToken?.denom)}
                  />
                </div>
                {denomConversion(item?.buyToken?.denom)}
              </div>
            </>
          ),
          end_time: moment(item && item.endTime).format("MMM DD, YYYY HH:mm"),
          quantity: (
            <>
              <div className="assets-withicon display-center">
                <div className="assets-icon">
                  <SvgIcon
                    name={iconNameFromDenom(item?.sellToken?.denom)}
                  />
                </div>
                {amountConversionWithComma(item?.sellToken?.amount)}{" "}
                {denomConversion(item?.sellToken?.denom)}
              </div>
            </>
          ),
          min_bid: item?.bid,
          action: item,
        };
      })
      : [];

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col>
          <div className="composite-card py-3">
            <div className="card-content">
              <Table
                className="custom-table liquidation-table"
                dataSource={tableData}
                columns={columns}
                loading={inProgress}
                onChange={(event) => handleChange(event)}
                pagination={{
                  total:
                    auctions &&
                    auctions.pagination &&
                    auctions.pagination.total,
                  pageSize,
                }}
                scroll={{ x: "100%" }}
              />
            </div>
          </div>
          <div className="more-bottom">
            <h3 className="title">Bidding History</h3>
            <div className="more-bottom-card">
              <Bidding biddingList={biddings} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

SurplusAuctions.propTypes = {
  lang: PropTypes.string.isRequired,
  setPairs: PropTypes.func.isRequired,
  address: PropTypes.string,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
  };
};

const actionsToProps = {
  setPairs,
};

export default connect(stateToProps, actionsToProps)(SurplusAuctions);
