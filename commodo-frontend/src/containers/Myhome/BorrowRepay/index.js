import { Button, message, Spin, Tabs } from "antd";
import * as PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useLocation, useParams } from "react-router";
import { Link } from "react-router-dom";
import { setPair, setPool } from "../../../actions/lend";
import { Col, Row } from "../../../components/common";
import {
  queryBorrowPosition,
  queryLendPair,
  queryLendPool,
  queryLendPosition,
} from "../../../services/lend/query";
import { decode } from "../../../utils/string";
import BorrowTab from "./Borrow";
import CloseTab from "./Close";
import DepositTab from "./Deposit";
import "./index.less";
import RepayTab from "./Repay";

const { TabPane } = Tabs;

const BackButton = {
  right: (
    <Link to="/myhome#borrow">
      <Button className="back-btn" type="primary">
        Back
      </Button>
    </Link>
  ),
};

const BorrowRepay = ({ setPair, setPool }) => {
  const [inProgress, setInProgress] = useState(false);
  const [borrowPosition, setBorrowPosition] = useState();
  const [activeKey, setActiveKey] = useState("1");
  const [lendPosition, setLendPosition] = useState();
  const [lendPool, setLendPool] = useState();

  let { id } = useParams();

  const location = useLocation();
  const type = decode(location.hash);

  useEffect(() => {
    if (type && type === "repay") {
      setActiveKey("3");
    }
  }, []);

  useEffect(() => {
    if (id) {
      setInProgress(true);

      queryBorrowPosition(id, (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }
        if (result?.borrow?.pairId) {
          setBorrowPosition(result?.borrow);

          queryLendPair(result?.borrow?.pairId, (error, result) => {
            setInProgress(false);
            if (error) {
              message.error(error);
              return;
            }
            setPair(result?.ExtendedPair);
            queryLendPool(
              result?.ExtendedPair?.assetOutPoolId,
              (error, result) => {
                if (error) {
                  message.error(error);
                  return;
                }
                setPool(result?.pool);
              }
            );
          });
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (borrowPosition?.lendingId) {
      queryLendPosition(borrowPosition?.lendingId, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }
        if (result?.lend?.poolId) {
          setLendPosition(result?.lend);
        }
      });
    }
  }, [borrowPosition]);

  useEffect(() => {
    if (lendPosition?.poolId) {
      queryLendPool(lendPosition?.poolId, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }
        setLendPool(result?.pool);
      });
    }
  }, [lendPosition]);

  const refreshBorrowPosition = () => {
    if (id) {
      queryBorrowPosition(id, (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }
        if (result?.borrow?.pairId) {
          setBorrowPosition(result?.borrow);
        }
      });
    }
  };

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col>
          <Tabs
            className="commodo-tabs"
            defaultActiveKey="1"
            onChange={setActiveKey}
            activeKey={activeKey}
            tabBarExtraContent={BackButton}
          >
            <TabPane tab="Borrow" key="1">
              {inProgress ? (
                <div className="loader">
                  <Spin />
                </div>
              ) : (
                <BorrowTab
                  borrowPosition={borrowPosition}
                  dataInProgress={inProgress}
                  lendPosition={lendPosition}
                  refreshBorrowPosition={refreshBorrowPosition}
                />
              )}
            </TabPane>
            <TabPane tab="Deposit" key="2">
              {inProgress ? (
                <div className="loader">
                  <Spin />
                </div>
              ) : (
                <DepositTab
                  borrowPosition={borrowPosition}
                  dataInProgress={inProgress}
                  lendPosition={lendPosition}
                  lendPool={lendPool}
                  refreshBorrowPosition={refreshBorrowPosition}
                />
              )}
            </TabPane>
            <TabPane tab="Repay" key="3">
              {inProgress ? (
                <div className="loader">
                  <Spin />
                </div>
              ) : (
                <RepayTab
                  borrowPosition={borrowPosition}
                  refreshBorrowPosition={refreshBorrowPosition}
                  dataInProgress={inProgress}
                />
              )}
            </TabPane>
            <TabPane tab="Close" key="4">
              {inProgress ? (
                <div className="loader">
                  <Spin />
                </div>
              ) : (
                <CloseTab
                  borrowPosition={borrowPosition}
                  dataInProgress={inProgress}
                />
              )}
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

BorrowRepay.propTypes = {
  lang: PropTypes.string.isRequired,
  setPair: PropTypes.func.isRequired,
  setPool: PropTypes.func.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
  };
};

const actionsToProps = {
  setPair,
  setPool,
};

export default connect(stateToProps, actionsToProps)(BorrowRepay);
