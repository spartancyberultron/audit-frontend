import { comdex } from "../config/network";
import { commaSeparator } from "./number";
import { ibcDenomToDenom, lowercaseFirstLetter } from "./string";

export const getAmount = (selectedAmount) =>
  (selectedAmount * 10 ** comdex.coinDecimals).toFixed(0).toString();

export const amountConversionWithComma = (amount, decimals) => {
  const result = Number(amount) / 10 ** comdex.coinDecimals;

  return commaSeparator(result.toFixed(decimals || comdex.coinDecimals));
};

export const amountConversion = (amount, decimals) => {
  const result = Number(amount) / 10 ** comdex.coinDecimals;

  return result.toFixed(decimals || comdex.coinDecimals);
};

export const orderPriceConversion = (amount) => {
  const result = Number(amount) * 10 ** 18;
  return result.toFixed(0).toString();
};

export const orderPriceReverseConversion = (amount) => {
  const result = Number(amount) / (10 ** 18);
  return result.toFixed(comdex.coinDecimals).toString();
};

export const denomConversion = (denom) => {
  if (denom && denom.substr(0, 1) === "u") {
    if (
      denom &&
      denom.substr(0, 2) === "uc" &&
      !(denom.substr(0, 3) === "ucm")
    ) {
      return (
        denom.substr(1, denom.length) &&
        lowercaseFirstLetter(denom.substr(1, denom.length))
      );
    }
    return (
      denom.substr(1, denom.length) &&
      denom.substr(1, denom.length).toUpperCase()
    );
  } else {
    if (denom && denom.substr(0, 3) === "ibc") {
      const voucherDenom = ibcDenomToDenom(denom);

      return voucherDenom.substr(1, voucherDenom.length).toUpperCase();
    }

    return denom;
  }
};

export const getDenomBalance = (balances, denom) =>
  balances &&
  balances.length > 0 &&
  balances.find((item) => item.denom === denom) &&
  balances.find((item) => item.denom === denom).amount;
