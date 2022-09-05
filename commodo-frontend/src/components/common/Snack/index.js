import { comdex } from "../../../config/network";
import "./index.less";

const Snack = ({ message, explorerUrlToTx = comdex.explorerUrlToTx, hash }) => {
  return (
    <span className="sucessMessages">
      {message}
      <a
        href={`${explorerUrlToTx.replace("{txHash}", hash?.toUpperCase())}`}
        target="_blank"
        className="ml-2 link"
      >
        {" "}
        View Explorer
      </a>
    </span>
  );
};

export default Snack;
