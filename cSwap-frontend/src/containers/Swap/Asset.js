import * as PropTypes from "prop-types";
import { iconNameFromDenom } from "../../utils/string";
import { denomConversion } from "../../utils/coin";
import variables from "../../utils/variables";
import { Col, Row, SvgIcon } from "../../components/common";
import TooltipIcon from "../../components/TooltipIcon";

export const Asset = ({ asset, lang }) => {
  return (
    <div className="cswap-head">
      <div className="header-left">
        <div className="icon-circle">
          <div className="svg-icon-inner">
            <SvgIcon
              name={iconNameFromDenom(asset?.denom)}
              viewbox="0 0 26.229 14"
            />
          </div>
        </div>
        <div>{asset ? denomConversion(asset.denom) : ""}</div>
      </div>
      <div className="head-right">
        <Row>
          <Col xs="6" className="mb-2">
            <label>
              Oracle Price <TooltipIcon text={variables[lang].oracle_price_tooltip} />
            </label>
            <p>
              -
            </p>
          </Col>
          <Col xs="6" className="mb-2">
            <label>
              Volume <TooltipIcon text={variables[lang].volume_tooltip} />
            </label>
            <p>
              -
            </p>
          </Col>
          <Col xs="6" className="mb-2">
            <label>
              Premium <TooltipIcon text={variables[lang].premium_tooltip} />
            </label>
            <p>-</p>
          </Col>
          <Col xs="6" className="mb-2">
            <label>
              Liquidity <TooltipIcon text={variables[lang].liquidity_tooltip} />
            </label>
            <p>
              -
            </p>
          </Col>
        </Row>
      </div>
    </div>
  );
};

Asset.propTypes = {
  lang: PropTypes.string.isRequired,
  poolBalance: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.string,
      denom: PropTypes.string,
    })
  ),
  markets: PropTypes.arrayOf(
    PropTypes.shape({
      rates: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
      symbol: PropTypes.string,
      script_id: PropTypes.string,
    })
  ),
  text: PropTypes.string,
  premium: PropTypes.string,
};

export default Asset;
