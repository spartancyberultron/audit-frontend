import { Button, Table } from "antd";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import { Col, Row, SvgIcon, TooltipIcon } from "../../components/common";
import { amountConversionWithComma, denomConversion } from "../../utils/coin";
import { iconNameFromDenom } from "../../utils/string";
import AssetApy from "../Market/AssetApy";
import "./index.less";

const Deposit = ({ userLendList, inProgress }) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: "Asset",
      dataIndex: "asset",
      key: "asset",
      width: 150,
    },
    {
      title: (
        <>
          Available <TooltipIcon text="Balance after transaction" />
        </>
      ),
      dataIndex: "available",
      key: "available",
      width: 250,
    },
    {
      title: "cPool",
      dataIndex: "cpool",
      key: "cpool",
      width: 180,
    },
    {
      title: "APY",
      dataIndex: "apy",
      key: "apy",
      width: 150,
      render: (lend) => (
        <AssetApy poolId={lend?.poolId} assetId={lend?.assetId} parent="lend" />
      ),
    },
    {
      title: "Rewards",
      dataIndex: "rewards",
      key: "rewards",
      width: 200,
      className: "rewards-column",
    },
    {
      title: "",
      dataIndex: "action",
      key: "action",
      align: "right",
      width: 200,
      render: (item) => (
        <>
          <div className="d-flex">
            <Button
              onClick={() =>
                navigate(`/myhome/deposit/${item?.lendingId?.toNumber()}`)
              }
              type="primary"
              className="btn-filled table-btn"
              size="small"
            >
              Deposit
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() =>
                navigate({
                  pathname: `/myhome/deposit/${item?.lendingId?.toNumber()}`,
                  hash: "withdraw",
                })
              }
              className="ml-2 table-btn"
            >
              Withdraw
            </Button>
          </div>
        </>
      ),
    },
  ];

  const tableData =
    userLendList?.length > 0
      ? userLendList?.map((item, index) => {
          return {
            key: index,
            asset: (
              <>
                <div className="assets-with-icon">
                  <div className="assets-icon">
                    <SvgIcon name={iconNameFromDenom(item?.amountIn?.denom)} />
                  </div>
                  {denomConversion(item?.amountIn?.denom)}
                </div>
              </>
            ),
            available: (
              <>
                {" "}
                {amountConversionWithComma(item?.amountIn?.amount)}{" "}
                {denomConversion(item?.amountIn?.denom)}
              </>
            ),
            cpool: item?.cpoolName,
            apy: item,
            rewards: (
              <>
                {amountConversionWithComma(item?.rewardAccumulated)}{" "}
                {denomConversion(item?.amountIn?.denom)}
              </>
            ),
            action: item,
          };
        })
      : [];

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col>
          <div className="commodo-card bg-none">
            <div className="card-header">MY Deposited Assets</div>
            <div className="card-content">
              <Table
                className="custom-table"
                dataSource={tableData}
                loading={inProgress}
                columns={columns}
                pagination={false}
                scroll={{ x: "100%" }}
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

Deposit.propTypes = {
  lang: PropTypes.string.isRequired,
  userLendList: PropTypes.arrayOf(
    PropTypes.shape({
      amountIn: PropTypes.shape({
        denom: PropTypes.string.isRequired,
        amount: PropTypes.string,
      }),
      assetId: PropTypes.shape({
        low: PropTypes.number,
      }),
      cpoolName: PropTypes.string,
      poolId: PropTypes.shape({
        low: PropTypes.number,
      }),
      rewardAccumulated: PropTypes.string,
    })
  ),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    userLendList: state.lend.userLends,
  };
};

export default connect(stateToProps)(Deposit);
