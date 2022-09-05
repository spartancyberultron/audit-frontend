import * as PropTypes from "prop-types";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Col, Row, SvgIcon } from "../../../components/common";
import { connect } from "react-redux";
import { Button, List, message } from "antd";
import "./index.less";
import VoteNowModal from "../VoteNowModal";
import { Link } from "react-router-dom";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import {
  fetchRestProposal,
  fetchRestProposer,
  queryUserVote,
} from "../../../services/govern/query";
import { formatTime, getDuration } from "../../../utils/date";
import { DOLLAR_DECIMALS } from "../../../constants/common";
import { proposalStatusMap, truncateString } from "../../../utils/string";
import { denomConversion } from "../../../utils/coin";
import { formatNumber } from "../../../utils/number";
import { comdex } from "../../../config/network";
import Copy from "../../../components/Copy";

const GovernDetails = ({ address }) => {
  const { id } = useParams();
  const [proposal, setProposal] = useState();
  const [proposer, setProposer] = useState();
  const [votedOption, setVotedOption] = useState();
  const [getVotes, setGetVotes] = useState({
    yes: 0,
    no: 0,
    veto: 0,
    abstain: 0,
  });

  const data = [
    {
      title: "Voting Starts",
      counts: formatTime(proposal?.voting_start_time) || "--/--/--",
    },
    {
      title: "Voting Ends",
      counts: formatTime(proposal?.voting_end_time) || "--/--/--",
    },
    {
      title: "Duration",
      counts: `${
        getDuration(proposal?.voting_end_time, proposal?.voting_start_time) || 0
      }
      Days`,
    },
    {
      title: "Proposer",
      counts: (
        <div className="address_with_copy">
          {proposer ? (
            <>
              <span>{truncateString(proposer, 6, 6)}</span>
              <Copy text={proposer} />
            </>
          ) : null}
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (id) {
      fetchRestProposal(id, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setProposal(result?.proposal);
      });
      fetchRestProposer(id, (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        setProposer(
          result?.tx_responses?.[0]?.tx?.body?.messages?.[0]?.proposer
        );
      });
    }
  }, [id]);

  useEffect(() => {
    if (proposal?.proposal_id) {
      calculateVotes();
      queryUserVote(address, proposal?.proposal_id, (error, result) => {
        if (error) {
          return;
        }

        setVotedOption(result?.vote);
      });
    }
  }, [address, id, proposal]);

  const calculateTotalValue = () => {
    let value = proposal?.final_tally_result;
    let yes = Number(value?.yes);
    let no = Number(value?.no);
    let veto = Number(value?.no_with_veto);
    let abstain = Number(value?.abstain);

    let totalValue = yes + no + abstain + veto;

    totalValue = totalValue / 1000000;
    totalValue = formatNumber(totalValue);
    return totalValue;
  };

  const dataVote = [
    {
      title: "Total Vote",
      counts: (
        <>
          {calculateTotalValue() || "0"}{" "}
          {denomConversion(comdex?.coinMinimalDenom)}
        </>
      ),
    },
  ];

  const calculateVotes = () => {
    let value = proposal?.final_tally_result;
    let yes = Number(value?.yes);
    let no = Number(value?.no);
    let veto = Number(value?.no_with_veto);
    let abstain = Number(value?.abstain);
    let totalValue = yes + no + abstain + veto;

    yes = Number((yes / totalValue) * 100).toFixed(DOLLAR_DECIMALS);
    no = Number((no / totalValue) * 100).toFixed(DOLLAR_DECIMALS);
    veto = Number((veto / totalValue) * 100).toFixed(DOLLAR_DECIMALS);
    abstain = Number((abstain / totalValue) * 100).toFixed(DOLLAR_DECIMALS);
    setGetVotes({
      ...getVotes,
      yes: yes,
      no: no,
      veto: veto,
      abstain: abstain,
    });
  };

  const Options = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: 180,
      margin: 5,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: null,
    },
    subtitle: {
      floating: true,
      style: {
        fontSize: "25px",
        fontWeight: "500",
        fontFamily: "Lexend Deca",
        color: "#fff",
      },
      y: 70,
    },
    plotOptions: {
      pie: {
        showInLegend: false,
        size: "120%",
        innerSize: "75%",
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
            name: "Yes",
            y: Number(getVotes?.yes || 0),
            color: "#52B788",
          },
          {
            name: "No",
            y: Number(getVotes?.no || 0),
            color: "#F76872",
          },
          {
            name: "noWithVeto",
            y: Number(getVotes?.veto || 0),
            color: "#AACBB9",
          },
          {
            name: "Abstain",
            y: Number(getVotes?.abstain || 0),
            color: "#6A7B6C",
          },
        ],
      },
    ],
  };

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col className="text-right mb-3">
          <Link to="/govern">
            <Button className="back-btn" type="primary">
              Back
            </Button>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="commodo-card myhome-upper d-block">
            <div className="card-header">PROPOSAL DETAILS</div>
            <div className="myhome-upper-left w-100">
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 2,
                  lg: 4,
                  xl: 4,
                  xxl: 4,
                }}
                dataSource={data}
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      <p>{item?.title}</p>
                      <h3>{item?.counts}</h3>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <div className="commodo-card govern-card2 h-100">
            <Row>
              <Col>
                <h3>#{proposal?.proposal_id}</h3>
              </Col>
              <Col className="text-right">
                <Button type="primary" className="btn-filled">
                  {/* Please use below for pass and faild */}
                  
                  <span className="passed-circle"></span>
                  {/* <span className="failed-circle"></span> */}
                  {proposalStatusMap[proposal?.status]}
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <h3>{proposal?.content?.title}</h3>
                <p>{proposal?.content?.description} </p>
              </Col>
            </Row>
          </div>
        </Col>
        <Col md="6">
          <div className="commodo-card govern-card2">
            <Row>
              <Col className="text-right">
                <VoteNowModal proposal={proposal} />
              </Col>
            </Row>
            <Row>
              <Col>
                <div className="govern-dlt-card">
                  <div className="govern-dlt-chart">
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={Options}
                    />
                  </div>
                  <div className="govern-dlt-right">
                    <List
                      grid={{
                        gutter: 16,
                        xs: 1,
                      }}
                      dataSource={dataVote}
                      renderItem={(item) => (
                        <List.Item>
                          <div>
                            <p>{item.title}</p>
                            <h3>{item.counts}</h3>
                          </div>
                        </List.Item>
                      )}
                    />
                    <ul className="vote-lists">
                      <li>
                        <SvgIcon name="rectangle" viewbox="0 0 34 34" />
                        <div>
                          <label>Yes</label>
                          <p>{Number(getVotes?.yes || "0.00")}%</p>
                        </div>
                      </li>
                      <li>
                        <SvgIcon name="rectangle" viewbox="0 0 34 34" />
                        <div>
                          <label>No</label>
                          <p>{Number(getVotes?.no || "0.00")}%</p>
                        </div>
                      </li>
                      <li>
                        <SvgIcon name="rectangle" viewbox="0 0 34 34" />
                        <div>
                          <label>noWithVeto </label>
                          <p>{Number(getVotes?.veto || "0.00")}%</p>
                        </div>
                      </li>
                      <li>
                        <SvgIcon name="rectangle" viewbox="0 0 34 34" />
                        <div>
                          <label>Abstain</label>
                          <p>{Number(getVotes?.abstain || "0.00")}%</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
};

GovernDetails.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(GovernDetails);
