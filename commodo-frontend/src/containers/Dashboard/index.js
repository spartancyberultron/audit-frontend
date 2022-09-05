import { Button, message, Skeleton } from "antd";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import * as PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import Slider from "react-slick";
import AssetsIcon from "../../assets/images/assets-icon.png";
import LaunchImage from "../../assets/images/launch-bg.jpg";
import LogoIcon from "../../assets/images/logo-icon.svg";
import "../../assets/less/plugins/slick-slider/slick.less";
import { Col, Row, SvgIcon, TooltipIcon } from "../../components/common";
import { DOLLAR_DECIMALS, NUMBER_OF_TOP_ASSETS } from "../../constants/common";
import {
  queryBorrowStats,
  queryDepositStats,
  queryTopAssets,
  queryUserDepositStats
} from "../../services/lend/query";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion
} from "../../utils/coin";
import { marketPrice } from "../../utils/number";
import { iconNameFromDenom } from "../../utils/string";
import "./index.less";

const Dashboard = ({ isDarkMode, markets, assetMap }) => {
  const [depositStats, setDepositStats] = useState();
  const [topAssetsInProgress, setTopAssetsInProgress] = useState();
  const [borrowStats, setBorrowStats] = useState();
  const [userDepositStats, setUserDepositStats] = useState();
  const [topDeposits, setTopDeposits] = useState();
  const [topBorrows, setTopBorrows] = useState();

  useEffect(() => {
    setTopAssetsInProgress(true);

    queryDepositStats((error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      setDepositStats(result?.DepositStats?.balanceStats);
    });

    queryUserDepositStats((error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      setUserDepositStats(result?.UserDepositStats?.balanceStats);
    });

    queryBorrowStats((error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      setBorrowStats(result?.BorrowStats?.balanceStats);
    });

    queryTopAssets((error, result) => {
      setTopAssetsInProgress(false);
      if (error) {
        return;
      }

      setTopDeposits(result?.data?.deposit?.slice(0, NUMBER_OF_TOP_ASSETS));
      setTopBorrows(result?.data?.borrow?.slice(0, NUMBER_OF_TOP_ASSETS));
    });
  }, []);

  const calculateTotalValue = (list) => {
    const values =
      list?.length > 0
        ? list.map((item) => {
            return (
              marketPrice(markets, assetMap[item?.assetId?.toNumber()]?.denom) *
              item?.amount
            );
          })
        : [];

    const sum = values.reduce((a, b) => a + b, 0);

    return Number(sum || 0);
  };

  const totalDepositStats = calculateTotalValue(depositStats);
  const totalBorrowStats = calculateTotalValue(borrowStats);
  const totalUserDepositStats = calculateTotalValue(userDepositStats);

  const Options = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: 210,
      margin: 5,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: null,
    },
    plotOptions: {
      pie: {
        showInLegend: false,
        size: "110%",
        innerSize: "82%",
        borderWidth: 0,
        dataLabels: {
          enabled: false,
          distance: -14,
          style: {
            fontsize: 50,
          },
        },
      },
    },
    series: [
      {
        states: {
          hover: {
            enabled: false,
          },
        },
        name: "",
        data: [
          {
            name: "Total Available",
            y: Number(amountConversion(totalDepositStats || 0)),
            color: "#52B788",
          },
          {
            name: "Total Borrowed",
            y: Number(amountConversion(totalBorrowStats || 0)),

            color: "#E2F7E5",
          },
        ],
      },
    ],
  };

  const DepositBorrowChart = {
    chart: {
      type: "spline",
      backgroundColor: null,
      height: 150,
      marginBottom: 30,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: "",
    },
    yAxis: {
      gridLineWidth: 0,
      title: {
        enabled: false,
      },
      labels: {
        enabled: true,
        style: {
          color: isDarkMode ? "#E2F7E5" : "#999",
        },
      },
    },
    xAxis: {
      lineColor: false,
      labels: {
        style: {
          fontSize: 10,
          color: isDarkMode ? "#E2F7E5" : "#999",
          fontWeight: 300,
        },
      },
      gridLineWidth: 1,
      gridLineColor: isDarkMode ? "#E2F7E5" : "#999",
      categories: [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ],
    },
    series: [
      {
        name: "Deposited",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        lineWidth: 2,
        lineColor: "#52B788",
        marker: false,
        showInLegend: false,
      },
      {
        name: "Borrowed",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        lineWidth: 2,
        lineColor: "#D8F3DC",
        marker: false,
        showInLegend: false,
      },
    ],
  };

  const showSkeletonLoader = () => {
    return [...Array(NUMBER_OF_TOP_ASSETS)].map((item, index) => (
      <Skeleton.Input key={index} active size="small" className="mb-1" />
    ));
  };

  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2800,
  };

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col className="dashboard-upper">
          <div className="dashboard-upper-left">
            <div className="commodo-card h-100">
              <div className="dashboard-statics ml-4">
                <p>
                  Total Value Locked{" "}
                  <TooltipIcon text="Value of Assets Locked" />
                </p>
                <h3>
                  $
                  {amountConversionWithComma(
                    totalDepositStats + totalBorrowStats || 0,
                    DOLLAR_DECIMALS
                  )}
                </h3>{" "}
              </div>
              <div className="total-values">
                <div className="total-values-chart">
                  <HighchartsReact highcharts={Highcharts} options={Options} />
                </div>
                <div className="total-values-right">
                  <div
                    className="dashboard-statics mb-5"
                    style={{ borderColor: "#52B788" }}
                  >
                    <p>
                      Total Available{" "}
                      <TooltipIcon text="Value of Assets available on platfrom" />
                    </p>
                    <h3>
                      $
                      {amountConversionWithComma(
                        totalDepositStats || 0,
                        DOLLAR_DECIMALS
                      )}
                    </h3>
                  </div>
                  <div
                    className="dashboard-statics mb-0"
                    style={{ borderColor: "#E2F7E5" }}
                  >
                    <p>
                      Total Borrow{" "}
                      <TooltipIcon text="Value of Assets Borrowed" />
                    </p>
                    <h3>
                      $
                      {amountConversionWithComma(
                        totalBorrowStats || 0,
                        DOLLAR_DECIMALS
                      )}
                    </h3>{" "}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-upper-right">
            <div className="commodo-card commodo-launch-card">
              <Slider {...settings}>
                <div>
                  <div className="commodo-launch-card-inner">
                    <img
                      className="launch-bg"
                      alt="CMDX Token Launch"
                      src={LaunchImage}
                    />
                    <div className="assets-section">
                      <p className="upper-title">
                        A seamless borrowing and lending platform
                      </p>
                      <div className="assets-section-inner">
                        <div className="assets-left">
                          <div className="mt-2">
                            <ul className="static-list">
                              <li>
                                <label>#cPools</label>
                                <p>78</p>
                              </li>
                              <li>
                                <label>#Reserves</label>
                                <p>$1.00M</p>
                              </li>
                              <li>
                                <label>#Lenders</label>
                                <p>4,128</p>
                              </li>
                              <li>
                                <label>#Borrowers</label>
                                <p>697</p>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="assets-right">
                          <img
                            className="commodo-logo"
                            src={LogoIcon}
                            alt={LogoIcon}
                          />
                          <h2>COMMODO</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="commodo-launch-card-inner">
                    <img
                      className="launch-bg"
                      alt="CMDX Token Launch"
                      src={LaunchImage}
                    />
                    <div className="assets-section">
                      <div className="assets-section-inner">
                        <div className="assets-left">
                          <p>
                            Provide liquidity on CMDX-CMST pool on CSWAP to earn
                            external incentives on COMMODO
                          </p>
                          <div className="mt-auto">
                            <div className="small-icons mb-2">
                              <div className="icon-col mr-2">
                                <SvgIcon name="cmst-icon" />
                                CMST
                              </div>{" "}
                              -
                              <div className="icon-col ml-2">
                                <SvgIcon name="cmdx-icon" /> CMDX
                              </div>
                            </div>
                            <h3 className="h3-botttom">
                              <small>High APR</small>
                            </h3>
                          </div>
                          <div className="comingsoon-text">Coming soon..</div>
                        </div>
                        <div className="assets-right">
                          <img alt={AssetsIcon} src={AssetsIcon} />
                          <Button type="primary" className="btn-filled">
                            <a
                              aria-label="cswap"
                              target="_blank"
                              rel="noreferrer"
                              href="https://staging.cswap.one/"
                            >
                              Take me there!
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Slider>
            </div>
            <div className="commodo-card top-three-assets">
              <div className="card-head">Top {NUMBER_OF_TOP_ASSETS} Assets</div>
              <div className="card-content">
                <div className="deposited-list">
                  <p>Deposited</p>
                  <ul>
                    {topDeposits && topDeposits?.length > 0
                      ? topDeposits?.map((item) => {
                          return (
                            <li key={item?.asset_id}>
                              <div className="assets-col">
                                <div className="assets-icon">
                                  <SvgIcon
                                    name={iconNameFromDenom(
                                      assetMap[item?.asset_id]?.denom
                                    )}
                                  />
                                </div>
                                {denomConversion(
                                  assetMap[item?.asset_id]?.denom
                                )}
                              </div>
                              <b>
                                {((Number(item?.apr) || 0) * 100).toFixed(
                                  DOLLAR_DECIMALS
                                )}
                                %
                              </b>
                            </li>
                          );
                        })
                      : topAssetsInProgress
                      ? showSkeletonLoader()
                      : "No data"}
                  </ul>
                </div>
                <div className="deposited-list">
                  <p>Borrowed</p>
                  <ul>
                    {topBorrows && topBorrows.length > 0
                      ? topBorrows?.map((item) => {
                          return (
                            <li key={item?.asset_id}>
                              <div className="assets-col">
                                <div className="assets-icon">
                                  <SvgIcon
                                    name={iconNameFromDenom(
                                      assetMap[item?.asset_id]?.denom
                                    )}
                                  />
                                </div>
                                {denomConversion(
                                  assetMap[item?.asset_id]?.denom
                                )}
                              </div>
                              <b>
                                {((Number(item?.apr) || 0) * 100).toFixed(
                                  DOLLAR_DECIMALS
                                )}
                                %
                              </b>
                            </li>
                          );
                        })
                      : topAssetsInProgress
                      ? showSkeletonLoader()
                      : ""}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col className="dashboard-bottom">
          <div className="commodo-card">
            <div className="bottom-chart">
              <div className="bottom-chart-left">
                <div className="legend-custom">
                  <div className="legend-deposit">
                    <SvgIcon name="rectangle" /> Deposited
                  </div>
                  <div className="legend-borrow">
                    <SvgIcon name="rectangle" /> Borrowed
                  </div>
                </div>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={DepositBorrowChart}
                />
              </div>
              <div className="bottom-chart-right">
                <div
                  className="dashboard-statics"
                  style={{ borderColor: "#52B788" }}
                >
                  <p>Total Deposited</p>
                  <h3>
                    $
                    {amountConversionWithComma(
                      totalUserDepositStats || 0,
                      DOLLAR_DECIMALS
                    )}
                  </h3>{" "}
                </div>
                <div
                  className="dashboard-statics"
                  style={{ borderColor: "#E2F7E5" }}
                >
                  <p>Total Borrowed</p>
                  <h3>
                    $
                    {amountConversionWithComma(
                      totalBorrowStats || 0,
                      DOLLAR_DECIMALS
                    )}
                  </h3>{" "}
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

Dashboard.propTypes = {
  lang: PropTypes.string.isRequired,
  assetMap: PropTypes.object,
  isDarkMode: PropTypes.bool,
  markets: PropTypes.arrayOf(
    PropTypes.shape({
      rates: PropTypes.shape({
        low: PropTypes.number,
      }),
    })
  ),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    markets: state.oracle.market.list,
    assetMap: state.asset._.map,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(Dashboard);
