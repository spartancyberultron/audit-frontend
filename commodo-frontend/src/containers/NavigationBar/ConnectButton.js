import { Button, Dropdown, message } from "antd";
import { decode } from "js-base64";
import Lodash from "lodash";
import * as PropTypes from "prop-types";
import React, { useCallback, useEffect } from "react";
import { connect } from "react-redux";
import {
  setAccountAddress,
  setAccountBalances,
  setAccountName,
  setAccountVaults,
  setAssetBalance,
  setcAssetBalance,
  setCollateralBalance,
  setDebtBalance,
  setPoolBalance,
  showAccountConnectModal
} from "../../actions/account";
import { setAssets } from "../../actions/asset";
import { setAssetRatesStats } from "../../actions/lend";
import { setPoolPrice } from "../../actions/liquidity";
import { setMarkets } from "../../actions/oracle";
import { cmst, comdex, harbor } from "../../config/network";
import { CMST_POOL_ID_LIST, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, HARBOR_POOL_ID_LIST } from "../../constants/common";
import { queryAssets } from "../../services/asset/query";
import { queryAllBalances } from "../../services/bank/query";
import { fetchKeplrAccountName } from "../../services/keplr";
import { queryAssetRatesStats } from "../../services/lend/query";
import { queryPool } from "../../services/liquidity/query";
import { queryMarketList } from "../../services/oracle/query";
import {getPoolPrice, marketPrice } from "../../utils/number";
import variables from "../../utils/variables";
import DisConnectModal from "../DisConnectModal";
import ConnectModal from "../Modal";

const ConnectButton = ({
  setAccountAddress,
  address,
  setAccountBalances,
  lang,
  setAssetBalance,
  setcAssetBalance,
  markets,
  refreshBalance,
  setMarkets,
  setAccountName,
  setAssets,
  setAssetRatesStats,
  setPoolPrice,
}) => {
  useEffect(() => {
    const savedAddress = localStorage.getItem("ac");
    const userAddress = savedAddress ? decode(savedAddress) : address;

    fetchMarkets();

    if (userAddress) {
      setAccountAddress(userAddress);

      fetchKeplrAccountName().then((name) => {
        setAccountName(name);
      });

      fetchBalances(address);
    }
  }, [address, refreshBalance]);

  useEffect(() => {
    fetchBalances(
      address,
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );
  }, [markets]);
  ``;

  useEffect(() => {
    queryAssets(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false,
      (error, result) => {
        if (error) {
          message.error(error);
          return;
        }

        if (result?.assets?.length > 0) {
          setAssets(result?.assets);
        }
      }
    );

    queryAssetRatesStats((error, result) => {
      if (error) {
        message.error(error);
        return;
      }

      if (result?.AssetRatesStats?.length > 0) {
        setAssetRatesStats(result?.AssetRatesStats);
      }
    });
  }, []);

  const calculatePoolPrice = useCallback(
    (pool) => {
      if (pool?.id) {
        let firstAsset = pool?.balances[0];
        let secondAsset = pool?.balances[1];

        let oracleAsset = {};
        if (marketPrice(markets, firstAsset?.denom)) {
          oracleAsset = firstAsset;
        } else if (marketPrice(markets, secondAsset?.denom)) {
          oracleAsset = secondAsset;
        }

        if (oracleAsset?.denom) {
          let { xPoolPrice, yPoolPrice } = getPoolPrice(
            marketPrice(markets, oracleAsset?.denom),
            oracleAsset?.denom,
            firstAsset,
            secondAsset
          );

          setPoolPrice(firstAsset?.denom, xPoolPrice);
          setPoolPrice(secondAsset?.denom, yPoolPrice);
        }
      }
    },
    [markets, setPoolPrice]
  );

  useEffect(() => {
    const fetchListedPools = (list) => {
      if (list?.length > 0) {
        for (let i = 0; i < list?.length; i++) {
          queryPool(list[i], (error, result) => {
            if (error) {
              return;
            }

            calculatePoolPrice(result?.pool);
          });
        }
      }
    };

    fetchListedPools(HARBOR_POOL_ID_LIST);
    fetchListedPools(CMST_POOL_ID_LIST);
  }, [calculatePoolPrice]);

  const fetchBalances = (address) => {
    queryAllBalances(address, (error, result) => {
      if (error) {
        return;
      }

      setAccountBalances(result.balances, result.pagination);
      calculateAssetBalance(result.balances);
      calculatecAssetBalance(result.balances);
    });
  };

  const fetchMarkets = (offset, limit, isTotal, isReverse) => {
    queryMarketList(offset, limit, isTotal, isReverse, (error, result) => {
      if (error) {
        return;
      }

      setMarkets(result.markets, result.pagination);
    });
  };

  const calculatecAssetBalance = (balances) => {
    const cAssets = balances.filter(
      (item) =>
        item.denom.substr(0, 2) === "uc" && !(item.denom.substr(0, 3) === "ucm")
    );
    const value = cAssets.map((item) => {
      return marketPrice(markets, item.denom) * item.amount;
    });

    setcAssetBalance(Lodash.sum(value));
  };

  const getPrice = (denom) => {
    return marketPrice(markets, denom) || 0;
  };

  const calculateAssetBalance = (balances) => {
    const assetBalances = balances.filter(
      (item) =>
        item.denom.substr(0, 4) === "ibc/" ||
        item.denom === comdex.coinMinimalDenom ||
        item.denom === cmst.coinMinimalDenom ||
        item.denom === harbor.coinMinimalDenom
    );

    const value = assetBalances.map((item) => {
      return getPrice(item.denom) * item.amount;
    });

    setAssetBalance(Lodash.sum(value));
  };

  const WalletConnectedDropdown = <ConnectModal />;

  return (
    <>
      {address ? (
        <div className="connected_div">
          <DisConnectModal />
        </div>
      ) : (
        <div>
          <Dropdown
            overlay={WalletConnectedDropdown}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Button shape="round" type="primary" className="btn-filled">
              {variables[lang].connect_wallet}
            </Button>
          </Dropdown>
        </div>
      )}
    </>
  );
};

