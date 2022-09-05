import * as PropTypes from "prop-types";
import { Button, Modal, message } from "antd";
import { Row, Col } from "../../../../components/common";
import { connect } from "react-redux";
import React, { useEffect, useState } from "react";
import { comdex } from "../../../../config/network";
import variables from "../../../../utils/variables";
import { defaultFee } from "../../../../services/transaction";
import { signAndBroadcastTransaction } from "../../../../services/helper";
import {
  amountConversion,
  amountConversionWithComma,
  denomConversion,
  getAmount,
  orderPriceConversion,
} from "../../../../utils/coin";
import Snack from "../../../../components/common/Snack";
import { ValidateInputNumber } from "../../../../config/_validation";
import { toDecimals } from "../../../../utils/string";
import CustomInput from "../../../../components/CustomInput";
import Long from "long";
import { DOLLAR_DECIMALS, PRODUCT_ID } from "../../../../constants/common";
import "./index.scss";
import { commaSeparator, decimalConversion } from "../../../../utils/number";
import Timer from "../../../../components/Timer";

const PlaceBidModal = ({
  lang,
  address,
  auction,
  refreshData,
  params,
  balances,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [inProgress, setInProgress] = useState(false);
  const [validationError, setValidationError] = useState();
  const [maxPrice, setMaxPrice] = useState();
  const [maxValidationError, setMaxValidationError] = useState();
  const [calculatedQuantityBid, setCalculatedQuantityBid] = useState();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleClick = () => {
    setInProgress(true);

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: "/comdex.auction.v1beta1.MsgPlaceDutchBidRequest",
          value: {
            bidder: address,
            auctionId: auction?.auctionId,
            amount: {
              denom: auction?.outflowTokenInitAmount?.denom,
              amount: getAmount(Number(bidAmount / Number(
                amountConversion(
                  decimalConversion(auction?.outflowTokenCurrentPrice) || 0
                ) || 0
              ).toFixed(DOLLAR_DECIMALS)).toFixed(6)),
            },
            max: orderPriceConversion(maxPrice || 0),
            appId: Long.fromNumber(PRODUCT_ID),
            auctionMappingId: params?.dutchId,
          },
        },
        fee: defaultFee(),
        memo: "",
      },
      address,
      (error, result) => {
        setInProgress(false);
        setIsModalVisible(false);
        if (error) {
          setBidAmount(0);
          setMaxPrice(0);
          message.error(error);
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }

        refreshData();
        setBidAmount(0);
        setMaxPrice(0);
        message.success(
          <Snack
            message={variables[lang].tx_success}
            explorerUrlToTx={comdex.explorerUrlToTx}
            hash={result?.transactionHash}
          />
        );
      }
    );
  };

  const handleChange = (value) => {
    value = toDecimals(value).toString().trim();

    setValidationError(
      ValidateInputNumber(
        value,
        Number(amountConversion(auction?.inflowTokenTargetAmount?.amount) - amountConversion(auction?.inflowTokenCurrentAmount?.amount)).toFixed(6) || 0, "", "", "Bid must be less than target CMST"
      )
    );
    setBidAmount(value);
  };

  const handleMaxPriceChange = (value) => {
    value = toDecimals(value).toString().trim();

    setMaxValidationError(ValidateInputNumber(getAmount(value)));
    setMaxPrice(value);
  };

  const calculateQuantityBidFor = () => {

    let calculatedAmount = Number(bidAmount / Number(
      amountConversion(
        decimalConversion(auction?.outflowTokenCurrentPrice) || 0
      )
    )
    ).toFixed(6);
    setCalculatedQuantityBid(calculatedAmount);
  }
  useEffect(() => {
    calculateQuantityBidFor()
  }, [bidAmount, auction?.outflowTokenCurrentPrice])


  return (
    <>
      <Button type="primary" size="small" className="px-3" onClick={showModal}>
        {" "}
        Place Bid{" "}
      </Button>
      <Modal
        centered={true}
        className="palcebid-modal auction-placebid-modal"
        footer={null}
        header={null}
        visible={isModalVisible}
        width={550}
        closable={false}
        onOk={handleOk}
        onCancel={handleCancel}
        closeIcon={null}
      >
        <div className="palcebid-modal-inner">
          <Row>
            <Col sm="6">
              <p>Remaining Time </p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                <Timer expiryTimestamp={auction && auction.endTime} />
              </label>
            </Col>
          </Row>

          <Row>
            <Col sm="6">
              <p>Opening Auction Price</p>
            </Col>
            <Col sm="6" className="text-right">
              <label> $
                {commaSeparator(
                  Number(
                    amountConversionWithComma(
                      decimalConversion(auction?.outflowTokenInitialPrice) || 0, 4
                    ) || 0
                  )
                )}</label>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Current Auction Price</p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                $
                {commaSeparator(
                  Number(
                    amountConversionWithComma(
                      decimalConversion(auction?.outflowTokenCurrentPrice) || 0, 4
                    ) || 0
                  )
                )}
              </label>
            </Col>
          </Row>

          <Row>
            <Col sm="6">
              <p>Auctioned Quantity </p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                {amountConversionWithComma(
                  auction?.outflowTokenCurrentAmount?.amount || 0
                )} {denomConversion(auction?.outflowTokenCurrentAmount?.denom)}
              </label>
            </Col>
          </Row>

          <Row>
            <Col sm="6">
              <p> Target CMST</p>
            </Col>
            <Col sm="6" className="text-right">
              <label style={{ cursor: "pointer" }} onClick={() => {
                handleChange(Number(amountConversion(auction?.inflowTokenTargetAmount?.amount) - amountConversion(auction?.inflowTokenCurrentAmount?.amount)).toFixed(6) || 0)
              }}>
                {commaSeparator(
                  Number(amountConversion(auction?.inflowTokenTargetAmount?.amount) - amountConversion(auction?.inflowTokenCurrentAmount?.amount)).toFixed(6) || 0
                )} {denomConversion(auction?.inflowTokenCurrentAmount?.denom)}
              </label>
            </Col>
          </Row>

          <Row>
            <Col sm="6">
              <p>Quantity Bid For</p>
            </Col>
            <Col sm="6" className="text-right">
              <label >
                {calculatedQuantityBid}{" "}
                {denomConversion(auction?.outflowTokenCurrentAmount?.denom)}
              </label>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Your CMST Bid</p>
            </Col>
            <Col sm="6" className="text-right">
              <CustomInput
                value={bidAmount}
                onChange={(event) => handleChange(event.target.value)}
                validationError={validationError}
              />
              <label><div className="input-denom">{denomConversion(auction?.inflowTokenCurrentAmount?.denom)}</div></label>

            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Acceptable Max Price</p>
            </Col>
            <Col sm="6" className="text-right">
              <CustomInput
                value={maxPrice}
                onChange={(event) => handleMaxPriceChange(event.target.value)}
                validationError={maxValidationError}
              />
              <label><div className="input-denom">{denomConversion(auction?.inflowTokenTargetAmount?.denom)}/{denomConversion(auction?.outflowTokenCurrentAmount?.denom)}</div></label>
            </Col>
          </Row>
          <Row className="p-0">
            <Col className="text-center mt-3">
              <Button
                type="primary"
                className="btn-filled px-5"
                size="large"
                loading={inProgress}
                disabled={!Number(bidAmount) || !Number(maxPrice) || validationError?.message}
                onClick={handleClick}
              >
                Place Bid
              </Button>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  );
};

PlaceBidModal.propTypes = {
  refreshData: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  auction: PropTypes.shape({
    minBid: PropTypes.shape({
      amount: PropTypes.string,
      denom: PropTypes.string,
    }),
    bid: PropTypes.shape({
      amount: PropTypes.string,
      denom: PropTypes.string,
    }),
    id: PropTypes.shape({
      high: PropTypes.number,
      low: PropTypes.number,
      unsigned: PropTypes.bool,
    }),
  }),
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  bidAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  discount: PropTypes.shape({
    low: PropTypes.number,
  }),
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    bidAmount: state.auction.bidAmount,
    address: state.account.address,
    balances: state.account.balances.list,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(PlaceBidModal);
