import { Button, Table } from "antd";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import { Col, Row, SvgIcon, TooltipIcon } from "../../components/common";
import HealthFactor from "../../components/HealthFactor";
import { amountConversionWithComma, denomConversion } from "../../utils/coin";
import { iconNameFromDenom } from "../../utils/string";
import AssetApy from "../Market/AssetApy";
import "./index.less";

const Borrow = ({ userBorrowList, inProgress }) => {
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
          Debt <TooltipIcon text="Current Outstanding Debt" />
        </>
      ),
      dataIndex: "debt",
      key: "debt",
      width: 200,
    },
    {
      title: "Collateral",
      dataIndex: "collateral",
      key: "collateral",
      width: 200,
    },
    {
      title: (
        <>
          Health Factor <TooltipIcon text="Numeric representation of your position's safety. Liquidation at H.F<1.0" />
        </>
      ),
      dataIndex: "health",
      key: "health",
      width: 130,
      align: "center",
      render: (item) => <HealthFactor parent="table" borrow={item} />,
    },
    {
      title: "APY",
      dataIndex: "apy",
      key: "apy",
      width: 100,
      render: (borrow) => <AssetApy borrowPosition={borrow} parent="borrow" />,
    },
    {
      title: "Interest",
      dataIndex: "interest",
      key: "interest",
      width: 150,
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
                navigate(`/myhome/borrow/${item?.borrowingId?.toNumber()}`)
              }
              type="primary"
              className="btn-filled"
              size="small"
            >
              Borrow
            </Button>
            <Button
              onClick={() =>
                navigate({
                  pathname: `/myhome/borrow/${item?.borrowingId?.toNumber()}`,
                  hash: "repay",
                })
              }
              type="primary"
              size="small"
              className="ml-2"
            >
              Repay
            </Button>
          </div>
        </>
      ),
    },
  ];

  const tableData =
    userBorrowList?.length > 0
      ? userBorrowList?.map((item, index) => {
          return {
            key: index,
            asset: (
              <>
                <div className="assets-with-icon">
                  <div className="assets-icon">
                    <SvgIcon name={iconNameFromDenom(item?.amountOut?.denom)} />
                  </div>
                  {denomConversion(item?.amountOut?.denom)}
                </div>
              </>
            ),
            debt: (
              <>
                {" "}
                {amountConversionWithComma(item?.amountOut?.amount)}{" "}
                {denomConversion(item?.amountOut?.denom)}
              </>
            ),
            collateral: (
              <>
                {" "}
                {amountConversionWithComma(item?.amountIn?.amount)}{" "}
                {denomConversion(item?.amountIn?.denom)}
              </>
            ),
            apy: item,
            interest: (
              <>
                {amountConversionWithComma(item?.interestAccumulated)}{" "}
                {denomConversion(item?.amountOut?.denom)}
              </>
            ),
            health: item,
            action: item,
          };
        })
      : [];

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col>
          <div className="commodo-card bg-none">
            <div className="card-header">MY Borrowed AssetS</div>
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

Borrow.propTypes = {
  lang: PropTypes.string.isRequired,
  inProgress: PropTypes.bool,
  userBorrowList: PropTypes.arrayOf(
    PropTypes.shape({
      amountOut: PropTypes.shape({
        denom: PropTypes.string.isRequired,
        amount: PropTypes.string,
      }),
      borrowingId: PropTypes.shape({
        low: PropTypes.number,
      }),
      cpoolName: PropTypes.string,
      lendingId: PropTypes.shape({
        low: PropTypes.number,
      }),
      pairId: PropTypes.shape({
        low: PropTypes.number,
      }),
      interestAccumulated: PropTypes.string,
    })
  ),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    userBorrowList: state.lend.userBorrows,
  };
};

export default connect(stateToProps)(Borrow);
