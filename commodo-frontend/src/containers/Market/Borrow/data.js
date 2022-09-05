import { ActionButton } from "../ActionButton";
import AssetApy from "../AssetApy";
import AvailableToBorrow from "./AvailableToBorrow";

export const columns = [
  {
    title: "cPool Id",
    dataIndex: "pool_id",
    key: "pool_id",
    width: 80,
  },
  {
    title: "cPool Asset",
    dataIndex: "asset",
    key: "asset",
    width: 120,
  },
  {
    title: (
      <>
        Transit<br /> Asset 1
      </>
    ),
    dataIndex: "bridge_asset",
    key: "bridge_asset",
    width: 120,
  },
  {
    title: (
      <>
        Transit<br /> Asset 2
      </>
    ),
    dataIndex: "bridge_asset2",
    key: "bridge_asset2",
    width: 120,
  },
  {
    title: (
      <>
        Available to <br /> Borrow
      </>
    ),
    dataIndex: "available_to_borrow",
    key: "available_to_borrow",
    width: 130,
    render: (lendPool) => <AvailableToBorrow lendPool={lendPool} />,
  },
  {
    title: (
      <>
        Main Asset <br /> APY
      </>
    ),
    dataIndex: "asset_apy",
    key: "asset_apy",
    width: 100,
    render: (lendPool) => (
      <AssetApy
        poolId={lendPool?.poolId}
        assetId={lendPool?.mainAssetId}
        parent="borrow"
      />
    ),
  },
  {
    title: (
      <>
        Transit Asset 1 <br /> APY
      </>
    ),
    dataIndex: "bridge_apy",
    key: "bridge_apy",
    width: 140,
    render: (lendPool) => (
      <AssetApy
        poolId={lendPool?.poolId}
        assetId={lendPool?.firstBridgedAssetId}
        parent="borrow"
      />
    ),
  },
  {
    title: (
      <>
        Transit Asset 2 <br /> APY
      </>
    ),
    dataIndex: "bridge_apy2",
    key: "bridge_apy2",
    width: 110,
    render: (lendPool) => (
      <AssetApy
        poolId={lendPool?.poolId}
        assetId={lendPool?.secondBridgedAssetId}
        parent="borrow"
      />
    ),
  },
  {
    title: "",
    dataIndex: "action",
    key: "action",
    align: "right",
    width: 120,
    render: (item) => (
      <ActionButton
        name="Details"
        path={`/borrow/${item?.poolId?.toNumber()}`}
      />
    ),
  },
];
