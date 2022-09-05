import "./index.scss";
import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../components/common";
import { Table } from "antd";
import { connect } from "react-redux";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button, Modal, message } from "antd";
import { denomToSymbol, iconNameFromDenom } from "../../utils/string";
import { amountConversionWithComma, denomConversion } from "../../utils/coin";
import { setBalanceRefresh } from "../../actions/account";
import { claimableRewards } from "../../services/rewardContractsWrite";
import { DOLLAR_DECIMALS, PRODUCT_ID } from "../../constants/common";
import { transactionClaimRewards } from "../../services/rewardContractsRead";

const More = ({
  address,
  refreshBalance,
  setBalanceRefresh,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [claimableRewardsData, setClaimableRewardsData] = useState()
  const handleRouteChange = (path) => {
    navigate({
      pathname: path,
    });
  };


  const showModal = () => {
    fetchClaimeableRewards(PRODUCT_ID, address)
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };


  // Query 
  const fetchClaimeableRewards = (productId, address) => {
    setLoading(true)
    claimableRewards(productId, address).then((res) => {
      setClaimableRewardsData(res)
      setLoading(false)
    }).catch((error) => {
      console.log(error);
      setLoading(false)
    })
  }
  const claimReward = () => {
    setLoading(true)
    if (address) {
      transactionClaimRewards(address, PRODUCT_ID, (error, result) => {
        if (error) {
          message.error("Transaction failed")
          setLoading(false)
          return;
        }
        message.success("Success")
        setBalanceRefresh(refreshBalance + 1);
        setLoading(false)
      })
    }
    else {
      setLoading(false)
      message.error("Please Connect Wallet")
    }
  }
  // UseEffect calls 
  useEffect(() => {
    fetchClaimeableRewards(PRODUCT_ID, address)
  }, [address, refreshBalance])

  const columns = [
    {
      title: (
        <>
          Asset
        </>
      ),
      dataIndex: "asset",
      key: "asset",
      width: 150,
    },
    {
      title: (
        <>
          You Earned{" "}
        </>
      ),
      dataIndex: "you_earned",
      key: "you_earned",
      width: 150,
      align: "right",
    },

  ];

  const tableData =
    claimableRewardsData && claimableRewardsData.map((item, index) => {
      return {
        key: index,
        asset: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon
                  name={iconNameFromDenom(
                    item?.denom
                  )}
                />
              </div>
              {denomToSymbol(item.denom)}
            </div>
          </>
        ),
        you_earned: (
          <>
            <div className="assets-withicon display-right">
              {amountConversionWithComma(item?.amount, DOLLAR_DECIMALS)} {denomToSymbol(item.denom)}
            </div>
          </>
        ),
      }
    })


  return (


    <div className="app-content-wrapper">
      <Row>
        <Col lg="6" md="6" sm="12" className="mb-3">
          <div className="more-card">
            <div className="more-card-inner">
              <div className="morecard-left">
                <h2> Governance</h2>
                <p>
                  Use veHARBOR token to drive key decision for the protocol via proposals
                </p>
                <div className="button-container">
                  <Button
                    type="primary"
                    className="btn-filled"
                    onClick={() => handleRouteChange("/govern")}
                  >
                    Govern
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>

        <Col lg="6" md="6" sm="12" className="mb-3">
          <div className="more-card">
            <div className="more-card-inner">
              <div className="morecard-left">
                <h2>Airdrop</h2>
                <p>
                  Perform tasks to claim your HARBOR airdrop.
                </p>
                <div className="button-container">
                  <Button
                    type="primary"
                    className="btn-filled"
                    disabled={true}
                  // onClick={() => handleRouteChange("/airdrop")}
                  >
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>

        <Col lg="6" md="6" sm="12" className="mb-3">
          <div className="more-card">
            <div className="more-card-inner">
              <div className="morecard-left">
                <h2>Stake</h2>
                <p>
                  Lock your Harbor token for veHarbor to benefit from increased voting power, rebases, external incentives and surplus rewards.
                </p>
                <div className="button-container">
                  <Button
                    type="primary"
                    className="btn-filled"
                    onClick={() => handleRouteChange("/vesting")}
                  // disabled={true}
                  >
                    Lock
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>

        <Col lg="6" md="6" sm="12" className="mb-3">
          <div className="more-card">
            <div className="more-card-inner">
              <div className="morecard-left">
                <h2>Vote</h2>
                <p>
                  Vote for your desired assets to receive external incentives to direct emissions to specific assets.

                </p>
                <div className="button-container">
                  <Button
                    type="primary"
                    className="btn-filled"
                    onClick={() => handleRouteChange("/vote")}
                  disabled={true}
                  >
                    Vote
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>

        <Col lg="6" md="6" sm="12" className="mb-3">
          <div className="more-card">
            <div className="more-card-inner">
              <div className="morecard-left">
                <h2>Rewards</h2>
                <p>
                  Rewards displayed are an estimation of the external incentives and surplus rewards that you can claim.
                </p>
                <div className="button-container">
                  <Button
                    type="primary"
                    className="btn-filled"
                    onClick={showModal}
                  >
                    Claim
                  </Button>


                  <Modal
                    centered={true}
                    className="palcebid-modal reward-collect-modal"
                    footer={null}
                    header={null}
                    visible={isModalVisible}
                    width={550}
                    closable={false}
                    onOk={handleOk}
                    loading={loading}
                    onCancel={handleCancel}
                    closeIcon={null}
                  >
                    <div className="palcebid-modal-inner rewards-modal-main-container">
                      <Row>
                        <Col>
                          <div className="rewards-title">
                            Claim Rewards
                          </div>
                        </Col>
                      </Row>

                      <Row style={{ paddingTop: 0 }}>
                        <Col>
                          <div className="card-content ">
                            <Table
                              className="custom-table liquidation-table"
                              dataSource={tableData}
                              columns={columns}
                              pagination={false}
                              scroll={{ x: "100%" }}
                            />
                          </div>
                        </Col>
                      </Row>

                      <Row>
                        <Col className="diaplay-center flex">
                          <Button
                            type="primary"
                            className="btn-filled "
                            size="sm"
                            onClick={() => claimReward()}
                            loading={loading}
                            disabled={!claimableRewardsData?.length > 0}
                          >
                            Claim All
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </Modal>

                </div>
              </div>
            </div>
          </div>
        </Col>

      </Row>
    </div>
  );
};

More.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string,
  refreshBalance: PropTypes.number.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    refreshBalance: state.account.refreshBalance,
  };
};
const actionsToProps = {
  setBalanceRefresh,
};
export default connect(stateToProps, actionsToProps)(More);