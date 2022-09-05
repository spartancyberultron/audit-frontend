import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../../components/common";
import { connect } from "react-redux";
import { Button, List } from "antd";
import "./index.scss";
import { Link } from "react-router-dom";

const data = [
  {
    title: "Total Airdrop",
    counts: '24 HARBOR'
  },
  {
    title: "Claimed Airdrop",
    counts: "1 HARBOR"
  },
  {
    title: "Unclaimed Airdrop",
    counts: "0 HARBOR"
  },
  {
    title: "Time to claim Airdrop",
    counts: "01D : 08H : 32M"
  }
];

const Airdrop = (lang) => {
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
          <div className="composite-card myhome-upper earn-deposite-card d-block">
            <div className="card-header w-100 mb-2">
              CLAIM AIRDROP
            </div>
            <div className="myhome-upper-left w-100">
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 4,
                  lg: 4,
                  xl: 4,
                  xxl: 4,
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
      <Row>
        <Col>
          <div className="composite-card earn-deposite-card">
            <div className="card-header">
              MY PROGRESS
            </div>
            <div className="card-content mt-4">
              <div className="airdrop-progress">
                <ul>
                  <li>
                    <span>
                      <span data-fill="true">
                        <div className="dot-icon">
                          <SvgIcon
                            name="circle"
                            viewbox="0 0 30 30"
                          />
                        </div>
                        <p>25%</p>
                      </span>
                    </span>
                  </li>
                  <li>
                    <span>
                      <span data-fill="active">
                        <div className="dot-icon">
                          <SvgIcon
                            name="circle"
                            viewbox="0 0 30 30"
                          />
                        </div>
                        <p>50%</p>
                      </span>
                    </span>
                  </li>
                  <li>
                    <span>
                      <span data-fill="false">
                        <div className="dot-icon">
                          <SvgIcon
                            name="circle"
                            viewbox="0 0 30 30"
                          />
                        </div>
                        <p>75%</p>
                      </span>
                    </span>
                  </li>
                  <li data-fill-state="">
                    <span>
                      <span data-fill="false">
                        <div className="dot-icon">
                          <SvgIcon
                            name="circle"
                            viewbox="0 0 30 30"
                          />
                        </div>
                        <p>Complete</p>
                      </span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col>
          <div className="composite-card earn-deposite-card">
            <ul className="airdrop-progresslist">
              <li>
                <div className="progresslist-left">
                  <small>Mission #1</small>
                  <p>(20%): Connect the wallet and deposit at least two assets on the platform.</p>
                </div>
                <div className="progresslist-right">
                  <p>Complete</p>
                </div>
              </li>
              <li>
                <div className="progresslist-left">
                  <small>Mission #2</small>
                  <p>(20%): Mint $CMST using any asset as collateral.</p>
                </div>
                <div className="progresslist-right">
                  <p>Ineligible</p>
                </div>
              </li>
              <li>
                <div className="progresslist-left">
                  <small>Mission #3</small>
                  <p>20%): Deposit $CMST in the Locker Vault in the Earn tab.</p>
                </div>
                <div className="progresslist-right">
                  <p>Ineligible</p>
                </div>
              </li>
              <li>
                <div className="progresslist-left">
                  <small>Mission #4</small>
                  <p>(40%): Vote on governance proposals for one year using $HARBOR</p>
                </div>
                <div className="progresslist-right">
                  <p>Ineligible</p>
                </div>
              </li>
            </ul>
          </div>
        </Col>
      </Row>
    </div>
  );
};

Airdrop.propTypes = {
  lang: PropTypes.string.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
  };
};

const actionsToProps = {
};

export default connect(stateToProps, actionsToProps)(Airdrop);
