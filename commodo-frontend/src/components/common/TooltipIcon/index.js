import * as PropTypes from "prop-types";
import { SvgIcon } from "..";
import { Tooltip } from "antd";
import React from "react";

const TooltipIcon = (props) => {
  return (
    <Tooltip
      overlayClassName="commodo-tooltip"
      title={props.text || "Tooltip info text"}
    >
      <SvgIcon className="tooltip-icon" name="info-icon" />
    </Tooltip>
  );
};

TooltipIcon.propTypes = {
  text: PropTypes.string,
};

export default TooltipIcon;
