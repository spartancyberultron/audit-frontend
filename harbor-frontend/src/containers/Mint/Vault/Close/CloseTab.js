import * as PropTypes from "prop-types";
import { connect, useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import variables from "../../../../utils/variables";
import { Button, message } from "antd";
import TooltipIcon from "../../../../components/TooltipIcon";
import { getDenomBalance } from "../../../../utils/coin";
import { amountConversion } from "../../../../utils/coin";
import { signAndBroadcastTransaction } from "../../../../services/helper";
import { defaultFee } from "../../../../services/transaction";
import { useNavigate, useParams } from "react-router";
import { setVault } from "../../../../actions/account";
import { setBalanceRefresh } from "../../../../actions/account";
import { PRODUCT_ID } from "../../../../constants/common";
import "./index.scss";
import { denomToSymbol } from "../../../../utils/string";
import { queryOwnerVaults, queryOwnerVaultsInfo } from "../../../../services/vault/query";
import Long from "long";
import { setExtendedPairVaultListData, setOwnerVaultId, setOwnerVaultInfo } from "../../../../actions/locker";
import { queryPairVault } from "../../../../services/asset/query";

const CloseTab = ({
  lang,
  address,
  vault,
  setVault,
  refreshBalance,
  setBalanceRefresh,
  balances,
  ownerVaultId,
  ownerVaultInfo,
  setOwnerVaultId,
  setOwnerVaultInfo,
}) => {
  const dispatch = useDispatch();
  const { pathVaultId } = useParams();

  const selectedExtentedPairVault = useSelector((state) => state.locker.selectedExtentedPairVault);
  const selectedExtentedPairVaultListData = useSelector((state) => state.locker.extenedPairVaultListData);
  const [inProgress, setInProgress] = useState(false);
  const navigate = useNavigate();

  const returnDenom = () => {
    let assetPair = selectedExtentedPairVault && selectedExtentedPairVault[0]?.pairName;

    switch (assetPair) {
      case "cmdx-cmst":
        return "ucmdx";
      case "osmo-cmst":
        return "uosmo";
      default:
        return "ucmdx";
    }
  }


  useEffect(() => {
    fetchQueryPairValut(pathVaultId)
  }, [address])

  useEffect(() => {
    if (address && selectedExtentedPairVaultListData[0]?.id?.low) {
      getOwnerVaultId(PRODUCT_ID, address, selectedExtentedPairVaultListData[0]?.id?.low);
    }
    else {
      setOwnerVaultId("")
    }
  }, [address, vault])

  useEffect(() => {
    if (ownerVaultId) {
      getOwnerVaultInfoByVaultId(ownerVaultId)
    }
    else {
      setOwnerVaultInfo('');
    }
  }, [address, ownerVaultId])


  // ******* Get Vault Query *********

  // *----------Get the owner vaultId by productId, pairId , and address----------

  const getOwnerVaultId = (productId, address, extentedPairId) => {
    queryOwnerVaults(productId, address, extentedPairId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setOwnerVaultId(data?.vaultId?.low)
    })
  }

  // *----------Get pair vault data by extended pairVault Id----------
  const fetchQueryPairValut = (pairVaultId) => {
    queryPairVault(pairVaultId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }

      dispatch(setExtendedPairVaultListData(data?.pairVault))
    })
  }

  // *----------Get the owner vaultDetails by ownervaultId----------

  const getOwnerVaultInfoByVaultId = (ownerVaultId) => {
    queryOwnerVaultsInfo(ownerVaultId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setOwnerVaultInfo(data.vault)
    })
  }

  const handleClick = () => {
    setInProgress(true);

    if (
      Number(getDenomBalance(balances, vault?.debt?.denom)) <
      Number(vault?.debt?.amount)
    ) {
      message.info("Insufficient funds");
      setInProgress(false);
      return;
    }

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.vault.v1beta1.MsgCloseRequest",
          value: {
            from: address,
            appId: Long.fromNumber(PRODUCT_ID),
            extendedPairVaultId: Long.fromNumber(selectedExtentedPairVaultListData[0]?.id?.low),
            userVaultId: ownerVaultId,
          },
        },
        fee: defaultFee(),
        memo: "",
      },
      address,
      (error, result) => {
        setInProgress(false);
        if (error) {
          message.error(error);
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }

        setVault({}); // clearing local vault as it is closed.
        setBalanceRefresh(refreshBalance + 1);
        message.success("success");
        navigate("/mint")
      }
    );
  };

  return (
    <div className="borrw-content-card ">
      <div className="close-tab-content">
        <div className="close-tab-row">
          <div className="text-left">
            CMST Payable{" "}
            <TooltipIcon text="CMST to be repaid" />
          </div>
          <div className="text-right">
            {amountConversion(ownerVaultInfo?.amountOut || 0)} CMST
          </div>
        </div>
        <div className="close-tab-row">
          <div className="text-left">
            Collateral Receivable{" "}
            <TooltipIcon text="Collateral to be received" />
          </div>
          <div className="text-right">
            {amountConversion(ownerVaultInfo?.amountIn || 0)} {denomToSymbol(returnDenom())}
          </div>
        </div>
      </div>
      <div className="assets-form-btn">
        <Button
          loading={inProgress}
          disabled={inProgress}
          type="primary"
          onClick={() => handleClick()}
          className="btn-filled"
        >
          {variables[lang].close}
        </Button>
      </div>
    </div>
  );
};

CloseTab.propTypes = {
  lang: PropTypes.string.isRequired,
  setBalanceRefresh: PropTypes.func.isRequired,
  setVault: PropTypes.func.isRequired,
  address: PropTypes.string,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
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
  ownerVaultId: PropTypes.number,
  ownerVaultInfo: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    vault: state.account.vault,
    markets: state.oracle.market.list,
    refreshBalance: state.account.refreshBalance,
    balances: state.account.balances.list,
    ownerVaultId: state.locker.ownerVaultId,
    ownerVaultInfo: state.locker.ownerVaultInfo
  };
};

const actionsToProps = {
  setVault,
  setBalanceRefresh,
  setOwnerVaultId,
  setOwnerVaultInfo,
};

export default connect(stateToProps, actionsToProps)(CloseTab);

// panic message redacted to hide potentially sensitive system info: panic