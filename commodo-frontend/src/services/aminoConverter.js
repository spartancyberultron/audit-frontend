import Long from "long";

const omitDefault = (input) => {
  if (typeof input === "string") {
    return input === "" ? undefined : input;
  }

  if (typeof input === "number") {
    return input === 0 ? undefined : input;
  }

  if (Long.isLong(input)) {
    return input.isZero() ? undefined : input;
  }

  if(typeof input === "boolean"){
    return input;
  }

  throw new Error(`Got unsupported type '${typeof input}'`);
}

export const customAminoTypes = {
  "/comdex.lend.v1beta1.MsgLend": {
    aminoType: "comdex/lend/MsgLend",
    toAmino: ({ lender, assetId, poolId, appId, amount }) => {
      return {
        lender: lender,
        pool_id: String(poolId),
        asset_id: String(assetId),
        app_id: String(appId),
        amount: amount,
      };
    },
    fromAmino: ({ lender, pool_id, asset_id, app_id, amount }) => {
      return {
        lender: lender,
        assetId: Number(asset_id),
        poolId: Number(pool_id),
        appId: Number(app_id),
        amount: amount,
      };
    },
  },
  "/comdex.lend.v1beta1.MsgDeposit": {
    aminoType: "comdex/lend/MsgDeposit",
    toAmino: ({ lender, lendId, amount }) => {
      return {
        lender: lender,
        lend_id: String(lendId),
        amount: amount,
      };
    },
    fromAmino: ({ lender, lend_id, amount }) => {
      return {
        lender: lender,
        lendId: Number(lend_id),
        amount: amount,
      };
    },
  },
  "/comdex.lend.v1beta1.MsgWithdraw": {
    aminoType: "comdex/lend/MsgWithdraw",
    toAmino: ({ lender, lendId, amount }) => {
      return {
        lender: lender,
        lend_id: String(lendId),
        amount: amount,
      };
    },
    fromAmino: ({ lender, lend_id, amount }) => {
      return {
        lender: lender,
        lendId: Number(lend_id),
        amount: amount,
      };
    },
  },
  "/comdex.lend.v1beta1.MsgCloseLend": {
    aminoType: "comdex/lend/MsgCloseLend",
    toAmino: ({ lender, lendId }) => {
      return {
        lender: lender,
        lend_id: String(lendId),
      };
    },
    fromAmino: ({ lender, lend_id }) => {
      return {
        lender: lender,
        lendId: Number(lend_id),
      };
    },
  },
  "/comdex.lend.v1beta1.MsgBorrow": {
    aminoType: "comdex/lend/MsgBorrow",
    toAmino: ({
      borrower,
      lendId,
      pairId,
      isStableBorrow,
      amountIn,
      amountOut,
    }) => {
      return {
        borrower: borrower,
        lend_id: String(lendId),
        pair_id: String(pairId),
        is_stable_borrow: omitDefault(isStableBorrow)?.toString(),
        amount_in: amountIn,
        amount_out: amountOut,
      };
    },
    fromAmino: ({
      borrower,
      lend_id,
      pair_id,
      is_stable_borrow,
      amount_in,
      amount_out,
    }) => {
      return {
        borrower: borrower,
        lendId: Number(lend_id),
        pairId: Number(pair_id),
        isStableBorrow: is_stable_borrow,
        amountIn: amount_in,
        amountOut: amount_out,
      };
    },
  },
  "/comdex.lend.v1beta1.MsgRepay": {
    aminoType: "comdex/lend/MsgRepay",
    toAmino: ({ borrower, borrowId, amount }) => {
      return {
        borrower: borrower,
        borrow_id: String(borrowId),
        amount: amount,
      };
    },
    fromAmino: ({ borrower, borrow_id, amount }) => {
      return {
        borrower: borrower,
        borrowId: Number(borrow_id),
        amount: amount,
      };
    },
  },
  "/comdex.lend.v1beta1.MsgDepositBorrow": {
    aminoType: "comdex/lend/MsgDepositBorrow",
    toAmino: ({ borrower, borrowId, amount }) => {
      return {
        borrower: borrower,
        borrow_id: String(borrowId),
        amount: amount,
      };
    },
    fromAmino: ({ borrower, borrow_id, amount }) => {
      return {
        borrower: borrower,
        borrowId: Number(borrow_id),
        amount: amount,
      };
    },
  },
  "/comdex.lend.v1beta1.MsgDraw": {
    aminoType: "comdex/lend/MsgDraw",
    toAmino: ({ borrower, borrowId, amount }) => {
      return {
        borrower: borrower,
        borrow_id: String(borrowId),
        amount: amount,
      };
    },
    fromAmino: ({ borrower, borrow_id, amount }) => {
      return {
        borrower: borrower,
        borrowId: Number(borrow_id),
        amount: amount,
      };
    },
  },
  "/comdex.lend.v1beta1.MsgCloseBorrow": {
    aminoType: "comdex/lend/MsgCloseBorrow",
    toAmino: ({ borrower, borrowId }) => {
      return {
        borrower: borrower,
        borrow_id: String(borrowId),
      };
    },
    fromAmino: ({ borrower, borrow_id }) => {
      return {
        borrower: borrower,
        borrowId: Number(borrow_id),
      };
    },
  },
  "/comdex.lend.v1beta1.MsgBorrowAlternate": {
    aminoType: "comdex/lend/MsgBorrowAlternate",
    toAmino: ({
      lender,
      assetId,
      pairId,
      poolId,
      isStableBorrow,
      amountIn,
      amountOut,
      appId,
    }) => {
      return {
        lender: lender,
        asset_id: String(assetId),
        pool_id: String(poolId),
        app_id: String(appId),
        pair_id: String(pairId),
        is_stable_borrow: omitDefault(isStableBorrow)?.toString(),
        amount_in: amountIn,
        amount_out: amountOut,
      };
    },
    fromAmino: ({
      lender,
      asset_id,
      pool_id,
      pair_id,
      is_stable_borrow,
      amount_in,
      amount_out,
      app_id,
    }) => {
      return {
        lender: lender,
        assetId: Number(asset_id),
        poolId: Number(pool_id),
        pairId: Number(pair_id),
        appId: Number(app_id),
        isStableBorrow: is_stable_borrow,
        amountIn: amount_in,
        amountOut: amount_out,
      };
    },
  },
};
