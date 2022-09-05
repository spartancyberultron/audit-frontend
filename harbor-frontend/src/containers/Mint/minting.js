import * as PropTypes from "prop-types";
import { SvgIcon } from "../../components/common";
import { connect } from "react-redux";
import { message, Spin } from "antd";
import { useNavigate } from "react-router";
import "./index.scss";
import "./index.scss";
import { iconNameFromDenom, symbolToDenom } from "../../utils/string";
import TooltipIcon from "../../components/TooltipIcon";
import React, { useEffect, useState } from "react";
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, DOLLAR_DECIMALS, PRODUCT_ID } from "../../constants/common";
import { setPairs } from "../../actions/asset";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  setAllExtendedPair,
  setCurrentPairID,
  setSelectedExtentedPairvault,
} from "../../actions/locker";
import { amountConversionWithComma } from "../../utils/coin";
import NoData from "../../components/NoData";
import { queryExtendedPairVaultById, queryPair } from "../../services/asset/query";
import { decimalConversion } from "../../utils/number";
import { queryVaultMintedStatistic } from "../../services/vault/query";
import { Pagination } from 'antd';

const Minting = ({ address }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const extenedPairVaultList = useSelector(
    (state) => state.locker.extenedPairVaultList[0]
  );

  const [loading, setLoading] = useState(false);
  const [vaultDebt, setVaultDebt] = useState([])
  const [pairId, setpairId] = useState({})
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [pageSize, setPageSize] = useState(9);
  const [activePage, setActivePage] = useState(DEFAULT_PAGE_NUMBER)
  const [totalExtendedPair, setTotalExtendedPair] = useState()

  const navigateToMint = (path) => {
    navigate({
      pathname: `/vault/${path}`,
    });
  };

  useEffect(() => {
    fetchExtendexPairList((pageNumber - 1) * pageSize, pageSize, true, false, PRODUCT_ID)
  }, [address])

  useEffect(() => {
    if (extenedPairVaultList?.length > 0) {
      fetchVaultMintedTokenStatistic(PRODUCT_ID)
    }

  }, [address, extenedPairVaultList])

  const fetchExtendexPairList = (offset, limit, countTotal, reverse, productId) => {
    setLoading(true);
    queryExtendedPairVaultById(offset, limit, countTotal, reverse, productId, (error, data) => {
      setLoading(false);
      if (error) {
        message.error(error);
        return;
      }
      dispatch(setAllExtendedPair(data?.extendedPair));
      setTotalExtendedPair(data?.pagination?.total?.low)
    });
  };

  const fetchVaultMintedTokenStatistic = (productId) => {
    queryVaultMintedStatistic(productId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setVaultDebt((vaultDebt) => [...vaultDebt, data?.pairStatisticData])
    });
  };

  const getIconFromPairName = (extendexPairVaultPairName) => {
    let pairName = extendexPairVaultPairName;
    pairName = pairName?.replace(/\s+/g, ' ').trim()
    pairName = pairName?.slice(0, -2);
    pairName = pairName?.toLowerCase()
    return pairName;
  }

  const calculateGlobalDebt = (value) => {
    let matchData = vaultDebt[0]?.filter((debt) => debt?.extendedPairVaultId?.low === value?.id?.low)
    if (matchData[0] && amountConversionWithComma(matchData[0]?.mintedAmount)) {
      return amountConversionWithComma(matchData[0]?.mintedAmount, DOLLAR_DECIMALS);
    }
    return (0).toFixed(6)
  }

  useEffect(() => {
    setVaultDebt([])
    setpairId({});
  }, [])

  const handlePageChange = (currentPage, pageSize) => {
    setPageNumber(currentPage - 1);
    setPageSize(pageSize);
    setActivePage(currentPage)
    fetchExtendexPairList((currentPage - 1) * pageSize, pageSize, true, false, PRODUCT_ID);
  };

  if (loading) {
    return <Spin />;
  }


  return (
    <div className="app-content-wrapper vault-mint-main-container">
      <div className="card-main-container">
        {extenedPairVaultList?.length > 0 ? <h1 className="choose-vault">Choose Your Vault Type</h1> : ""}
        {extenedPairVaultList?.length > 0 ? (
          extenedPairVaultList?.map((item, index) => {
            if (
              item &&
              !item.isStableMintVault &&
              item.appId.low === PRODUCT_ID
            ) {
              return (
                <React.Fragment key={index}>
                  {item &&
                    (
                      <div
                        className="card-container "
                        onClick={() => {
                          dispatch(setCurrentPairID(item?.pairId?.low));
                          dispatch(setSelectedExtentedPairvault(item));
                          navigateToMint(item?.id?.low);
                        }}
                      >
                        <div className="up-container">
                          <div className="icon-container">
                            <SvgIcon name={iconNameFromDenom(symbolToDenom(getIconFromPairName(item?.pairName)))} />
                          </div>
                          <div className="vault-name-container">
                            <div className="vault-name">{item?.pairName}</div>
                            <div className="vault-desc" />
                          </div>
                        </div>
                        <div className="bottom-container">
                          <div className="contenet-container">
                            <div className="name">
                              Min. Collateralization Ratio{" "}
                              <TooltipIcon text="Minimum collateral ratio at which Composite should be minted" />
                            </div>
                            <div className="value">
                              {(decimalConversion(item?.minCr) * 100).toFixed(2)} %
                            </div>
                          </div>
                          <div className="contenet-container">
                            <div className="name">
                              Stability Fee <TooltipIcon text="Current Interest Rate on Borrowed Amount" />
                            </div>
                            <div className="value">
                              {(decimalConversion(item?.stabilityFee) * 100).toFixed(2)} %
                            </div>
                          </div>
                          <div className="contenet-container">
                            <div className="name">
                              Min. Borrow Amount <TooltipIcon text="Minimum Composite that should be borrowed for any active vault" />
                            </div>
                            <div className="value">
                              {" "}
                              {amountConversionWithComma(item?.debtFloor, DOLLAR_DECIMALS)} CMST
                            </div>
                          </div>
                          <div className="contenet-container">
                            <div className="name">
                              Debt Ceiling <TooltipIcon text="Maximum Composite that can be withdrawn per vault type" />
                            </div>
                            <div className="value">
                              {" "}
                              {amountConversionWithComma(item?.debtCeiling, DOLLAR_DECIMALS)} CMST
                            </div>
                          </div>

                          <div className="contenet-container">
                            <div className="name">
                              Vault’s Global Debt <TooltipIcon text="The total $CMST Debt of the protocol against this vault type" />
                            </div>
                            <div className="value">
                              {vaultDebt.length > 0
                                ?
                                calculateGlobalDebt(item)
                                :
                                "0.000000"
                              } CMST
                            </div>
                          </div>

                        </div>
                      </div>
                    )}
                </React.Fragment>
              );
            }
            else {
              return ""
            }
          })
        )
          : (
            <NoData />
          )}


      </div>
      {extenedPairVaultList?.length > 9 ? <div >
        <Pagination
          defaultCurrent={activePage}
          onChange={handlePageChange}
          total={totalExtendedPair &&
            totalExtendedPair}
          pageSize={pageSize}
        />
      </div> : ""}
    </div >
  );
};

Minting.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  setPairs: PropTypes.func.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    pairs: state.asset.pairs,
  };
};

const actionsToProps = {
  setPairs,
};

export default connect(stateToProps, actionsToProps)(Minting);
