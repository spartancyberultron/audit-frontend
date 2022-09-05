import { List } from "antd";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { Col, Row, SvgIcon } from "../../components/common";
import "./index.less";

const data = [
  {
    title: "Total Airdrop",
    counts: "24 CMDX",
  },
  {
    title: "Claimed Airdrop",
    counts: "1 CMDX",
  },
  {
    title: "Unclaimed Airdrop",
    counts: "0 CMDX",
  },
  {
    title: "Time to claim Airdrop",
    counts: "01D : 08H : 32M",
  },
];

const Airdrop = () => {
  return (
    <div className="app-content-wrapper">
      <Row>
        <Col>
          <div className="commodo-card myhome-upper d-block">
            <div className="card-header w-100 mb-2">CLAIM AIRDROP</div>
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
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      <p>{item.title}</p>
                      <h3>{item.counts}</h3>
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
          <div className="commodo-card">
            <div className="card-header">MY PROGRESS</div>
            <div className="card-content mt-4">
              <div className="airdrop-progress">
                <ul>
                  <li>
                    <span>
                      <span data-fill="true">
                        <div className="dot-icon">
                          <SvgIcon name="circle" viewbox="0 0 30 30" />
                        </div>
                        <p>25%</p>
                      </span>
                    </span>
                  </li>
                  <li>
                    <span>
                      <span data-fill="active">
                        <div className="dot-icon">
                          <SvgIcon name="circle" viewbox="0 0 30 30" />
                        </div>
                        <p>50%</p>
                      </span>
                    </span>
                  </li>
                  <li>
                    <span>
                      <span data-fill="false">
                        <div className="dot-icon">
                          <SvgIcon name="circle" viewbox="0 0 30 30" />
                        </div>
                        <p>75%</p>
                      </span>
                    </span>
                  </li>
                  <li data-fill-state="">
                    <span>
                      <span data-fill="false">
                        <div className="dot-icon">
                          <SvgIcon name="circle" viewbox="0 0 30 30" />
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
          <div className="commodo-card">
            <ul className="airdrop-progress-list">
              <li>
                <div className="progress-list-left">
                  <small>Mission #1</small>
                  <p>Lorem Ipsum Dolar amet</p>
                </div>
                <div className="progresslist-right">
                  <p>Complete</p>
                </div>
              </li>
              <li>
                <div className="progress-list-left">
                  <small>Mission #2</small>
                  <p>Lorem Ipsum Dolar amet</p>
                </div>
                <div className="progresslist-right">
                  <p>Ineligible</p>
                </div>
              </li>
              <li>
                <div className="progress-list-left">
                  <small>Mission #3</small>
                  <p>Lorem Ipsum Dolar amet</p>
                </div>
                <div className="progresslist-right">
                  <p>Ineligible</p>
                </div>
              </li>
              <li>
                <div className="progress-list-left">
                  <small>Mission #4</small>
                  <p>Lorem Ipsum Dolar amet</p>
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

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(Airdrop);
