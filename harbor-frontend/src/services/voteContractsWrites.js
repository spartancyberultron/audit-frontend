import { SigningCosmWasmClient } from "cosmwasm";
import { decode } from "js-base64";
import { comdex } from '../config/network'
import { KeplrWallet, lockingContractAddress } from "./keplr";

const customFees = {
    upload: {
        amount: [{ amount: "2000000", denom: "ucmdx" }],
        gas: "2000000",
    },
    init: {
        amount: [{ amount: "500000", denom: "ucmdx" }],
        gas: "500000",
    },
    exec: {
        amount: [{ amount: "500000", denom: "ucmdx" }],
        gas: "500000",
    },
    send: {
        amount: [{ amount: "80000", denom: "ucmdx" }],
        gas: "80000",
    },
}

export const transactionForVotePairProposal = async (address, productId, proposalId, extendedPairId, callback) => {

    const httpUrl = comdex?.rpc;
    let walletAddress = address;
    const handleMsg = {
        "vote_proposal":
        {
            "app_id": productId,
            "proposal_id": proposalId,
            "extended_pair": extendedPairId,

        }
    };

    const [offlineSigner] = await KeplrWallet(comdex?.chainId);

    await SigningCosmWasmClient.connectWithSigner(
        httpUrl,
        offlineSigner)
        .then((client) => {
            client.signAndBroadcast(
                walletAddress,
                [{
                    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
                    value: {
                        sender: walletAddress,
                        contract: lockingContractAddress,
                        msg: new TextEncoder().encode(JSON.stringify(handleMsg)),
                        funds: []
                    }
                }],
                customFees.exec,
            ).then((response) => {
                if (!response?.code) {
                    console.log(response?.rawLog);
                    callback(null, response?.rawLog)
                }
                else {
                    console.log(response?.rawLog);
                    callback(response?.rawLog)

                }

            }).catch((err) => {
                console.log(err);
                callback(err)
            })
        }).catch((error) => {
            console.log(error);
            callback(error)
        });

}