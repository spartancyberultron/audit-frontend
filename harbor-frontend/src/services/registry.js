import { MsgCreateLockerRequest, MsgDepositAssetRequest, MsgWithdrawAssetRequest, MsgCloseLockerRequest, MsgLockerRewardCalcRequest } from 'comdex-codec/build/comdex/locker/v1beta1/tx';
import { MsgCreateRequest, MsgDepositRequest, MsgWithdrawRequest, MsgDrawRequest, MsgRepayRequest, MsgCloseRequest, MsgDepositAndDrawRequest, MsgVaultInterestCalcRequest } from 'comdex-codec/build/comdex/vault/v1beta1/tx'

import { MsgPlaceDutchBidRequest, MsgPlaceSurplusBidRequest, MsgPlaceDebtBidRequest } from 'comdex-codec/build/comdex/auction/v1beta1/tx';

import { Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes } from "@cosmjs/stargate";

export const myRegistry = new Registry([
  ...defaultRegistryTypes,
  ["/comdex.locker.v1beta1.MsgCreateLockerRequest", MsgCreateLockerRequest],
  ["/comdex.locker.v1beta1.MsgDepositAssetRequest", MsgDepositAssetRequest],
  ["/comdex.locker.v1beta1.MsgWithdrawAssetRequest", MsgWithdrawAssetRequest],
  ["/comdex.locker.v1beta1.MsgCloseLockerRequest", MsgCloseLockerRequest],
  ["/comdex.locker.v1beta1.MsgLockerRewardCalcRequest", MsgLockerRewardCalcRequest],
  ["/comdex.vault.v1beta1.MsgCreateRequest", MsgCreateRequest],
  ["/comdex.vault.v1beta1.MsgDepositRequest", MsgDepositRequest],
  ["/comdex.vault.v1beta1.MsgWithdrawRequest", MsgWithdrawRequest],
  ["/comdex.vault.v1beta1.MsgDrawRequest", MsgDrawRequest],
  ["/comdex.vault.v1beta1.MsgRepayRequest", MsgRepayRequest],
  ["/comdex.vault.v1beta1.MsgCloseRequest", MsgCloseRequest],
  ["/comdex.vault.v1beta1.MsgDepositAndDrawRequest", MsgDepositAndDrawRequest],
  ["/comdex.vault.v1beta1.MsgVaultInterestCalcRequest", MsgVaultInterestCalcRequest],
  ["/comdex.auction.v1beta1.MsgPlaceSurplusBidRequest", MsgPlaceSurplusBidRequest],
  ["/comdex.auction.v1beta1.MsgPlaceDebtBidRequest", MsgPlaceDebtBidRequest],
  ["/comdex.auction.v1beta1.MsgPlaceDutchBidRequest", MsgPlaceDutchBidRequest],

]);


