import * as PropTypes from "prop-types";
import { Col, Row } from "../../components/common";
import { connect } from "react-redux";
import { Table, message } from "antd";
import "./index.scss";
import TooltipIcon from "../../components/TooltipIcon";
import { queryUserLockerHistory } from "../../services/locker/query";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
  PRODUCT_ID,
} from "../../constants/common";
import { amountConversion } from "../../utils/coin";
import { setAssetList } from '../../actions/asset';
import moment from "moment";
import { queryAssets } from '../../services/asset/query';

const MyEarn = ({ address }) => {
  const dispatch = useDispatch();
  const assetList = useSelector((state) => state.asset?.assetList);
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [lockers, setLockers] = useState();
  const [inProgress, setInProgress] = useState(false);
  const [cmstAssetId, setCmstAssetId] = useState();

  useEffect(() => {
    if (address && cmstAssetId) {
      fetchLockers(cmstAssetId, (pageNumber - 1) * pageSize, pageSize, true, false);
    }
  }, [address, cmstAssetId]);

  useEffect(() => {
    fetchAssets(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );

  }, [address])

  useEffect(() => {
    getCMSTAsssetId()
  }, [assetList])

  const fetchAssets = (offset, limit, countTotal, reverse) => {
    queryAssets(offset, limit, countTotal, reverse, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      dispatch(setAssetList(data.assets))
    });
  };

  const fetchLockers = (assetId, offset, limit, isTotal, isReverse) => {
    setInProgress(true);
    queryUserLockerHistory(
      assetId,
      PRODUCT_ID,
      address,
      offset,
      limit,
      isTotal,
      isReverse,
      (error, result) => {
        if (error) {
          message.error(error);
          return;
        }
        let reverseData = [...result?.userTxData].reverse()
        setLockers(reverseData || []);
        setInProgress(false);
      }
    );
  };

  const getCMSTAsssetId = () => {
    const selectedItem = assetList.length > 0 && assetList.filter((item) => (item?.denom) === "ucmst");
    setCmstAssetId(selectedItem[0]?.id?.low || "")
  }
  const handleChange = (value) => {
    setPageNumber(value.current - 1);
    setPageSize(value.pageSize);
    fetchLockers(
      (value.current - 1) * value.pageSize,
      value.pageSize,
      true,
      false
    );
  };

  const columns = [
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 300,
    },
    {
      title: (
        <>
          Transaction Type{" "}
          <TooltipIcon text="Type of transaction ( Withdraw or Deposit)" />
        </>
      ),
      dataIndex: "transaction",
      key: "balance",
      width: 300,
    },
    {
      title: "Date of Transaction",
      dataIndex: "date",
      key: "date",
      width: 300,
    },
    {
      title: (
        <>
          Balance <TooltipIcon text="Balance after transaction" />
        </>
      ),
      dataIndex: "balance",
      key: "balance",
      width: 300,
    },
  ];

  const tableData =
    lockers &&
    lockers?.length > 0 &&
    lockers?.map((item, index) => {
      return {
        key: index,
        amount: (
          <>
            <div className="assets-withicon">
              {amountConversion(item?.amount || 0)} CMST
            </div>
          </>
        ),
        transaction: item?.txType,
        date: moment(item?.txTime).format("MMM DD, YYYY HH:mm"),
        balance: <>{amountConversion(item?.balance || 0)} CMST</>,
        action: item,
      };
    });

  return (
    <div className="app-content-wrappers earn-table-container">
      <Row>
        <Col>
          <div className="composite-card">
            <div className="card-content">
              <Table
                className="custom-table"
                dataSource={tableData}
                columns={columns}
                loading={inProgress}
                onChange={(event) => handleChange(event)}
                // pagination={{
                //   total:
                //     lockers && lockers.pagination && lockers.pagination.total,
                //   showSizeChanger: true,
                //   defaultPageSize: pageSize,
                //   pageSizeOptions: ["5", "10", "20", "50"],
                // }}
                pagination={{ defaultPageSize: 5 }}
                scroll={{ x: "100%" }}
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

MyEarn.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(MyEarn);
