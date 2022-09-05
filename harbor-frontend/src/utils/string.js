import { comdex } from "../config/network";
import { denomConversion } from "./coin";
import { calculatePoolShare } from "./calculations";
import { ibcDenoms } from "../config/network";
import { sha256, stringToPath } from "@cosmjs/crypto";

const encoding = require("@cosmjs/encoding");

export const decode = (hash) =>
  decodeURIComponent(hash.replace("#", "")) || undefined;

export const generateHash = (txBytes) =>
  encoding.toHex(sha256(txBytes)).toUpperCase();

export const ibcDenomToDenom = (key) => {
  switch (key) {
    case ibcDenoms["uatom"]:
      return "uatom";
    case ibcDenoms["uusd"]:
      return "uust";
    case ibcDenoms["uluna"]:
      return "uluna";
    case ibcDenoms["uxprt"]:
      return "uxprt";
    case ibcDenoms["uosmo"]:
      return "uosmo";
    default:
      return "";
  }
};

export const symbolToDenom = (key) => {
  switch (key) {
    case "atom":
    case ibcDenoms["atom"]:
      return "uatom";
    case "xprt":
    case ibcDenoms["xprt"]:
      return "uxprt";
    case "osmo":
    case ibcDenoms["osmo"]:
      return "uosmo";
    case "cmdx":
      return "ucmdx";
    case "cmst":
      return "ucmst";
    case "harbor":
      return "uharbor";
    default:
      return "";
  }
};

export const denomToSymbol = (key) => {
  switch (key) {
    case "uatom":
    case ibcDenoms["uatom"]:
      return "ATOM";
    case "uosmo":
    case ibcDenoms["uosmo"]:
      return "OSMO";
    case "ucmdx":
      return "CMDX";
    case "ucmst":
      return "CMST";
    case "uharbor":
      return "HARBOR";
    default:
      return "CMDX";
  }
};

export const iconNameFromDenom = (key) => {
  switch (key) {
    case "uatom":
    case ibcDenoms["uatom"]:
      return "atom-icon";
    case "ucmdx":
      return "comdex-icon";
    case "uxprt":
      return "xprt-icon";
    case "uosmo":
    case ibcDenoms["uosmo"]:
      return "osmosis-icon";
    case "ucmst":
      return "cmst-icon";
    case "uharbor":
      return "harbor-icon";
    default:
      return "";
  }
};

export const orderStatusText = (key) => {
  switch (key) {
    case 0:
      return "UNSPECIFIED";
    case 1:
      return "NOT EXECUTED";
    case 2:
      return "NOT MATCHED";
    case 3:
      return "PARTIALLY MATCHED";
    case 4:
      return "COMPLETED";
    case 5:
      return "CANCELED";
    case 6:
      return "EXPIRED";
    default:
      return "";
  }
};

export const trimWhiteSpaces = (data) => data.split(" ").join("");

export const truncateString = (string, front, back) =>
  `${string.substr(0, front)}...${string.substr(
    string.length - back,
    string.length
  )}`;

export const lowercaseFirstLetter = (string) => {
  return string.charAt(0).toLowerCase() + string.slice(1).toUpperCase();
};

//Considering input with given decimal point only.
export const toDecimals = (value, decimal = comdex.coinDecimals) =>
  value.indexOf(".") >= 0
    ? value.substr(0, value.indexOf(".")) +
    value.substr(value.indexOf("."), decimal + 1)
    : value;

export const showTotalAssetCount = (asset) => {
  return `${(asset && calculatePoolShare(asset)) || 0} ${denomConversion(
    asset?.denom || ""
  )}`;
};

export const showUserAssetCount = (assetShare, denom) => {
  return `${assetShare} ${denomConversion(denom) || ""}`;
};

export const uniqueDenoms = (list, type) => {
  return [
    ...new Set(
      list && list.length > 0
        ? list.map((item) => (type === "in" ? item.denomIn : item.denomOut))
        : []
    ),
  ];
};

export const uniqueLiquidityPairDenoms = (list, type) => {
  return [
    ...new Set(
      list && list.length > 0
        ? list.map((item) =>
          type === "in" ? item.baseCoinDenom : item.quoteCoinDenom
        )
        : []
    ),
  ];
};

export const uniqueQuoteDenomsForBase = (list, type, denom) => {
  const quoteList =
    list && list.length > 0
      ? list.filter((item) =>
        type === "in"
          ? item.baseCoinDenom === denom
          : item.quoteCoinDenom === denom
      )
      : [];

  const quoteMap = quoteList.map((item) =>
    type === "in" ? item.quoteCoinDenom : item.baseCoinDenom
  );

  return [...new Set(quoteMap)];
};

export const makeHdPath = (
  accountNumber = "0",
  addressIndex = "0",
  coinType = comdex.coinType
) => {
  return stringToPath(
    "m/44'/" + coinType + "'/" + accountNumber + "'/0/" + addressIndex
  );
};