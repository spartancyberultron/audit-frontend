import "./index.scss";
import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../components/common";
import { connect } from "react-redux";
import React from "react";
import { Table } from "antd";
import variables from "../../utils/variables";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
} from "../../utils/coin";

import { message } from "antd";
import { iconNameFromDenom } from "../../utils/string";
import { cmst, comdex, harbor } from "../../config/network";
import Lodash from "lodash";
import { marketPrice } from "../../utils/number";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { commaSeparator } from "../../utils/number";
import AssetList from "../../config/ibc_assets.json";
import { getChainConfig } from "../../services/keplr";

const Assets = ({ lang, assetBalance, balances, markets, refreshBalance, poolPriceMap }) => {

  const columns = [
    {
      title: "Asset",
      dataIndex: "asset",
      key: "asset",
    },
    {
      title: "No. of Tokens",
      dataIndex: "noOfTokens",
      key: "noOfTokens",
      align: "center",
      render: (tokens) => (
        <>
          <p>{commaSeparator(Number(tokens || 0))}</p>
        </>
      ),
    },
    {
      title: "Oracle Price",
      dataIndex: "oraclePrice",
      key: "oraclePrice",
      align: "center",
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
      align: "center",
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
      width: 110,
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
  const cmstCoin = balances.filter(
    (item) => item.denom === cmst?.coinMinimalDenom
  )[0];
  const harborCoin = balances.filter(
    (item) => item.denom === harbor?.coinMinimalDenom
  )[0];

  const nativeCoinValue = getPrice(nativeCoin?.denom) * nativeCoin?.amount;
  const cmstCoinValue = getPrice(cmstCoin?.denom) * cmstCoin?.amount;
  const harborCoinValue = getPrice(harborCoin?.denom) * harborCoin?.amount;

  const currentChainData = [
    {
      key: comdex.chainId,
      asset: (
        <>
          <div className="assets-withicon">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(comdex?.coinMinimalDenom)} />
            </div>{" "}
            {denomConversion(comdex?.coinMinimalDenom)}
          </div>
        </>
      ),
      noOfTokens: nativeCoin?.amount ? amountConversion(nativeCoin.amount) : 0,
      oraclePrice: getPrice(comdex?.coinMinimalDenom),
      amount: {
        value: nativeCoinValue || 0,
      },
    },
    {
      key: cmst?.coinDenom,
      asset: (
        <>
          <div className="assets-withicon">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(cmst?.coinMinimalDenom)} />
            </div>{" "}
            {denomConversion(cmst?.coinMinimalDenom)}
          </div>
        </>
      ),
      noOfTokens: cmstCoin?.amount ? amountConversion(cmstCoin.amount) : 0,
      oraclePrice: getPrice(cmst?.coinMinimalDenom),
      amount: {
        value: cmstCoinValue || 0,
      },
    },
    {
      key: harbor?.coinDenom,
      asset: (
        <>
          <div className="assets-withicon">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(harbor?.coinMinimalDenom)} />
            </div>{" "}
            {denomConversion(harbor?.coinMinimalDenom)}
          </div>
        </>
      ),
      noOfTokens: harborCoin?.amount ? amountConversion(harborCoin.amount) : 0,
      oraclePrice: getPrice(harbor?.coinMinimalDenom),

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
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon name={iconNameFromDenom(item?.coinMinimalDenom)} />
              </div>
              {denomConversion(item?.coinMinimalDenom)}{" "}
            </div>
          </>
        ),
        noOfTokens: item?.balance?.amount,
        oraclePrice: getPrice(item?.coinMinimalDenom),
        amount: item.balance,
        ibcdeposit: item,
        ibcwithdraw: item,
      };
    });

  const tableData = Lodash.concat(currentChainData, tableIBCData);

  return (
    <div className="app-content-wrapper">
      <div className=" assets-section">
        <Row>
          <Col>
            <div className="assets-head">
              <div>
                <h2>{variables[lang].comdex_assets}</h2>
              </div>
              <div>
                <span>{variables[lang].total_asset_balance}</span>{" "}
                {amountConversionWithComma(assetBalance, DOLLAR_DECIMALS)}{" "}
                {variables[lang].USD}
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table
              className="custom-table assets-table"
              dataSource={tableData}
              columns={columns}
              pagination={false}
              scroll={{ x: "100%" }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

Assets.propTypes = {
  lang: PropTypes.string.isRequired,
  assetBalance: PropTypes.number,
  refreshBalance: PropTypes.number.isRequired,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
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
    assetBalance: state.account.balances.asset,
    balances: state.account.balances.list,
    markets: state.oracle.market.list,
    refreshBalance: state.account.refreshBalance,
    poolPriceMap: state.liquidity.poolPriceMap,
  };
};

export default connect(stateToProps)(Assets);
