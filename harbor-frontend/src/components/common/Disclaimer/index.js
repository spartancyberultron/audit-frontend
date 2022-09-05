import { Button, Modal, Checkbox } from "antd";
import React, { useState } from "react";
import "./index.scss";

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
        <div className="disclaimerinner">
          <h2>Before you enter the Universe</h2>
          <div className="description-text">
            <p>
              Harbor Protocol is a fully decentralised stablecoin protocol. No representation or warranty is made concerning any aspect of the Harbor Protocol, including its suitability, quality, availability, accessibility, accuracy or safety. As more fully explained in the Terms of Use (available here) and the Risk Statement (available here), your access to and use of the Harbor Protocol is entirely at your own risk and could lead to substantial losses. You take full responsibility for your use of the Harbor Protocol, and acknowledge that you use it on the basis of your own enquiry, without solicitation or inducement by Contributors (as defined in the Terms of Use).
            </p>
          </div>
          <div className="text-center mt-4">
            <Checkbox
              checked={isChecked}
              onChange={() => {
                setIsChecked((value) => !value);
              }}
            >
              I confirm that I have read, understand and accept the Terms of Use and the Risks Statement
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
