import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../../components/common";
import { connect } from "react-redux";
import { Link, useNavigate } from 'react-router-dom';
import { Button, List, Select, Progress, Spin } from "antd";
import "./index.scss";
import { fetchProposalUpData, totalProposal, totalveHarborSupply } from "../../../services/contractsRead";
import React, { useEffect } from "react";
import { DOLLAR_DECIMALS, PRODUCT_ID } from '../../../constants/common';
import moment from "moment";
import { setAllProposal, setProposalUpData } from "../../../actions/govern";
import { useState } from "react";
import NoData from "../../../components/NoData";
import { amountConversionWithComma } from "../../../utils/coin";

const { Option } = Select;



const Govern = ({
  lang,
  address,
  allProposal,
  setAllProposal,
  proposalUpData,
  setProposalUpData,
  voteCount,
}) => {

  const [proposalList, setProposalList] = useState()
  const [totalSupply, setTotalSupply] = useState(0)
  const [loading, setLoading] = useState();

  const fetchAllProposal = (productId) => {
    totalProposal(productId).then((res) => {
      setAllProposal(res)
      let reverseProposal = res.reverse();
      setProposalList(reverseProposal)
    }).catch((err) => {
    })
  }

  const fetchAllProposalUpData = (productId) => {
    setLoading(true)
    fetchProposalUpData(productId).then((res) => {
      setProposalUpData(res)
      setLoading(false)
    }).catch((err) => {
      setLoading(false)
    })
  }
  const fetchTotalveHarborSupply = () => {
    setLoading(true)
    totalveHarborSupply().then((res) => {
      setTotalSupply(res)
      setLoading(false)
    }).catch((err) => {
      setLoading(false)
    })
  }

  const unixToGMTTime = (time) => {
    let newTime = Math.floor(time / 1000000000);
    var timestamp = moment.unix(newTime);
    timestamp = timestamp.format("DD/MMMM/YYYY")
    return timestamp;
  }

  useEffect(() => {
    fetchAllProposal(PRODUCT_ID)
    fetchAllProposalUpData(PRODUCT_ID)
    fetchTotalveHarborSupply()
  }, [address])

  const calculateAverageParticipation = () => {
    let avgParticipation = proposalUpData?.active_participation_supply
    avgParticipation = avgParticipation / proposalUpData?.proposal_count
    avgParticipation = avgParticipation / (totalSupply?.vtoken)
    avgParticipation = Number(avgParticipation * 100).toFixed(2)
    return avgParticipation;
  }

  const data = [
    {
      title: "Total Supply",
      counts: totalSupply ? amountConversionWithComma(totalSupply?.vtoken, DOLLAR_DECIMALS) + " veHARBOR" : "-"

    },
    {
      title: "Total Proposals",
      counts: proposalUpData ? proposalUpData?.proposal_count : "-"
    },
    {
      title: "Average Participation",
      counts: proposalUpData ? `${calculateAverageParticipation() + "%"}` : "-"
    }
  ];

  const getDuration = (data) => {
    let duration;
    duration = moment.duration(data, "seconds");
    duration = `${duration.days()} Days ${duration.hours()} Hours`
    return duration;

  }
  const calculateDurationPercentage = (startTime, duration) => {
    // formula = ((currentTime - start time)/duration )*100
    let start = Number(startTime)
    let totalDuration = Number(duration)
    let currentTime = Math.round((new Date()).getTime() / 1000)

    // Calculating start time in sec 
    // ***Removing nanosec from unix time*** 
    start = Math.floor(start / 1000000000);

    // Calculating percentage 
    let percentage = ((currentTime - start) / totalDuration) * 100
    percentage = Number(percentage).toFixed(2)
    percentage = Math.abs(percentage)
    return percentage;
  }
  const navigate = useNavigate();

  const filterAllProposal = (value) => {
    let allFilteredProposal = allProposal && allProposal.filter((item) => {
      if (value === "all") {
        return allProposal
      }
      return item.status === value
    })
    setProposalList(allFilteredProposal)
  }
  if (loading) {
    return <Spin />;
  }
  return (
    <div className="app-content-wrapper">
      <div className="back-btn-container">
        <Link to="/more">
          <Button className="back-btn" type="primary">
            Back
          </Button>
        </Link>
      </div>
      <Row>
        <Col>
          <div className="composite-card earn-deposite-card myhome-upper d-block ">
            <div className="myhome-upper-left w-100 ">
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 3,
                  lg: 3,
                  xl: 3,
                  xxl: 3,
                }}
                dataSource={data}
                renderItem={item => (
                  <List.Item>
                    <div>
                      <p>{item.title}</p>
                      <h3 className="claim-drop-amount">{item.counts}</h3>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <div className="comdex-card govern-card earn-deposite-card ">
            <div className="governcard-head ">
              <a href="https://forum.comdex.one/" target="_blank" rel="noreferrer"><Button type="primary" className="btn-filled">Forum</Button></a>
              <Select defaultValue="Filter" className="select-primary ml-2" onChange={(e) => filterAllProposal(e)} suffixIcon={<SvgIcon name="arrow-down" viewbox="0 0 19.244 10.483" />} style={{ width: 120 }}>
                <Option value="all" className="govern-select-option">All</Option>
                <Option value="open" >Open</Option>
                <Option value="pending">Pending</Option>
                <Option value="passed" >Passed</Option>
                <Option value="executed">Executed</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
            </div>
            <div className="govern-card-content ">
              {proposalList && proposalList?.length > 0 ? (
                proposalList && proposalList.map((item) => {
                  return (
                    <React.Fragment key={item?.id}>
                      <div className="governlist-row" onClick={() => navigate(`/govern-details/${item?.id}`)} >
                        <div className="left-section">
                          <h3>#{item?.id}</h3>
                          <h3>{item?.title}</h3>
                          <p>{item?.description} </p>
                        </div>
                        <div className="right-section">
                          <Row>
                            <Col sm="6">
                              <label>Vote Starts :</label>
                              <p>{unixToGMTTime(item?.start_time) || "--/--/--"}</p>
                            </Col>
                            <Col sm="6">
                              <label>Voting Ends :</label>
                              <p>{unixToGMTTime(item?.expires?.at_time) || "--/--/--"}</p>
                            </Col>
                            <Col sm="6">
                              <label>Duration : </label>
                              <p>{getDuration(item?.duration?.time)}</p>
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                              <Progress percent={calculateDurationPercentage(item?.start_time, item?.duration?.time)} size="small" />
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </React.Fragment>
                  )
                })
              ) : <NoData />

              }

            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

Govern.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  allProposal: PropTypes.array.isRequired,
  proposalUpData: PropTypes.array.isRequired,
  voteCount: PropTypes.number.isRequired
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    allProposal: state.govern.allProposal,
    proposalUpData: state.govern.proposalUpData,
    voteCount: state.govern.voteCount,
  };
};

const actionsToProps = {
  setAllProposal,
  setProposalUpData,
};

export default connect(stateToProps, actionsToProps)(Govern);
