import { Button } from "antd";
import { useNavigate } from "react-router";

export const ActionButton = ({ name, path }) => {
  const navigate = useNavigate();

  return (
    <Button
      type="primary"
      size="small"
      onClick={() =>
        navigate({
          pathname: path || "/",
        })
      }
    >
      {name || "action"}
    </Button>
  );
};
