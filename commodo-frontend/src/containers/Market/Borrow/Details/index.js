import { Button, message } from "antd";
import * as PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { setPool, setPoolLends } from "../../../../actions/lend";
import { Col, Row } from "../../../../components/common";
import {
  queryLendPool,
  queryUserPoolLends
} from "../../../../services/lend/query";
import Borrow from "./Borrow";
import "./index.less";

const BorrowDetails = ({ address, setPool, setPoolLends }) => {
  const [inProgress, setInProgress] = useState(false);

  let { id } = useParams();

  useEffect(() => {
    if (address && id) {
      setInProgress(true);

      queryLendPool(id, (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }
        setPool(result?.pool);
      });
    }
  }, [address, id]);

  useEffect(() => {
    if (address) {
      queryUserPoolLends(address, (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }
        setPoolLends(result?.lends);
      });
    }
  }, [address]);

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col className="text-right mb-3">
          <Link to="/borrow">
            <Button className="back-btn" type="primary">
              Back
            </Button>
          </Link>
        </Col>
      </Row>
      <Borrow dataInProgress={inProgress} />
    </div>
  );
};

BorrowDetails.propTypes = {
  setPool: PropTypes.func.isRequired,
  setPoolLends: PropTypes.func.isRequired,
  address: PropTypes.string,
};

const stateToProps = (state) => {
  return {
    address: state.account.address,
  };
};

const actionsToProps = {
  setPool,
  setPoolLends,
};

export default connect(stateToProps, actionsToProps)(BorrowDetails);
