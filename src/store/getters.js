export const getters = {
    findWorkspaceById: state => id => (state.workspaces.find(w => w.id === id)),
    findWorkspaceByName: state => name => (state.workspaces.find(w => w.name === name)),
    loadCurrentWorkspace: (state, getters) => (id) => {
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
    }
};

export default {
    getters,
};
