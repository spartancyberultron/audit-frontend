import { Button, message } from "antd";
import * as PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { setPools } from "../../../../actions/lend";
import { Col, Row, SvgIcon, TooltipIcon } from "../../../../components/common";
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE
} from "../../../../constants/common";
import { queryLendPools } from "../../../../services/lend/query";
import Borrow from "./Borrow";
import "./index.less";

const Direct = ({ setPools }) => {
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    setInProgress(true);

    queryLendPools(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false,
      (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }
        setPools(result?.pools);
      }
    );
  }, []);

  return (
    <div className="app-content-wrapper">
      <Row className="align-items-center">
        <Col className="dborrow-heading-left">
          <SvgIcon className="dborrow-iconhead" name="direct-borrow" viewbox="0 0 57.25 54.685" /> Direct Borrow <TooltipIcon text="Lend and Borrow in one click" />
        </Col>
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

Direct.propTypes = {
  setPools: PropTypes.func.isRequired,
};

const actionsToProps = {
  setPools,
};

export default connect(null, actionsToProps)(Direct);
