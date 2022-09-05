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
    case ibcDenoms["uusd"]:
      return "uust";
    case ibcDenoms["uluna"]:
      return "uluna";
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
    case "akt":
      return "uakt";
    case "dvpn":
      return "udvpn";
    case "harbor":
      return "uharbor";
    default:
      return "";
  }
};
export const denomToSymbol = (key) => {
  switch (key) {
    case "ucmst":
      return "CMST";
    case "uharbor":
      return "HARBOR";
    case "uatom":
    case ibcDenoms["uatom"]:
      return "ATOM";
    case "uosmo":
    case ibcDenoms["uosmo"]:
      return "OSMO";
    case "ucmdx":
      return "CMDX";
    default:
      return "";
  }
};

export const iconNameFromDenom = (key) => {
  switch (key) {
    case "ucgold":
      return "gold-icon";
    case "ucsilver":
      return "silver-icon";
    case "ucoil":
      return "crude-oil";
    case "uatom":
    case ibcDenoms["uatom"]:
      return "atom-icon";
    case "ucmdx":
      return "cmdx-icon";
    case "ucmst":
      return "cmst-icon";
    case "uharbor":
      return "harbor-icon";
    case "uosmo":
    case ibcDenoms["uosmo"]:
      return "osmosis-icon";
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

export const proposalStatusMap = {
  PROPOSAL_STATUS_UNSPECIFIED: "Nil",
  PROPOSAL_STATUS_DEPOSIT_PERIOD: "DepositPeriod",
  PROPOSAL_STATUS_VOTING_PERIOD: "VotingPeriod",
  PROPOSAL_STATUS_PASSED: "Passed",
  PROPOSAL_STATUS_REJECTED: "Rejected",
  PROPOSAL_STATUS_FAILED: "Failed",
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

export const ucDenomToDenom = (denom) => {
  return denom?.slice(0, 1) + denom?.slice(2); //example uccmdx => ucmdx
};
