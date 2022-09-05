import { sha256, stringToPath } from "@cosmjs/crypto";
import { comdex, ibcDenoms } from "../config/network";

const encoding = require("@cosmjs/encoding");

export const decode = (hash) =>
  decodeURIComponent(hash.replace("#", "")) || undefined;

export const generateHash = (txBytes) =>
  encoding.toHex(sha256(txBytes)).toUpperCase();

export const ibcDenomToDenom = (key) => {
  switch (key) {
    case ibcDenoms["uatom"]:
      return "uatom";
    case ibcDenoms["uosmo"]:
      return "uosmo";
    default:
      return "";
  }
};

export const denomToSymbol = (key) => {
  switch (key) {
    case "uatom":
    case ibcDenoms["uatom"]:
      return "ATOM";
    case "udvpn":
      return "DVPN";
    case "uosmo":
    case ibcDenoms["uosmo"]:
      return "OSMO";
    case "ucmdx":
      return "CMDX";
    case "ucgold":
      return "XAU";
    case "ucsilver":
      return "XAG";
    case "ucoil":
      return "OIL";
    default:
      return "cosmos";
  }
};

export const minimalDenomToDenom = (key) => {
  switch (key) {
    case "uatom":
    case ibcDenoms["uatom"]:
      return "atom";
    case "udvpn":
      return "dvpn";
    case "uosmo":
    case ibcDenoms["uosmo"]:
      return "osmo";
    case "ucmdx":
      return "cmdx";
    default:
      return "";
  }
};

const iconMap = {
  ucgold: "gold-icon",
  ucsilver: "silver-icon",
  ucoil: "crude-oil",
  uatom: "atom-icon",
  [ibcDenoms["uatom"]]: "atom-icon",
  ucmdx: "comdex-icon",
  uosmo: "osmosis-icon",
  [ibcDenoms["uosmo"]]: "osmosis-icon",
  ucmst: "cmst-icon",
  uharbor: "harbor-icon",
};

export const iconNameFromDenom = (denom) => {
  return iconMap[denom];
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

export const proposalStatusMap = {
  PROPOSAL_STATUS_UNSPECIFIED: "Nil",
  PROPOSAL_STATUS_DEPOSIT_PERIOD: "DepositPeriod",
  PROPOSAL_STATUS_VOTING_PERIOD: "VotingPeriod",
  PROPOSAL_STATUS_PASSED: "Passed",
  PROPOSAL_STATUS_REJECTED: "Rejected",
  PROPOSAL_STATUS_FAILED: "Failed",
};
