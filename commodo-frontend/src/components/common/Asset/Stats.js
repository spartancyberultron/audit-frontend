import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import { decimalConversion } from "../../../utils/number";
import { Col, Row } from "../index";
import TooltipIcon from "../TooltipIcon";

const AssetStats = ({ assetId, assetRatesStatsMap, pair, pool, parent }) => {
  return (
    <>
      <Row className="mt-2">
        <Col>
          <label>
            Max LTV <TooltipIcon text="The maximum borrowing power of the collateral" />
          </label>
        </Col>
        <Col className="text-right">
          {pair?.isInterPool
            ? Number(
                Number(
                  decimalConversion(
                    assetRatesStatsMap[pair?.assetIn || assetId]?.ltv
                  )
                ) *
                  Number(
                    decimalConversion(
                      assetRatesStatsMap[pool?.firstBridgedAssetId]?.ltv
                    )
                  ) *
                  100
              ).toFixed(DOLLAR_DECIMALS)
            : Number(
                decimalConversion(
                  assetRatesStatsMap[pair?.assetIn || assetId]?.ltv
                ) * 100
              ).toFixed(DOLLAR_DECIMALS)}
          %
        </Col>
      </Row>
      {/* {parent !== "lend" ? (
        <>
          <Row className="mt-2">
            <Col>
              <label>
                Liquidation Threshold{" "}
                <TooltipIcon text="The threshold at which a loan is defined as undercollateralised and subject to liquidation of collateral" />
              </label>
            </Col>
            <Col className="text-right">
              {pair?.isInterPool
                ? Number(
                    Number(
                      decimalConversion(
                        assetRatesStatsMap[pair?.assetIn || assetId]
                          ?.liquidationThreshold
                      )
                    ) *
                      Number(
                        decimalConversion(
                          assetRatesStatsMap[pool?.firstBridgedAssetId]
                            ?.liquidationThreshold
                        )
                      ) *
                      100
                  ).toFixed(DOLLAR_DECIMALS)
                : Number(
                    decimalConversion(
                      assetRatesStatsMap[pair?.assetIn || assetId]
                        ?.liquidationThreshold
                    ) * 100
                  ).toFixed(DOLLAR_DECIMALS)}
              %
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <label>
                Liquidation Penalty{" "}
                <TooltipIcon text="Fee paid by vault owners on liquidation" />
              </label>
            </Col>
            <Col className="text-right">
              {Number(
                decimalConversion(
                  assetRatesStatsMap[pair?.assetIn || assetId]
                    ?.liquidationPenalty
                ) * 100
              ).toFixed(DOLLAR_DECIMALS)}
              %
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <label>
                Liquidation Bonus{" "}
                <TooltipIcon text="Discount on the collateral unlocked to liquidators" />
              </label>
            </Col>
            <Col className="text-right">
              {Number(
                decimalConversion(
                  assetRatesStatsMap[pair?.assetIn || assetId]?.liquidationBonus
                ) * 100
              ).toFixed(DOLLAR_DECIMALS)}
              %
            </Col>
          </Row>
        </>
      ) : null} */}
    </>
  );
};

AssetStats.propTypes = {
  assetId: PropTypes.shape({
    low: PropTypes.number,
  }),
  assetRatesStatsMap: PropTypes.object,
  pair: PropTypes.shape({
    id: PropTypes.shape({
      low: PropTypes.number,
    }),
    assetIn: PropTypes.shape({
      low: PropTypes.number,
    }),
    amountOut: PropTypes.shape({
      low: PropTypes.number,
    }),
  }),
  parent: PropTypes.string,
  pool: PropTypes.shape({
    poolId: PropTypes.shape({
      low: PropTypes.number,
    }),
    firstBridgedAssetId: PropTypes.shape({
      low: PropTypes.number,
    }),
    secondBridgedAssetId: PropTypes.shape({
      low: PropTypes.number,
    }),
  }),
};

const stateToProps = (state) => {
  return {
    assetRatesStatsMap: state.lend.assetRatesStats.map,
  };
};

export default connect(stateToProps)(AssetStats);