ConnectButton.propTypes = {
  lang: PropTypes.string.isRequired,
  refreshBalance: PropTypes.number.isRequired,
  setAssetRatesStats: PropTypes.func.isRequired,
  setAccountAddress: PropTypes.func.isRequired,
  showAccountConnectModal: PropTypes.func.isRequired,
  setAccountBalances: PropTypes.func.isRequired,
  setAccountName: PropTypes.func.isRequired,
  setAssetBalance: PropTypes.func.isRequired,
  setAccountVaults: PropTypes.func.isRequired,
  setcAssetBalance: PropTypes.func.isRequired,
  setCollateralBalance: PropTypes.func.isRequired,
  setDebtBalance: PropTypes.func.isRequired,
  setMarkets: PropTypes.func.isRequired,
  setPoolBalance: PropTypes.func.isRequired,
  setPoolPrice: PropTypes.func.isRequired,
  address: PropTypes.string,
  markets: PropTypes.arrayOf(
    PropTypes.shape({
      rates: PropTypes.shape({
        low: PropTypes.number,
      }),
    })
  ),
  show: PropTypes.bool,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    show: state.account.showModal,
    markets: state.oracle.market.list,
    refreshBalance: state.account.refreshBalance,
  };
};

const actionsToProps = {
  showAccountConnectModal,
  setAccountAddress,
  setAccountBalances,
  setPoolBalance,
  setcAssetBalance,
  setAssetBalance,
  setAccountVaults,
  setDebtBalance,
  setCollateralBalance,
  setMarkets,
  setAccountName,
  setAssets,
  setAssetRatesStats,
  setPoolPrice,
};

export default connect(stateToProps, actionsToProps)(ConnectButton);
