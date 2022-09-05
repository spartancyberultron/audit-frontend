import { combineReducers } from "redux";
import account from "./account";
import asset from "./asset";
import auction from "./auction";
import dashboard from "./dashboard";
import farm from "./farm";
import language from "./language";
import ledger from "./ledger";
import lend from "./lend";
import liquidity from "./liquidity";
import oracle from "./oracle";
import swap from "./swap";
import theme from "./theme";

const app = combineReducers({
  language,
  account,
  asset,
  dashboard,
  farm,
  swap,
  lend,
  auction,
  theme,
  oracle,
  ledger,
  liquidity,
});

const root = (state, action) => {
  if (action.type === "ACCOUNT_ADDRESS_SET" && action.value === "") {
    state.account = undefined; //explicitly clearing account data
  }

  return app(state, action);
};

export default root;
