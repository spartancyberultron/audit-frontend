import { amountConversion } from "../utils/coin";

export const ValidateInputNumber = (value, max, key, debtFloor, errorMsg) => {
  if (value > 0 && value < debtFloor) {
    return new Error("Input should be grater than min. borrow amt.");
  }

  if (value < 0) {
    return new Error("Input must be positive number");
  }

  if (max === 0) {
    return new Error("No available balance");
  }

  if (max && Number(max) < value) {
    return new Error(errorMsg || "Insufficient funds");
  }

  if (key === "macro" && value !== 0 && amountConversion(value) <= 0.0001) {
    return new Error("Input amount should be over 100 micro");
  }
  if (key === "whole" && !Number.isInteger(Number(value))) {
    return new Error("Input must be a whole number");
  }
  return new Error("");
};
