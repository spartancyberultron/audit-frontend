import * as PropTypes from "prop-types";
import { Col, Row } from "../../components/common";
import { connect } from "react-redux";
import variables from "../../utils/variables";
import TooltipIcon from "../../components/TooltipIcon";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Banner from "./Banner";
import { useEffect, useState } from "react";
import { queryAppTVL, queryTotalTokenMinted } from "../../services/vault/query";
import { DOLLAR_DECIMALS, PRODUCT_ID } from "../../constants/common";
import { message } from "antd";
import { commaSeparator, marketPrice } from "../../utils/number";
import { amountConversion, amountConversionWithComma } from "../../utils/coin";
import "./index.scss";
import { fetchProposalUpData, totalveHarborSupply } from "../../services/contractsRead";
import { cmst, harbor, ibcDenoms } from "../../config/network";

const Dashboard = ({ lang, isDarkMode, markets, poolPriceMap }) => {

  const [totalValueLocked, setTotalValueLocked] = useState();
  const [totalDollarValue, setTotalDollarValue] = useState();
  const [harborSupply, setHarborSupply] = useState(0)
  const [harborCirculatingSupply, setHarborCirculatingSypply] = useState(0)
  const [harborCurrentSypply, setHarborCurrentSupply] = useState(0);
  const [cmstCurrentSupply, setCmstCurrentSupply] = useState();
  const [calculatedCMSTSupply, setCalculatedCMSTSupply] = useState(0);

  useEffect(() => {
    if (markets.length > 0) {
      fetchTVL();
    }
    fetchTotalTokenMinted(PRODUCT_ID);
    fetchAllProposalUpData(PRODUCT_ID);
  }, [markets]);

  const fetchTVL = () => {
    queryAppTVL(PRODUCT_ID, (error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      if (result?.tvldata && result?.tvldata?.length > 0) {
        const uniqueVaults = Array.from(
          result?.tvldata?.reduce(
            (m, { assetDenom, collateralLockedAmount }) =>
              m.set(
                assetDenom,
                (m.get(assetDenom) || 0) + Number(collateralLockedAmount)
              ),
            new Map()
          ),
          ([assetDenom, collateralLockedAmount]) => ({
            assetDenom,
            collateralLockedAmount,
          })
        );
        let total = 0;
        const totalValue = new Map(
          uniqueVaults?.map((item) => {
            let value =
              Number(amountConversion(item.collateralLockedAmount)) *
              marketPrice(markets, item?.assetDenom);
            total += value;
            item.dollarValue = value;
            return [item.assetDenom, item];
          })
        );
        setTotalValueLocked(totalValue);
        setTotalDollarValue(total);
      }
    });
  };

  const fetchTotalTokenMinted = () => {
    queryTotalTokenMinted(PRODUCT_ID, (error, result) => {
      if (error) {
        message.error(error);
        return;
      }
      setCmstCurrentSupply(result?.mintedData)
    })
  }

  const fetchAllProposalUpData = (productId) => {
    fetchProposalUpData(productId).then((res) => {
      setHarborCurrentSupply(res?.current_supply)
    }).catch((err) => {
      message.error(err);
    })
  }

  const fetchTotalveHarborSupply = () => {
    totalveHarborSupply().then((res) => {
      setHarborSupply(res?.token)
    }).catch((err) => {
      console.log(err);
    })
  }

  const calculateTotalValueLockedInDollarForOthers = () => {
    let amount = 0;
    if (totalDollarValue) {
      amount =
        Number(totalDollarValue) -
        (Number(totalValueLocked?.get("ucmdx")?.dollarValue || 0) +
          Number(totalValueLocked?.get(ibcDenoms?.uatom)?.dollarValue || 0));
    }

    return `$${commaSeparator(Number(amount || 0).toFixed(DOLLAR_DECIMALS))}
`;
  };

  const calculateHarborSypply = () => {
    let amount = amountConversion(harborCurrentSypply) - amountConversion(harborSupply);
    amount = Number(amount).toFixed(DOLLAR_DECIMALS);
    setHarborCirculatingSypply(amount)
  }
  useEffect(() => {
    calculatedCmstCurrentSupply()
  }, [cmstCurrentSupply])

  useEffect(() => {
    fetchTotalveHarborSupply()
  }, [])

  useEffect(() => {
    if (harborSupply) {
      calculateHarborSypply()
    }
  }, [harborSupply])


  const getPrice = (denom) => {
    return poolPriceMap[denom] || marketPrice(markets, denom) || 0;
  };
  const calculatedCmstCurrentSupply = () => {
    let totalMintedAmount = 0;
    cmstCurrentSupply && cmstCurrentSupply.map((item) => {
      return totalMintedAmount = totalMintedAmount + Number(item?.mintedAmount);
    })
    setCalculatedCMSTSupply(totalMintedAmount);
  }
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
            name: "ATOM",
            y: Number(totalValueLocked?.get(ibcDenoms?.uatom)?.dollarValue || 0),
            color: "#665AA6",
          },
          {
            name: "CMDX",
            y: Number(totalValueLocked?.get("ucmdx")?.dollarValue || 0),
            color: "#BFA9D7",
          },
          {
            name: "Others",
            y:
              Number(totalDollarValue || 0) -
              (Number(totalValueLocked?.get("ucmdx")?.dollarValue || 0) +
                Number(totalValueLocked?.get(ibcDenoms?.uatom)?.dollarValue || 0)),
            color: isDarkMode ? "#373549" : "#E0E0E0",
          },
        ],
      },
    ],
  };

  const PriceChart = {
    chart: {
      type: "spline",
      backgroundColor: null,
      height: 130,
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
          color: "#FFCEFF",
        },
      },
      categories: ["0.95", "1.00", "1.05", "2.00"],
    },
    xAxis: {
      lineColor: false,
      labels: {
        style: {
          fontSize: 10,
          color: "#FFCEFF",
          fontWeight: 300,
        },
      },
      gridLineWidth: 1,
      gridLineColor: isDarkMode ? "#6C597B" : "#FFCEFF",
      categories: [
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
      ],
    },
    series: [
      {
        showInLegend: false,
        lineWidth: 2,
        lineColor: "#665aa6",
        marker: false,
        data: [0.9, 0.9, 1.01, 1, 1, 1, 1, 1, 1.01, 1, 1, 1, 0.9, 1.05, 1],
      },
    ],
  };
  const HarborPrice = {
    chart: {
      type: "spline",
      backgroundColor: null,
      height: 130,
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
          color: "#FFCEFF",
        },
      },
      categories: ["0.01", "0.10"],
    },
    xAxis: {
      lineColor: false,
      labels: {
        style: {
          fontSize: 10,
          color: "#FFCEFF",
          fontWeight: 300,
        },
      },
      gridLineWidth: 1,
      gridLineColor: isDarkMode ? "#6C597B" : "#FFCEFF",
      categories: [
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",

      ],
    },
    series: [
      {
        showInLegend: false,
        lineWidth: 2,
        lineColor: "#665aa6",
        marker: false,
        data: [
          0.01, 0.03, 0.02, 0.04, 0.03, 0.05, 0.08, 0.06, 0.09, 0.07, 0.04, 0.08, 0.1, 0.07, 0.05,
        ],
      },
    ],
  };
  const harborMarketCap = () => {
    let supply = Number(amountConversion(harborCurrentSypply, DOLLAR_DECIMALS));
    let price = Number(getPrice(harbor?.coinMinimalDenom)).toFixed(DOLLAR_DECIMALS)
    let marketCap = supply * price;
    marketCap = Number(marketCap).toFixed(DOLLAR_DECIMALS)
    marketCap = commaSeparator(marketCap)
    return marketCap || 0;
  }
  const cmstMarketCap = () => {
    let supply = Number(amountConversion(calculatedCMSTSupply, DOLLAR_DECIMALS));
    let price = Number(marketPrice(markets, cmst?.coinMinimalDenom))
    let marketCap = supply * price;
    marketCap = commaSeparator(marketCap)
    return marketCap || 0;
  }
  return (
    <div className="app-content-wrapper dashboard-app-content-wrapper">
      <Row>
        <Col className="dashboard-upper ">
          <div className="dashboard-upper-left ">
            <div className="composite-card  earn-deposite-card">
              <div className="dashboard-statics">
                <p className="total-value">
                  Total Value Locked{" "}
                  <TooltipIcon
                    text={variables[lang].tooltip_total_value_locked}
                  />
                </p>
                <h2>
                  ${commaSeparator(Number(totalDollarValue || 0).toFixed(DOLLAR_DECIMALS))}
                </h2>
              </div>
              <div className="totalvalues">
                <div className="totalvalues-chart">
                  <HighchartsReact highcharts={Highcharts} options={Options} />
                </div>
                <div className="totalvalues-right">
                  <div className="dashboard-statics mb-5">
                    <p>ATOM</p>
                    <h3>
                      $
                      {commaSeparator(
                        Number(totalValueLocked?.get(ibcDenoms?.uatom)?.dollarValue || 0).toFixed(
                          DOLLAR_DECIMALS)
                      )}
                    </h3>
                  </div>
                  <div className="dashboard-statics mb-5 total-dashboard-stats">
                    <p>CMDX</p>
                    <h3>
                      $
                      {commaSeparator(
                        Number(totalValueLocked?.get("ucmdx")?.dollarValue || 0).toFixed(
                          DOLLAR_DECIMALS)
                      )}
                    </h3>
                  </div>
                  <div className="dashboard-statics mb-0 others-dashboard-stats">
                    <p>Others</p>
                    <h3>{calculateTotalValueLockedInDollarForOthers()}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-upper-right  ">
            <div className="composite-card dashboardupper-chart earn-deposite-card ">
              <div className="dashboardupperchart-head">
                <div className="col1">
                  <small>CMST Price</small>
                  <h4>
                    ${marketPrice(markets, cmst?.coinMinimalDenom)} <span>0.00%</span>
                  </h4>
                </div>
                <div className="col2">
                  <small>
                    Circulating Supply{" "}
                    <TooltipIcon
                      text={variables[lang].tooltip_circulating_supply_CMST}
                    />
                  </small>
                  <p>
                    {calculatedCMSTSupply ? amountConversionWithComma(calculatedCMSTSupply, DOLLAR_DECIMALS) : "00.00"}<span> CMST</span>
                  </p>
                </div>
                <div className="col3">
                  <small>
                    Market Cap{" "}
                    <TooltipIcon text={variables[lang].tooltip_market_cap} />
                  </small>
                  <p>${calculatedCMSTSupply ? cmstMarketCap() : "0.00"}</p>
                </div>
              </div>
              <div className="right-chart">
                <HighchartsReact highcharts={Highcharts} options={PriceChart} />
              </div>
            </div>
            <div className="composite-card ">
              <div className="composite-card dashboardupper-chart earn-deposite-card ">
                <div className="dashboardupperchart-head">
                  <div className="col1">
                    <small>HARBOR Price</small>
                    <h4>
                      ${Number(getPrice(harbor?.coinMinimalDenom)).toFixed(DOLLAR_DECIMALS)}<span> 2.41%</span>
                    </h4>
                  </div>
                  <div className="col2">
                    <small>
                      Circulating Supply{" "}
                      <TooltipIcon
                        text={variables[lang].tooltip_circulating_supply_HARBOR}
                      />
                    </small>
                    <p>
                      {harborCirculatingSupply ? commaSeparator(harborCirculatingSupply) : "00.00"}<span> HARBOR</span>
                    </p>
                  </div>
                  <div className="col3">
                    <small>
                      Market Cap{" "}
                      <TooltipIcon text={variables[lang].tooltip_market_cap} />
                    </small>
                    <p>${harborCurrentSypply ? harborMarketCap() : "0.00"}</p>
                  </div>
                </div>
                <div className="right-chart">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={HarborPrice}
                  />
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Banner lang={lang} />
    </div>
  );
};

Dashboard.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
  lang: PropTypes.string.isRequired,
  poolPriceMap: PropTypes.object,
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
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    isDarkMode: state.theme.theme.darkThemeEnabled,
    markets: state.oracle.market.list,
    poolPriceMap: state.liquidity.poolPriceMap,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(Dashboard);
