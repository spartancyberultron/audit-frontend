import { List, Table } from "antd";
import Lodash from "lodash";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { Col, Row, SvgIcon, TooltipIcon } from "../../components/common";
import AssetList from "../../config/ibc_assets.json";
import { cmst, comdex, harbor } from "../../config/network";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { getChainConfig } from "../../services/keplr";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion
} from "../../utils/coin";
import { commaSeparator, marketPrice } from "../../utils/number";
import { iconNameFromDenom } from "../../utils/string";
import Deposit from "./DepositModal";
import "./index.less";
import Withdraw from "./WithdrawModal";


const Assets = ({ assetBalance, balances, markets, poolPriceMap }) => {
  const data = [
    {
      title: (
        <>
          Total Asset Balance <TooltipIcon text="Value of total Asset" />
        </>
      ),
      counts: `$${amountConversionWithComma(assetBalance, DOLLAR_DECIMALS)}`,
    },
  ];

  const columns = [
    {
      title: "Asset",
      dataIndex: "asset",
      key: "asset",
      width: 180,
    },
    {
      title: "No. of Tokens",
      dataIndex: "noOfTokens",
      key: "noOfTokens",
      width: 150,
      render: (tokens) => (
        <>
          <p>{commaSeparator(Number(tokens || 0))}</p>
        </>
      ),
    },
    {
      title: "Oracle Price",
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (price) => (
        <>
          <p>${commaSeparator(Number(price || 0).toFixed(DOLLAR_DECIMALS))}</p>
        </>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      render: (balance) => (
        <>
          <p>
            $
            {commaSeparator(
              amountConversion(balance?.value || 0, DOLLAR_DECIMALS)
            )}
          </p>
        </>
      ),
    },
    {
      title: "IBC Deposit",
      dataIndex: "ibcdeposit",
      key: "ibcdeposit",
      width: 150,
      align: "center",
      render: (value) => {
        if (value) {
          return <Deposit chain={value} />;
        }
      },
    },
    {
      title: "IBC Withdraw",
      dataIndex: "ibcwithdraw",
      key: "ibcwithdraw",
      width: 150,
      align: "center",
      render: (value) => {
        if (value) {
          return <Withdraw chain={value} />;
        }
      },
    },
  ];

  const getPrice = (denom) => {
    return poolPriceMap[denom] || marketPrice(markets, denom) || 0;
  };

  let ibcBalances = AssetList?.tokens.map((token) => {
    const ibcBalance = balances.find(
      (item) => item.denom === token?.ibcDenomHash
    );

    const value = getPrice(ibcBalance?.denom) * ibcBalance?.amount;

    return {
      chainInfo: getChainConfig(token),
      coinMinimalDenom: token?.coinMinimalDenom,
      balance: {
        amount: ibcBalance?.amount ? amountConversion(ibcBalance.amount) : 0,
        value: value || 0,
      },
      sourceChannelId: token.comdexChannel,
      destChannelId: token.channel,
      ibcDenomHash: token?.ibcDenomHash,
      explorerUrlToTx: token?.explorerUrlToTx,
    };
  });

  const nativeCoin = balances.filter(
    (item) => item.denom === comdex?.coinMinimalDenom
  )[0];
  const nativeCoinValue = getPrice(nativeCoin?.denom) * nativeCoin?.amount;

  const cmstCoin = balances.filter(
    (item) => item.denom === cmst?.coinMinimalDenom
  )[0];
  const cmstCoinValue = getPrice(cmstCoin?.denom) * cmstCoin?.amount;

  const harborCoin = balances.filter(
    (item) => item.denom === harbor?.coinMinimalDenom
  )[0];
  const harborCoinValue = getPrice(harborCoin?.denom) * harborCoin?.amount;

  const currentChainData = [
    {
      key: comdex.chainId,
      asset: (
        <>
          <div className="assets-with-icon">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(comdex?.coinMinimalDenom)} />
            </div>{" "}
            {denomConversion(comdex?.coinMinimalDenom)}{" "}
          </div>
        </>
      ),
      noOfTokens: nativeCoin?.amount ? amountConversion(nativeCoin.amount) : 0,
      price: getPrice(comdex?.coinMinimalDenom),
      amount: {
        value: nativeCoinValue || 0,
      },
    },
    {
      key: cmst.coinMinimalDenom,
      asset: (
        <>
          <div className="assets-with-icon">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(cmst?.coinMinimalDenom)} />
            </div>{" "}
            {denomConversion(cmst?.coinMinimalDenom)}{" "}
          </div>
        </>
      ),
      noOfTokens: cmstCoin?.amount ? amountConversion(cmstCoin.amount) : 0,
      price: getPrice(cmst?.coinMinimalDenom),
      amount: {
        value: cmstCoinValue || 0,
      },
    },
    {
      key: harbor.coinMinimalDenom,
      asset: (
        <>
          <div className="assets-with-icon">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(harbor?.coinMinimalDenom)} />
            </div>{" "}
            {denomConversion(harbor?.coinMinimalDenom)}{" "}
          </div>
        </>
      ),
      noOfTokens: harborCoin?.amount ? amountConversion(harborCoin.amount) : 0,
      price: getPrice(harbor?.coinMinimalDenom),
      amount: {
        value: harborCoinValue || 0,
      },
    },
  ];

  const tableIBCData =
    ibcBalances &&
    ibcBalances.map((item) => {
      return {
        key: item?.coinMinimalDenom,
        asset: (
          <>
            <div className="assets-with-icon">
              <div className="assets-icon">
                <SvgIcon name={iconNameFromDenom(item?.coinMinimalDenom)} />
              </div>{" "}
              {denomConversion(item?.coinMinimalDenom)}{" "}
            </div>
          </>
        ),
        noOfTokens: item?.balance?.amount,
        price: getPrice(item?.coinMinimalDenom),
        amount: item.balance,
        ibcdeposit: item,
        ibcwithdraw: item,
      };
    });

  const tableData = Lodash.concat(currentChainData, tableIBCData);

  return (
    <div className="app-content-wrapper">
      <Row>
        <Col>
          <div className="asset-wrapper">
            <div className="commodo-card myhome-upper d-block">
              <div className="myhome-upper-left w-100">
                <List
                  grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 1,
                    lg: 1,
                    xl: 1,
                    xxl: 1,
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
            <div className="commodo-card py-3 bg-none">
              <div className="card-content">
                <Table
                  className="custom-table auction-table"
                  dataSource={tableData}
                  columns={columns}
                  pagination={false}
                  scroll={{ x: "100%", y: "calc(100vh - 280px)" }}
                />
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

Assets.propTypes = {
  lang: PropTypes.string.isRequired,
  assetBalance: PropTypes.number,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.arrayOf(
    PropTypes.shape({
      rates: PropTypes.shape({
        low: PropTypes.number,
      }),
      symbol: PropTypes.string,
      script_id: PropTypes.string,
    })
  ),
  poolPriceMap: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    assetBalance: state.account.balances.asset,
    balances: state.account.balances.list,
    markets: state.oracle.market.list,
    poolPriceMap: state.liquidity.poolPriceMap,
  };
};

export default connect(stateToProps)(Assets);
