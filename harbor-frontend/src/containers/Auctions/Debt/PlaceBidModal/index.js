import * as PropTypes from "prop-types";
import { Button, Modal, message } from "antd";
import { Row, Col } from "../../../../components/common";
import { connect } from "react-redux";
import React, { useState } from "react";
import { comdex } from "../../../../config/network";
import variables from "../../../../utils/variables";
import { defaultFee } from "../../../../services/transaction";
import { signAndBroadcastTransaction } from "../../../../services/helper";
import {
  amountConversionWithComma,
  denomConversion,
  getAmount,
  getDenomBalance,
} from "../../../../utils/coin";
import Snack from "../../../../components/common/Snack";
import { ValidateInputNumber } from "../../../../config/_validation";
import { toDecimals } from "../../../../utils/string";
import CustomInput from "../../../../components/CustomInput";
import Long from "long";
import { PRODUCT_ID } from "../../../../constants/common";
import "./index.scss";
import moment from "moment";
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
  const [bidAmount, setBidAmount] = useState();
  const [inProgress, setInProgress] = useState(false);
  const [validationError, setValidationError] = useState();

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
          typeUrl: "/comdex.auction.v1beta1.MsgPlaceDebtBidRequest",
          value: {
            bidder: address,
            auctionId: auction?.auctionId,
            bid: {
              denom: auction?.expectedMintedToken?.denom,
              amount: getAmount(bidAmount),
            },
            expectedUserToken: {
              denom: auction?.expectedUserToken?.denom,
              amount: auction?.expectedUserToken?.amount,
            },
            appId: Long.fromNumber(PRODUCT_ID),
            auctionMappingId: params?.debtId,
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
          message.error(error);
          return;
        }

        if (result?.code) {
          message.info(result?.rawLog);
          return;
        }

        refreshData();
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
        getAmount(value),
        getDenomBalance(balances, auction?.expectedMintedToken?.denom) || 0
      )
    );
    setBidAmount(value);
  };

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
              <p>Bid Expiration Time </p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                {moment(auction && auction.bidEndTime).format(
                  "MMM DD, YYYY HH:mm"
                )}
              </label>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>User payable amount </p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                {amountConversionWithComma(
                  auction?.expectedUserToken?.amount || 0
                )}{" "}
                {denomConversion(auction?.expectedUserToken?.denom)}
              </label>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Opening Bid </p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                {amountConversionWithComma(
                  auction?.auctionedToken?.amount || 0
                )}{" "}
                {denomConversion(auction?.auctionedToken?.denom)}
              </label>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Top Bid </p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                {amountConversionWithComma(
                  auction?.expectedMintedToken?.amount || 0
                )}{" "}
                {denomConversion(auction?.expectedMintedToken?.denom)}
              </label>
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Your Bid</p>
            </Col>
            <Col sm="6" className="text-right">
              <CustomInput
                value={bidAmount}
                onChange={(event) => handleChange(event.target.value)}
              />
            </Col>
          </Row>
          <Row>
            <Col sm="6">
              <p>Effective Bid Price</p>
            </Col>
            <Col sm="6" className="text-right">
              <label>
                {(
                  Number(auction?.expectedUserToken?.amount) /
                  Number(auction?.expectedMintedToken?.amount)
                ).toFixed(comdex.coinDecimals)}{" "}
                {`${denomConversion(
                  auction?.expectedUserToken?.denom
                )} / ${denomConversion(auction?.expectedMintedToken?.denom)}`}
              </label>
            </Col>
          </Row>
          <Row className="p-0">
            <Col className="text-center mt-3">
              <Button
                type="primary"
                className="btn-filled px-5"
                size="large"
                loading={inProgress}
                disabled={!Number(bidAmount)}
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
