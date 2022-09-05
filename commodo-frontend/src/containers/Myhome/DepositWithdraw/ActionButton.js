import { Button, message } from "antd";
import { signAndBroadcastTransaction } from "../../../services/helper";
import { getAmount } from "../../../utils/coin";
import { defaultFee } from "../../../services/transaction";
import Snack from "../../../components/common/Snack";
import variables from "../../../utils/variables";
import { useState } from "react";
import { useNavigate } from "react-router";

export const ActionButton = ({
  lang,
  disabled,
  name,
  address,
  lendId,
  amount,
  denom,
  refreshData,
}) => {
  const [inProgress, setInProgress] = useState(false);
  const navigate = useNavigate();

  const messageMap = {
    Deposit: "/comdex.lend.v1beta1.MsgDeposit",
    Withdraw: "/comdex.lend.v1beta1.MsgWithdraw",
    Close: "/comdex.lend.v1beta1.MsgCloseLend",
  };

  const handleClick = () => {
    setInProgress(true);

    signAndBroadcastTransaction(
      {
        message: {
          typeUrl: messageMap[name],
          value: {
            lender: address,
            lendId: lendId,
            amount: {
              amount: getAmount(amount),
              denom: denom,
            },
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

        message.success(
          <Snack
            message={variables[lang].tx_success}
            hash={result?.transactionHash}
          />
        );
        if (name !== "Close") {
          refreshData();
        } else {
          navigate("/myhome");
        }
      }
    );
  };

  return (
    <Button
      type="primary"
      className="btn-filled"
      loading={inProgress}
      disabled={disabled}
      onClick={handleClick}
    >
      {name}
    </Button>
  );
};

export default ActionButton;
