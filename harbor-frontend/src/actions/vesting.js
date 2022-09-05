import { SET_TOTAL_ISSUED_VEHARBOR, SET_VESTING_RADIO_VALUE } from "../constants/vesting";

export const setVestingRadioInput = (data) => {
    return {
        type: SET_VESTING_RADIO_VALUE,
        data,
    };
};
export const setIssuedveHARBOR = (data) => {
    return {
        type: SET_TOTAL_ISSUED_VEHARBOR,
        data,
    };
};