import * as PropTypes from "prop-types";
import { Col, Row } from "../../../components/common";
import { connect } from "react-redux";
import { Button, message, Spin, Tabs } from "antd";
import WithdrawTab from "./Withdraw";
import DepositTab from "./Deposit";
import "./index.less";
import { Link } from "react-router-dom";
import { useLocation, useParams } from "react-router";
import { useEffect, useState } from "react";
import { queryLendPool, queryLendPosition } from "../../../services/lend/query";
import { setPool } from "../../../actions/lend";
import CloseTab from "./Close";
import { decode } from "../../../utils/string";

const { TabPane } = Tabs;

const BackButton = {
  right: (
    <Link to="/myhome">
      <Button className="back-btn" type="primary">
        Back
      </Button>
    </Link>
  ),
};

const Deposit = ({ setPool }) => {
  const [inProgress, setInProgress] = useState(false);
  const [lendPosition, setLendPosition] = useState();
  const [activeKey, setActiveKey] = useState("1");

  let { id } = useParams();

  const location = useLocation();
  const type = decode(location.hash);

  useEffect(() => {
    if (type && type === "withdraw") {
      setActiveKey("2");
    }
  }, []);

  useEffect(() => {
    if (id) {
      setInProgress(true);

      queryLendPosition(id, (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }
        if (result?.lend?.poolId) {
          setLendPosition(result?.lend);

          queryLendPool(result?.lend?.poolId, (error, result) => {
            setInProgress(false);
            if (error) {
              message.error(error);
              return;
            }
            setPool(result?.pool);
          });
        }
      });
    }
  }, [id]);

  const refreshLendPosition = () => {
    if (id) {
      queryLendPosition(id, (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }
        if (result?.lend?.poolId) {
          setLendPosition(result?.lend);
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
            <TabPane tab="Deposit" key="1">
              {inProgress ? (
                <div className="loader">
                  <Spin />
                </div>
              ) : (
                <DepositTab
                  lendPosition={lendPosition}
                  dataInProgress={inProgress}
                />
              )}
            </TabPane>
            <TabPane tab="Withdraw" key="2">
              {inProgress ? (
                <div className="loader">
                  <Spin />
                </div>
              ) : (
                <WithdrawTab
                  lendPosition={lendPosition}
                  dataInProgress={inProgress}
                  refreshLendPosition={refreshLendPosition}
                />
              )}
            </TabPane>
            <TabPane tab="Close" key="3">
              {inProgress ? (
                <div className="loader">
                  <Spin />
                </div>
              ) : (
                <CloseTab
                  lendPosition={lendPosition}
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

Deposit.propTypes = {
  lang: PropTypes.string.isRequired,
  setPool: PropTypes.func.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
  };
};

const actionsToProps = {
  setPool,
};

export default connect(stateToProps, actionsToProps)(Deposit);
