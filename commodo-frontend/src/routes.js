import Airdrop from "./containers/Airdrop";
import Assets from "./containers/Assets";
import Auction from "./containers/Auction";
import Dashboard from "./containers/Dashboard";
import Extra from "./containers/Extra";
import Govern from "./containers/Govern";
import GovernDetails from "./containers/Govern/Details";
import Borrow from "./containers/Market/Borrow";
import BorrowDetails from "./containers/Market/Borrow/Details";
import DirectBorrow from "./containers/Market/Borrow/Direct";
import Lend from "./containers/Market/Supply";
import SupplyDetails from "./containers/Market/Supply/Details";
import MyHome from "./containers/Myhome";
import BorrowRepay from "./containers/Myhome/BorrowRepay";
import Deposit from "./containers/Myhome/DepositWithdraw";

const routes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/myhome",
    element: <MyHome />,
  },
  {
    path: "/myhome/borrow/:id",
    element: <BorrowRepay />,
  },
  {
    path: "/myhome/deposit/:id",
    element: <Deposit />,
  },
  {
    path: "/lend",
    element: <Lend />,
  },
  {
    path: "/borrow",
    element: <Borrow />,
  },
  {
    path: "/lend/:id",
    element: <SupplyDetails />,
  },
  {
    path: "/borrow/:id",
    element: <BorrowDetails />,
  },
  {
    path: "/borrow/direct",
    element: <DirectBorrow />,
  },
  {
    path: "/auction",
    element: <Auction />,
  },
  {
    path: "/airdrop",
    element: <Airdrop />,
  },
  {
    path: "/govern",
    element: <Govern />,
  },
  {
    path: "/govern/:id",
    element: <GovernDetails />,
  },
  {
    path: "/asset",
    element: <Assets />,
  },
  {
    path: "/extra",
    element: <Extra />,
  },
];

export default routes;
