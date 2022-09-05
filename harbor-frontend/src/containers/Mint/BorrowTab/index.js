import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  setPair,
  setAssetIn,
  setAssetOut,
  setAmountIn,
  setAmountOut,
  setCollateralRatio,
} from "../../../actions/asset";
import { setComplete } from "../../../actions/swap";
import { setVault } from "../../../actions/account";
import BorrowTab from "./Tab";

BorrowTab.propTypes = {
  lang: PropTypes.string.isRequired,
  setAmountIn: PropTypes.func.isRequired,
  setAmountOut: PropTypes.func.isRequired,
  setAssetIn: PropTypes.func.isRequired,
  setAssetOut: PropTypes.func.isRequired,
  setCollateralRatio: PropTypes.func.isRequired,
  setComplete: PropTypes.func.isRequired,
  setPair: PropTypes.func.isRequired,
  setVault: PropTypes.func.isRequired,
  address: PropTypes.string,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  collateralRatio: PropTypes.number,
  inAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  markets: PropTypes.arrayOf(
    PropTypes.shape({
      rates: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
      symbol: PropTypes.string,
      script_id: PropTypes.string,
    })
  ),
  outAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pair: PropTypes.shape({
    denomIn: PropTypes.string,
    denomOut: PropTypes.string,
  }),
  pairs: PropTypes.shape({
    list: PropTypes.arrayOf(
      PropTypes.shape({
        denomIn: PropTypes.string,
        denomOut: PropTypes.string,
        liquidationRatio: PropTypes.string,
        id: PropTypes.shape({
          high: PropTypes.number,
          low: PropTypes.number,
          unsigned: PropTypes.bool,
        }),
      })
    ),
  }),
  refreshBalance: PropTypes.number.isRequired,
  vault: PropTypes.shape({
    collateral: PropTypes.shape({
      denom: PropTypes.string,
    }),
    debt: PropTypes.shape({
      denom: PropTypes.string,
    }),
    id: PropTypes.shape({
      low: PropTypes.number,
    }),
  }),
  vaults: PropTypes.arrayOf(
    PropTypes.shape({
      collateral: PropTypes.shape({
        amount: PropTypes.string,
        denom: PropTypes.string,
      }),
      debt: PropTypes.shape({
        amount: PropTypes.string,
        denom: PropTypes.string,
      }),
      id: PropTypes.shape({
        high: PropTypes.number,
        low: PropTypes.number,
        unsigned: PropTypes.bool,
      }),
    })
  ),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    pair: state.asset.pair,
    pairs: state.asset.pairs,
    inAmount: state.asset.inAmount,
    outAmount: state.asset.outAmount,
    markets: state.oracle.market.list,
    collateralRatio: state.asset.collateralRatio,
    balances: state.account.balances.list,
    vaults: state.account.vaults.list,
    vault: state.account.vault,
    refreshBalance: state.account.refreshBalance,
  };
};

const actionToProps = {
  setPair,
  setVault,
  setComplete,
  setAssetIn,
  setAssetOut,
  setAmountIn,
  setAmountOut,
  setCollateralRatio,
};

export default connect(stateToProps, actionToProps)(BorrowTab);
