import { clearToken, request, requestWithToken } from './request.js';

export const createUser = (user) => {
    return requestWithToken({
        method: 'POST',
        url: '/user',
        data: user,
    });
};

export const deactivateUser = (userId) => {
    return requestWithToken({
        method: 'DELETE',
        url: `/user/${userId}`,
    });
};

export const demoteUser = (userId) => {
    return requestWithToken({
        method: 'POST',
        url: `/user/${userId}`,
        data: { is_admin: false },
    });
};

export const editUser = (user) => {
    const data = {};

    data.is_admin = user.is_admin;

    if (user.email) {
        data.email = user.email;
    }

    if (user.name) {
        data.name = user.name;
    }

    return requestWithToken({
        method: 'POST',
        url: `/user/${user.id}`,
        data
    });
};

export const forcePasswordChange = (userId) => {
    return requestWithToken({
        method: 'DELETE',
        url: `/user/${userId}/password`,
    });
};

export const getUser = () => {
    return request({
        method: 'GET',
        url: '/user/me',
    });
};

export const getUsers = () => {
    return requestWithToken({
        method: 'GET',
        url: '/user',
    });
};

export const promoteUser = (userId) => {
    return requestWithToken({
        method: 'POST',
        url: `/user/${userId}`,
        data: { is_admin: true },
    });
};

export const updatePassword = (password) => {
    return requestWithToken({
        method: 'POST',
        url: '/user/me/password',
        data: { password }
    })
    .then(clearToken());
};

export default {
    createUser,
    deactivateUser,
    demoteUser,
    editUser,
    forcePasswordChange,
    getUser,
    getUsers,
    promoteUser,
    updatePassword,
};
