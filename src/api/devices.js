import { requestWithToken } from './request.js';

export const addDeviceLinks = (id, links) => {
    return requestWithToken({
        method: 'POST',
        url: `/device/${id}/links`,
        data: { links },
    });
};

export const getDeviceDetails = id => {
    return requestWithToken({
        method: 'GET',
        url: `/device/${id}`,
    });
};

export const getDevicePhase = id => {
    return requestWithToken({
        method: 'GET',
        url: `/device/${id}/phase`,
    });
};

export const getDeviceSettings = id => {
    return requestWithToken({
        method: 'GET',
        url: `/device/${id}/settings`,
    });
};

export const getDeviceValidations = id => {
    return requestWithToken({
        method: 'GET',
        url: `/device/${id}/validation_state`,
    });
};

export const getLocation = id => {
    return requestWithToken({
        method: 'GET',
        url: `/device/${id}/location`,
    });
};

export const removeDeviceLinks = (id, data) => {
    return requestWithToken({
        method: 'DELETE',
        url: `/device/${id}/links`,
        data,
    });
};

export const setDevicePhase = (id, data) => {
    return requestWithToken({
        method: 'POST',
        url: `/device/${id}/phase`,
        data,
    });
};

export default {
    addDeviceLinks,
    getDeviceDetails,
    getDevicePhase,
    getDeviceSettings,
    getDeviceValidations,
    getLocation,
    removeDeviceLinks,
    setDevicePhase,
};
