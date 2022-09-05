import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../components/common";
import { connect } from "react-redux";
import { Modal, Button } from "antd";
import "./index.less";

const { confirm } = Modal;

const Extra = () => {
  function showConfirm() {
    confirm({
      title: "Do you Want to delete these items?",
      icon: <SvgIcon name="info-icon" viewbox="0 0 9 9" />,
      content: "Some descriptions",
      onOk() {
        console.log("OK");
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  }

  function success() {
    Modal.success({
      title: "Success",
      icon: (
        <SvgIcon fill="#52B788" name="success-icon" viewbox="0 0 129 129" />
      ),
      content: "Successfully message here..",
    });
  }

  function error() {
    Modal.error({
      title: "error",
      icon: (
        <SvgIcon
          fill="#f5222d"
          name="error-icon"
          viewbox="0 0 103.096 103.096"
        />
      ),
      content: "Error message here...",
    });
  }

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col>
          <Button onClick={showConfirm}>Confirm</Button>
          <Button onClick={success}>Success</Button>
          <Button onClick={error}>Error</Button>
        </Col>
      </Row>
    </div>
  );
};

Extra.propTypes = {
  lang: PropTypes.string.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(Extra);
