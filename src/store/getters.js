export const getters = {
    activeDeviceId: state => (state.activeDevice.id),
    activeRackId: state => (state.activeRack.id),
    activeRoomName: state => (state.activeRoom.name),
    activeRoomId: state => (state.activeRoom.id),
    currentWorkspaceId: state => (state.currentWorkspace.id),
    currentWorkspaceName: state => (state.currentWorkspace.name),
    findWorkspaceById: state => id => (state.workspaces.find(w => w.id === id)),
    findWorkspaceByName: state => name => (state.workspaces.find(w => w.name === name)),
    getDevicesByWorkspace: state => workspaceId => {
        let workspaceDevices = state.devicesByWorkspace.find(workspace => {
            return Object.keys(workspace)[0] === workspaceId
        })

        return workspaceDevices ? workspaceDevices : null;
    },
    getRoomByName: state => name => (state.allRooms.find(room => room.name === name)),
    loadCurrentWorkspace: (state, getters) => id => {
        let currentWorkspace = null;

        currentWorkspace = getters.findWorkspaceById(id);

        if (!currentWorkspace) {
            currentWorkspace = getters.findWorkspaceById(localStorage.getItem('currentWorkspace'));
        }

        if (!currentWorkspace) {
            currentWorkspace = getters.findWorkspaceByName('GLOBAL');
        }

        if (!currentWorkspace) {
            currentWorkspace = state.workspaces[0];
        }

        return currentWorkspace;
    },
};

export default {
    getters,
};
