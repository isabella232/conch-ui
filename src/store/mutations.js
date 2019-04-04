export const mutations = {
    clearActiveDevice(state) {
        state.activeDevice = '';
    },
    clearActiveRoom(state) {
        state.activeRoom = {};
    },
    clearRackLayout(state) {
        state.rackLayout = {};
    },
    setActiveDevice(state, activeDevice) {
        state.activeDevice = activeDevice;
    },
    setActiveDeviceDetails(state, activeDeviceDetails) {
        state.activeDeviceDetails = activeDeviceDetails;
    },
    setActiveDeviceSettings(state, activeDeviceSettings) {
        state.activeDeviceSettings = activeDeviceSettings;
    },
    setActiveDeviceValidations(state, activeDeviceValidations) {
        state.activeDeviceValidations = activeDeviceValidations;
    },
    setActiveRack(state, activeRack) {
        state.activeRack = activeRack;
    },
    setActiveRoom(state, activeRoom) {
        state.activeRoom = activeRoom;
    },
    setDevicesByWorkspace(state, devices) {
        state.devicesByWorkspace.push(devices);
    },
    setAllRooms(state, allRooms) {
        state.allRooms = allRooms;
    },
    setCurrentWorkspace(state, workspace) {
        state.currentWorkspace = workspace;
    },
    setHardwareProducts(state, hardwareProducts) {
        state.hardwareProducts = hardwareProducts;
    },
    setHighlightDeviceId(state, highlightDeviceId) {
        state.highlightDeviceId = highlightDeviceId;
    },
    setRackLayout(state, rackLayout) {
        state.rackLayout = rackLayout;
    },
    setRackRoomsByWorkspace(state, rackRooms) {
        state.rackRoomsByWorkspace.push(rackRooms);
    },
    setWorkspaces(state, workspaces) {
        state.workspaces = workspaces;
    },
    setValidations(state, validations) {
        state.validations = validations;
    },
};

export default {
    mutations,
};
