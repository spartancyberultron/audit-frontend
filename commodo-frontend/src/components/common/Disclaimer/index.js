import { Button, Checkbox, Modal } from "antd";
import React, { useState } from "react";
import "./index.less";

const Disclaimer = () => {
  const [isVisible, setIsVisible] = useState(
    localStorage.getItem("agreement_accepted") === null
  );
  const [isChecked, setIsChecked] = useState(false);

  return (
    <>
      <Modal
        centered={true}
        className="disclaimer-modal"
        footer={null}
        header={null}
        visible={isVisible}
        closable={false}
        width={800}
        isHidecloseButton={true}
        maskStyle={{ background: "rgba(0, 0, 0, 0.6)" }}
      >
        <div className="disclaimer-inner">
          <h2>Before you enter the Universe</h2>
          <div className="description-text">
            <p>
              Commodo is a decentralised non-custodial liquidity market credit
              protocol native to the Comdex chain where users can participate as
              depositors or borrowers. The Comdex blockchain is made up of free,
              public, and open-source software. Your use of Commodo involves
              various risks, including, but not limited, to losses while assets
              are being supplied to market pools and losses due to the
              fluctuation of prices of tokens including liquidations. Before
              depositing any asset on any pool, you should review the relevant
              documentation to make sure you understand how Commodo works.
              Additionally, just as you can access email protocols, such as
              SMTP, through multiple email clients, you can access pools on
              Commodo through several web or mobile interfaces. You are
              responsible for doing your own diligence on those interfaces to
              understand the fees and risks they present. Upgrades and
              modifications to the protocol are managed in a community-driven
              way by holders of the CMDX governance token. No developer or
              entity involved in creating the Commodo protocol will be liable
              for any claims or damages whatsoever associated with your use,
              inability to use, or your interaction with other users of the
              Commodo protocol, including any direct, indirect, incidental,
              special, exemplary, punitive or consequential damages, or loss of
              profits, cryptocurrencies, tokens, or anything else of value.
            </p>
          </div>
          <div className="text-center mt-4">
            <Checkbox
              checked={isChecked}
              onChange={() => {
                setIsChecked((value) => !value);
              }}
            >
              I understand the risk and would like to proceed
            </Checkbox>
          </div>
          <div className="d-flex agree-btn">
            <Button
              disabled={!isChecked}
              name="Agree"
              type="primary"
              size="large"
              onClick={() => {
                setIsVisible(false);
                localStorage.setItem("agreement_accepted", "true");
              }}
              className="btn-filled"
            >
              Proceed
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Disclaimer;
