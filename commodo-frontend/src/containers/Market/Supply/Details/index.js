import { Button, message, Tooltip } from "antd";
import * as PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { setPool } from "../../../../actions/lend";
import { Col, Row, SvgIcon } from "../../../../components/common";
import { queryLendPool } from "../../../../services/lend/query";
import Deposit from "./Deposit";
import "./index.less";

const SupplyDetails = ({ setPool }) => {
  const [inProgress, setInProgress] = useState(false);

  let { id } = useParams();

  useEffect(() => {
    if (id) {
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
  }, [id]);

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col className="text-right mb-3">
          <Link to="/lend">
            <Button className="back-btn" type="primary">
              Back
            </Button>
          </Link>
          {/* <Tooltip overlayClassName="commodo-tooltip" title="Previous cPool">
            <Button className="back-btn px-3 mr-2" type="primary">
              <SvgIcon className="mx-0 mb-0" name="back-arrow" viewbox="0 0 20.243 13.501" />
            </Button>
          </Tooltip>
          <Tooltip overlayClassName="commodo-tooltip" title="Next cPool">
            <Button className="back-btn px-3" type="primary">
              <SvgIcon className="mx-0 mb-0" name="next-arrow" viewbox="0 0 20.243 13.501" />
            </Button>
          </Tooltip> */}
        </Col>
      </Row>
      <Deposit dataInProgress={inProgress} />
    </div>
  );
};

SupplyDetails.propTypes = {
  setPool: PropTypes.func.isRequired,
};

const actionsToProps = {
  setPool,
};

export default connect(null, actionsToProps)(SupplyDetails);
