import { Button, Dropdown, Modal } from "antd";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { connect } from "react-redux";
import {
  setAccountAddress,
  showAccountConnectModal
} from "../../actions/account";
import { SvgIcon } from "../../components/common";
import Copy from "../../components/Copy";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { amountConversionWithComma } from "../../utils/coin";
import { truncateString } from "../../utils/string";
import variables from "../../utils/variables";

const DisConnectModal = ({
  setAccountAddress,
  lang,
  address,
  assetBalance,
  name,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDisconnect = () => {
    setAccountAddress("");
    localStorage.removeItem("ac");
    localStorage.removeItem("loginType");
    window.location.reload();
  };

  const getTotalValue = () => {
    return assetBalance;
  };

  const WalletConnectedDropdown = (
    <div className="wallet-connect-dropdown">
      <div className="wallet-connect-upper">
        <span />
        <div>
          {localStorage.getItem("loginType") === "ledger"
            ? "native-ledger"
            : name}
        </div>
      </div>
      <div className="px-3">
        <div> {variables[lang].balance_wallet}</div>
        <div className="balance__value__data">
          {amountConversionWithComma(getTotalValue(), DOLLAR_DECIMALS)}{" "}
          CMST
        </div>
      </div>
      <div className="mt-2 px-3">
        <div>{variables[lang].address_wallet} </div>
        <div className="wallet-address">
          <div className="address-wallet-address d-flex">
            <span className="mr-3"> {truncateString(address, 6, 6)} </span>{" "}
            <Copy text={address} />
          </div>
        </div>
      </div>
      <div className="mb-2 mt-3">
        <Button
          type="primary"
          onClick={showModal}
          className="btn-filled"
          block
          size="medium"
        >
          {variables[lang].disconnect}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Dropdown overlay={WalletConnectedDropdown} trigger={["click"]}>
        <div className="connected_button">
          {" "}
          <SvgIcon name="wallet" /> {truncateString(address, 6, 6)}
        </div>
      </Dropdown>
      <Modal
        centered={true}
        className="connect-modal"
        footer={null}
        header={null}
        visible={isModalVisible}
        width={550}
        onCancel={handleCancel}
        onOk={handleOk}
        closeIcon={<SvgIcon name="close" viewbox="0 0 19 19" />}
      >
        <div className="d-flex flex-wrap flex-column">
          <h2> {variables[lang].disconnect_wallet}</h2>
          <div className="d-flex">
            <Button
              type="primary"
              className="btn-filled mx-3"
              size="large"
              onClick={handleCancel}
              block
            >
              {" "}
              {variables[lang].no}
            </Button>
            <Button
              type="primary"
              className="mx-3"
              size="large"
              onClick={handleDisconnect}
              block
            >
              {" "}
              {variables[lang].yes}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

DisConnectModal.propTypes = {
  lang: PropTypes.string.isRequired,
  setAccountAddress: PropTypes.func.isRequired,
  showAccountConnectModal: PropTypes.func.isRequired,
  address: PropTypes.string,
  assetBalance: PropTypes.number,
  name: PropTypes.string,
  show: PropTypes.bool,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    show: state.account.showModal,
    assetBalance: state.account.balances.asset,
    name: state.account.name,
  };
};

const actionsToProps = {
  showAccountConnectModal,
  setAccountAddress,
};

export default connect(stateToProps, actionsToProps)(DisConnectModal);
