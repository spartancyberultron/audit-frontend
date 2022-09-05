import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { buildQuery } from "@cosmjs/tendermint-rpc/build/tendermint34/requests";
import { comdex } from "../config/network";

import { DEFAULT_FEE } from "../constants/common";

export const getTypeURL = (key) => {
  switch (key) {
    case "create":
      return "/comdex.vault.v1beta1.MsgCreateRequest";
    case "deposit":
      return "/comdex.vault.v1beta1.MsgDepositRequest";
    case "withdraw":
      return "/comdex.vault.v1beta1.MsgWithdrawRequest";
    case "draw":
      return "/comdex.vault.v1beta1.MsgDrawRequest";
    case "repay":
      return "/comdex.vault.v1beta1.MsgRepayRequest";
    case "drawAndRepay":
      return "/comdex.vault.v1beta1.MsgDepositAndDrawRequest";

    default:
      return ""
  }
};

export const messageTypeToText = (type) => {
  switch (type) {
    case "/cosmos.bank.v1beta1.MsgSend":
      return "Send";
    case "/comdex.vault.v1beta1.MsgCreateRequest":
      return "Create Vault";
    case "/comdex.vault.v1beta1.MsgDepositRequest":
      return "Vault Deposit Collateral";
    case "/comdex.vault.v1beta1.MsgWithdrawRequest":
      return "Vault Withdraw Collateral";
    case "/comdex.vault.v1beta1.MsgDrawRequest":
      return "Vault Draw Debt";
    case "/comdex.vault.v1beta1.MsgRepayRequest":
      return "Vault Repay Debt";
    case "/comdex.vault.v1beta1.MsgCloseRequest":
      return "Close Vault";
    case "/comdex.liquidity.v1beta1.MsgDeposit":
      return "Pool Deposit";
    case "/comdex.liquidity.v1beta1.MsgWithdraw":
      return "Pool Withdraw";
    case "/comdex.liquidity.v1beta1.MsgSwapWithinBatch":
      return "Pool Swap";
    case "/ibc.applications.transfer.v1.MsgTransfer":
      return "IBC-Transfer";
    case "/comdex.auction.v1beta1.MsgPlaceBidRequest":
      return "Place Bid";
    case "/comdex.locker.v1beta1.MsgWithdrawAssetRequest":
      return "Withdraw Asset";
    case "/comdex.locker.v1beta1.MsgCreateLockerRequest":
      return "Create Locker";
    case "/cosmwasm.wasm.v1.MsgExecuteContract":
      return "Contract Executed";
    case "/comdex.locker.v1beta1.MsgDepositAssetRequest":
      return "Deposit Asset Request";
    case "/comdex.auction.v1beta1.MsgPlaceDutchBidRequest":
      return "Place Dutch Bid";
    case "/comdex.auction.v1beta1.MsgPlaceSurplusBidRequest":
      return "Place Surplus Bid";
    case "/comdex.auction.v1beta1.MsgPlaceDebtBidRequest":
      return "Place Debt Bid";
    case "/comdex.vault.v1beta1.MsgDepositAndDrawRequest":
      return "Deposit and Draw";
    default:
      return type;
  }
};

export const defaultFee = () => {
  return {
    amount: [{ denom: "ucmdx", amount: DEFAULT_FEE.toString() }],
    gas: "500000",
  };
};

const txSearchParams = (recipientAddress, pageNumber, pageSize, type) => {
  return {
    query: buildQuery({
      tags: [{ key: type, value: recipientAddress }],
    }),
    page: pageNumber,
    per_page: pageSize,
    prove: false,
    order_by: "desc",
  };
};

export const fetchTxHistory = (address, pageNumber, pageSize, callback) => {
  Tendermint34Client.connect(comdex.rpc)
    .then((tendermintClient) => {
      tendermintClient
        .txSearch(
          txSearchParams(address, pageNumber, pageSize, "message.sender")
        )
        .then((res) => {
          callback(null, res);
        })
        .catch((error) => {
          callback(error && error.message);
        });
    })
    .catch((error) => {
      callback(error && error.message);
    });
};

export const getTransactionTimeFromHeight = async (height) => {
  const tmClient = await Tendermint34Client.connect(comdex?.rpc);
  const block = await tmClient.block(height);

  return block?.block?.header?.time;
};
