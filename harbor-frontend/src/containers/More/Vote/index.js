import React, { useEffect, useState } from 'react'
import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../../components/common";
import './index.scss';
import { connect } from "react-redux";
import { Button, message, Table } from "antd";
import { denomToSymbol, iconNameFromDenom } from "../../../utils/string";
import { commaSeparator, decimalConversion } from "../../../utils/number";
import TooltipIcon from "../../../components/TooltipIcon";
import { amountConversion, amountConversionWithComma } from '../../../utils/coin';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, DOLLAR_DECIMALS, PRODUCT_ID } from '../../../constants/common';
import { totalVTokens, votingCurrentProposal, votingCurrentProposalId, votingTotalBribs, votingTotalVotes, votingUserVote } from '../../../services/voteContractsRead';
import { queryAssets, queryPair, queryPairVault } from '../../../services/asset/query';
import { queryMintedTokenSpecificVaultType, queryOwnerVaults, queryOwnerVaultsInfo, queryUserVaults } from '../../../services/vault/query';
import { transactionForVotePairProposal } from '../../../services/voteContractsWrites';
import { setBalanceRefresh } from "../../../actions/account";

const Vote = ({
  address,
  refreshBalance,
  setBalanceRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [inProcess, setInProcess] = useState(false);
  const [proposalId, setProposalId] = useState();
  const [proposalExtenderPair, setProposalExtenderPair] = useState();
  const [btnLoading, setBtnLoading] = useState(0);
  const [pairVaultData, setPairValutData] = useState({})
  const [assetList, setAssetList] = useState();
  const [pairIdData, setPairIdData] = useState({});
  const [pairId, setPairId] = useState({});
  const [totalBorrowed, setTotalBorrowed] = useState({});
  const [vaultId, setVaultId] = useState({});
  const [myBorrowed, setMyBorrowed] = useState({});
  const [totalVote, settotalVotes] = useState({})
  const [myVote, setMyVote] = useState({})
  const [myExternalIncentive, setMyExternalIncentive] = useState({})
  const [totalVotingPower, setTotalVotingPower] = useState(0);

  // Query 
  const fetchVotingCurrentProposalId = () => {
    setLoading(true)
    votingCurrentProposalId(PRODUCT_ID).then((res) => {
      setProposalId(res)
      setLoading(false)
    }).catch((error) => {
      setLoading(false)
      console.log(error);
    })
  }

  const fetchVotingCurrentProposal = (proposalId) => {
    setLoading(true)
    votingCurrentProposal(proposalId).then((res) => {
      setProposalExtenderPair(res?.extended_pair)
      setLoading(false)
    }).catch((error) => {
      setLoading(false)
      console.log(error);
    })
  }

  const fetchVotingTotalVotes = (proposalId, extendedPairId) => {
    setLoading(true)
    votingTotalVotes(proposalId, extendedPairId).then((res) => {
      settotalVotes((prevState) => ({
        ...prevState,
        [extendedPairId]: res
      }))
      setLoading(false)
    }).catch((error) => {

      setLoading(false)
      console.log(error);
    })
  }

  const fetchVotingTotalBribs = (proposalId, extendedPairId) => {
    setLoading(true)
    votingTotalBribs(proposalId, extendedPairId).then((res) => {
      setMyExternalIncentive((prevState) => ({
        ...prevState, [extendedPairId]: res
      }))
      setLoading(false)
    }).catch((error) => {

      setLoading(false)
      console.log(error);
    })
  }

  const fetchVotingUserVote = (proposalId, address) => {
    setLoading(true)
    votingUserVote(proposalId, address).then((res) => {
      setMyVote((prevState) => ({
        [res?.extended_pair]: res?.vote_weight
      }))
      setLoading(false)
    }).catch((error) => {

      setLoading(false)
      console.log(error);
    })
  }

  const fetchAssets = (offset, limit, countTotal, reverse) => {
    queryAssets(offset, limit, countTotal, reverse, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setAssetList(data.assets)
    });
  };

  const fetchQueryPairValut = (extendedPairId) => {
    setLoading(true)
    queryPairVault(extendedPairId, (error, data) => {
      if (error) {
        message.error(error);
        setLoading(false)
        return;
      }
      setPairIdData((prevState) => ({
        ...prevState, [extendedPairId]: data?.pairVault?.pairId?.low
      }))
      setPairValutData((prevState) => ({
        ...prevState, [extendedPairId]: data?.pairVault?.pairName
      }))
      setLoading(false)
    })
  }

  const getAsssetIcon = (assetId) => {
    const selectedItem = assetList.length > 0 && assetList.filter((item) => (item?.id).toNumber() === assetId);
    return selectedItem[0]?.denom || ""
  }

  const getOwnerVaultId = (productId, address, extentedPairId) => {
    queryOwnerVaults(productId, address, extentedPairId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setVaultId((prevState) => ({
        ...prevState, [extentedPairId]: data?.vaultId?.low
      }))
    })
  }

  const getOwnerVaultInfoByVaultId = (ownerVaultId) => {
    queryOwnerVaultsInfo(ownerVaultId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setMyBorrowed((prevData) => ({
        ...prevData, [data?.vault?.extendedPairVaultId?.low]: data?.vault?.amountOut
      }))
    })
  }

  const fetchtotalBorrowed = (productId, extendedPairId) => {
    setLoading(true)
    queryMintedTokenSpecificVaultType(productId, extendedPairId, (error, data) => {
      if (error) {
        message.error(error);
        setLoading(false)
        return;
      }
      setTotalBorrowed((prevState) => ({
        ...prevState, [extendedPairId]: data?.tokenMinted
      }))
      setLoading(false)
    })
  }

  const fetchTotalVTokens = (address) => {
    setLoading(true)
    totalVTokens(address).then((res) => {
      setTotalVotingPower(res)
      setLoading(false)
    }).catch((error) => {
      setLoading(false)
      console.log(error);
    })
  }

  useEffect(() => {
    fetchVotingCurrentProposalId()
    if (proposalId) {
      fetchVotingCurrentProposal(proposalId)
    } else {
      setProposalExtenderPair("")
    }
  }, [address, proposalId, refreshBalance])

  const getPairFromExtendedPair = () => {
    proposalExtenderPair && proposalExtenderPair.map((item) => {
      fetchQueryPairValut(item)
      getOwnerVaultId(PRODUCT_ID, address, item)
      fetchtotalBorrowed(PRODUCT_ID, item)
      fetchVotingTotalVotes(proposalId, item)
      fetchVotingTotalBribs(proposalId, item)
    })
  }

  const fetchAssetIdFromPairID = (pairId, extendexPairId) => {
    setLoading(true)

    queryPair(pairId, (error, data) => {
      setLoading(false)
      if (error) {
        message.error(error);
        return;
      }
      setPairId((prevState) => ({
        ...prevState, [extendexPairId]: data?.pairInfo?.denomIn,

      }));

    });
  };

  const getAssetIdFrompairID = () => {
    let pairIdDataInArray = Object.values(pairIdData)
    if (pairIdDataInArray.length > 0) {
      pairIdDataInArray && pairIdDataInArray.map((item, index) => {
        fetchAssetIdFromPairID(item, proposalExtenderPair[index]);
      })
    }
  }

  useEffect(() => {
    getAssetIdFrompairID()
  }, [pairIdData])

  const handleVote = (item, index) => {
    setInProcess(true)
    setBtnLoading(index)
    if (address) {
      if (proposalId) {
        transactionForVotePairProposal(address, PRODUCT_ID, proposalId, item, (error, result) => {
          if (error) {
            message.error(error)
            setInProcess(false)
            return;
          }
          message.success("Success")
          setBalanceRefresh(refreshBalance + 1);
          setInProcess(false)
        })
      } else {
        setInProcess(false)
        message.error("Please enter amount")
      }
    }
    else {
      setInProcess(false)
      message.error("Please Connect Wallet")
    }
  }
  useEffect(() => {
    proposalExtenderPair && proposalExtenderPair.map((item) => {
      getOwnerVaultInfoByVaultId(vaultId[item])
    })
  }, [vaultId, refreshBalance])

  useEffect(() => {
    if (proposalId) {
      fetchVotingUserVote(proposalId, address)
    }
  }, [proposalId, refreshBalance])

  useEffect(() => {
    fetchTotalVTokens(address)
  }, [address, refreshBalance])

  useEffect(() => {
    fetchAssets(
      (DEFAULT_PAGE_NUMBER - 1) * DEFAULT_PAGE_SIZE,
      DEFAULT_PAGE_SIZE,
      true,
      false
    );
  }, [])

  useEffect(() => {
    getPairFromExtendedPair()
  }, [proposalExtenderPair, refreshBalance])

  const columns = [
    {
      title: (
        <>
          Vault Pair
        </>
      ),
      dataIndex: "asset",
      key: "asset",
      width: 150,
    },
    {
      title: (
        <>
          My Borrowed{" "}
        </>
      ),
      dataIndex: "my_borrowed",
      key: "my_borrowed",
      width: 150,
    },
    {
      title: (
        <>
          Total Borrowed
        </>
      ),
      dataIndex: "total_borrowed",
      key: "total_borrowed",
      width: 200,
    },
    {
      title: (
        <>
          Total Votes
        </>
      ),
      dataIndex: "total_votes",
      key: "total_votes",
      width: 230,
      render: (item) => <div >{totalVote[item] ? amountConversionWithComma(totalVote[item], DOLLAR_DECIMALS) : Number(0).toFixed(DOLLAR_DECIMALS)} veHARBOR</div>,
    },
    {
      title: (
        <>
          External Incentives
        </>
      ),
      dataIndex: "bribe",
      key: "bribe",
      width: 200,
      render: (item) => (
        <>
          {myExternalIncentive[item] ?
            myExternalIncentive && myExternalIncentive[item]?.map((singleBribe, index) => {
              return <div className="endtime-badge mt-1" key={index}>{amountConversionWithComma(singleBribe?.amount, DOLLAR_DECIMALS)} {denomToSymbol(singleBribe?.denom)}</div>
            })
            : <div className="endtime-badge mt-1" >{"       "}</div>

          }

        </>
      ),
    },
    {
      title: (
        <>
          My Vote
        </>
      ),
      dataIndex: "my_vote",
      key: "my_vote",
      align: "center",
      width: 100,
      render: (item) => (
        <>
          <div>{myVote[item] ? amountConversion(myVote[item], DOLLAR_DECIMALS) : Number(0).toFixed(DOLLAR_DECIMALS)} veHARBOR</div>
        </>
      ),

    },
    {
      title: (
        <>
          Action
        </>
      ),
      dataIndex: "action",
      key: "action",
      align: "centre",
      width: 130,
    },
  ];

  const tableData =
    proposalExtenderPair && proposalExtenderPair.map((item, index) => {
      return {
        key: index,
        asset: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon
                  name={iconNameFromDenom(
                    pairId[item]
                  )}
                />
              </div>
              {pairVaultData[item]}
            </div>
          </>
        ),
        my_borrowed: (
          <>
            <div className="assets-withicon display-center">
              {myBorrowed[item] ? amountConversionWithComma(myBorrowed[item], DOLLAR_DECIMALS) : Number(0).toFixed(2)}
              {" "}{denomToSymbol("ucmst")}
            </div>
          </>
        ),
        total_borrowed:
          <div>
            {totalBorrowed[item] ? amountConversionWithComma(
              totalBorrowed[item], DOLLAR_DECIMALS
            ) : Number(0).toFixed(2)} {denomToSymbol("ucmst")}
          </div>,
        total_votes: item,
        bribe: item,
        my_vote: item,
        action: <>
          <Button
            type="primary"
            className="btn-filled"
            size="sm"
            loading={index === btnLoading ? inProcess : false}
            onClick={() => handleVote(item, index)}
          >
            Vote
          </Button>
        </>,
      }
    })




  return (
    <>
      <div className="app-content-wrapper">
        <Row>
          <Col>
            <div className="totol-voting-main-container">
              <div className="total-voting-container">
                <div className="total-veHARBOR">
                  My Voting Power : <span className='fill-box'><span>{amountConversionWithComma(totalVotingPower, DOLLAR_DECIMALS)}</span> veHARBOR</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="composite-card py-3">
              <div className="card-content">
                <Table
                  className="custom-table liquidation-table"
                  dataSource={tableData}
                  columns={columns}
                  loading={loading}
                  scroll={{ x: "100%" }}
                />
              </div>
            </div>

          </Col>
        </Row>
      </div>

    </>
  )
}

Vote.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string,
  refreshBalance: PropTypes.number.isRequired,
};
const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    refreshBalance: state.account.refreshBalance,
  };
};
const actionsToProps = {
  setBalanceRefresh,
};
export default connect(stateToProps, actionsToProps)(Vote);