import { Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes } from "@cosmjs/stargate";
import { MsgPlaceDutchLendBidRequest } from 'comdex-codec/build/comdex/auction/v1beta1/tx';
import {
  MsgBorrow, MsgBorrowAlternate, MsgCloseBorrow, MsgCloseLend, MsgDeposit, MsgDepositBorrow,
  MsgDraw, MsgLend, MsgRepay, MsgWithdraw
} from "comdex-codec/build/comdex/lend/v1beta1/tx";
import { MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";


export const myRegistry = new Registry([
  ...defaultRegistryTypes,
  ["/comdex.lend.v1beta1.MsgLend", MsgLend],
  ["/comdex.lend.v1beta1.MsgDeposit", MsgDeposit],
  ["/comdex.lend.v1beta1.MsgWithdraw", MsgWithdraw],
  ["/comdex.lend.v1beta1.MsgCloseLend", MsgCloseLend],
  ["/comdex.lend.v1beta1.MsgBorrow", MsgBorrow],
  ["/comdex.lend.v1beta1.MsgRepay", MsgRepay],
  ["/comdex.lend.v1beta1.MsgDepositBorrow", MsgDepositBorrow],
  ["/comdex.lend.v1beta1.MsgDraw", MsgDraw],
  ["/comdex.lend.v1beta1.MsgCloseBorrow", MsgCloseBorrow],
  ["/cosmos.gov.v1beta1.MsgVote", MsgVote],
  ["/comdex.auction.v1beta1.MsgPlaceDutchLendBidRequest", MsgPlaceDutchLendBidRequest],
  ["/comdex.lend.v1beta1.MsgBorrowAlternate", MsgBorrowAlternate],
]);
