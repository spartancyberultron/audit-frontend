import { decodeTxRaw } from "@cosmjs/proto-signing";
import { message, Table } from "antd";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { setTransactionHistory } from "../../actions/account";
import { Col, Row } from "../../components/common";
import Copy from "../../components/Copy";
import { comdex } from "../../config/network";
import { abbreviateMessage, fetchTxHistory } from "../../services/transaction";
import { generateHash, truncateString } from "../../utils/string";
import Date from "./Date";
import "./index.less";


const History = ({ address, setTransactionHistory, history }) => {
  const [inProgress, setInProgress] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    getTransactions(address, pageNumber, pageSize);
  }, []);

  const getTransactions = (address, pageNumber, pageSize) => {
    setInProgress(true);
    fetchTxHistory(address, pageNumber, pageSize, (error, result) => {
      setInProgress(false);
      if (error) {
        message.error(error);
        return;
      }
      setTransactionHistory(result.txs, result.totalCount);
    });
  };

  const tableData =
    history &&
    history.list &&
    history.list.length > 0 &&
    history.list.map((item, index) => {
      const decodedTransaction = decodeTxRaw(item.tx);
      const hash = generateHash(item.tx);

      return {
        key: index,
        tx_hash: hash,
        type: abbreviateMessage(
          decodedTransaction.body.messages
        ),
        block_height: item.height,
        date: item.height,
      };
    });

  const handleChange = (value) => {
    setPageNumber(value.current);
    setPageSize(value.pageSize);
    getTransactions(address, value.current, value.pageSize);
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 300,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 300,
      render: (height) => <Date height={height} />,
    },
    {
      title: "Block Height",
      dataIndex: "block_height",
      key: "block_height",
      width: 300,
    },
    {
      title: "Tx Hash",
      dataIndex: "tx_hash",
      key: "tx_hash",
      width: 300,
      render: (hash) => (
        <div className="tx-hash-col">
          <span>
            {" "}
            {
              <a
                href={`${comdex.explorerUrlToTx.replace(
                  "{txHash}",
                  hash?.toUpperCase()
                )}`}
                rel="noreferrer"
                target="_blank"
              >
                {" "}
                {hash && truncateString(hash, 10, 10)}
              </a>
            }{" "}
          </span>
          <Copy text={hash} />
        </div>
      ),
    },
  ];

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col>
          <div className="commodo-card bg-none">
            <div className="card-header">TRANSACTION HISTORY</div>
            <div className="card-content">
              <Table
                className="custom-table"
                dataSource={tableData}
                columns={columns}
                scroll={{ x: "100%" }}
                loading={inProgress}
                pagination={{
                  total: history && history.count,
                  showSizeChanger: true,
                  defaultPageSize: 5,
                  pageSizeOptions: ["5", "10", "20", "50"],
                }}
                total={history && history.count}
                onChange={(event) => handleChange(event)}
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

History.propTypes = {
  lang: PropTypes.string.isRequired,
  setTransactionHistory: PropTypes.func.isRequired,
  address: PropTypes.string,
  count: PropTypes.number,
  history: PropTypes.shape({
    count: PropTypes.number,
    list: PropTypes.arrayOf(
      PropTypes.shape({
        index: PropTypes.number,
        height: PropTypes.number,
        tx: PropTypes.any,
      })
    ),
  }),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    history: state.account.history,
    address: state.account.address,
  };
};

const actionsToProps = {
  setTransactionHistory,
};

export default connect(stateToProps, actionsToProps)(History);
