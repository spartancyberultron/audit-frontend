import { Decimal } from "@cosmjs/math";
import { DOLLAR_DECIMALS } from "../constants/common";
import { denomToSymbol } from "./string";

export const formatNumber = (number) => {
  if (number >= 1000 && number < 1000000) {
    return (number / 1000).toFixed(DOLLAR_DECIMALS) + "K";
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(DOLLAR_DECIMALS) + "M";
  } else if (number < 1000) {
    return number;
  }
};

export const commaSeparator = (value) => {
  const array = value.toString().split(".");
  const stringWithComma = array[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (array[1]) {
    return stringWithComma.concat(".", array[1]);
  }

  return stringWithComma;
};

export const decimalConversion = (data) => {
  return Decimal.fromAtomics(data, 18).toString();
};

export const truncateToDecimals = (num, dec = 2) => {
  const calcDec = Math.pow(10, dec);
  return Math.trunc(num * calcDec) / calcDec;
}

export const marketPrice = (array, denom) => {
  const value = array.filter((item) => item.symbol === denomToSymbol(denom));

  if (denom === "ucmst") {
    return 1;
  }

  if (value && value[0]) {
    return value[0] && value[0].rates / 1000000;
  }

  return 0; 
};

export const calculateROI = (principal, interestRate, years, months, days) => {
  const earns = Number(principal) * (1 + (Number(interestRate) / 100)) ** (Number(years) + Number(months) / 12 + Number(days) / 365);

  return earns.toFixed(DOLLAR_DECIMALS)
}

export const getAccountNumber = (value) => {
  return value === "" ? "0" : value;
};

export const getPoolPrice = (
  oraclePrice,
  oracleAssetDenom,
  firstAsset,
  secondAsset
) => {
  let x = firstAsset?.amount,
    y = secondAsset?.amount,
    xPoolPrice,
    yPoolPrice;

  if (oracleAssetDenom === firstAsset?.denom) {
    yPoolPrice = (x / y) * oraclePrice;
    xPoolPrice = (y / x) * yPoolPrice;
  } else {
    xPoolPrice = (y / x) * oraclePrice;
    yPoolPrice = (x / y) * xPoolPrice;
  }

  return { xPoolPrice, yPoolPrice };
};