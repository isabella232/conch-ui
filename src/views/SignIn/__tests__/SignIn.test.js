import SignIn from '../SignIn.vue';
import Vuex from 'vuex';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import * as authentication from '@api/authentication.js';
import * as users from '@api/users.js';

const localVue = createLocalVue();
localVue.use(Vuex);

jest.mock('@api/request.js');
jest.mock('@api/authentication.js');

describe('SignIn.vue', () => {
    let actions;
    let getters;
    let mocks;
    let state;
    let store;
    let wrapper;

    beforeEach(() => {
        actions = {
            setCurrentUser: jest.fn(),
            setCurrentWorkspace: jest.fn(),
            setForcePasswordChange: jest.fn(),
            setWorkspaces: jest.fn(),
        };
        getters = {
            currentWorkspaceId: jest.fn(),
            loadCurrentWorkspace: jest.fn(),
        };
        mocks = { $router: [] };
        state = { workspaces: {} };
        store = new Vuex.Store({ actions, getters, state });
        wrapper = shallowMount(SignIn, { localVue, mocks, store });
    });

    test('should call signIn method when Login button is clicked', () => {
        const spy = jest.spyOn(wrapper.vm, 'signIn');
        wrapper.find('button').trigger('click');

        expect(spy).toHaveBeenCalled();
    });

    test('should not display warning text on initial render', () => {
        expect(wrapper.html()).not.toContain('Invalid email address or password');
    });

    test('should display warning text when bad login info is submitted', () => {
        wrapper.vm.badLoginAttempt = true;
        expect(wrapper.html()).toContain('Invalid email address or password');
    });

    test('should display warning when empty input fields are submitted', () => {
        wrapper.find('button').trigger('click');

        expect(wrapper.html()).toContain('Invalid email address or password');
    });

    test('should call the login method', () => {
        const spy = jest.spyOn(authentication, 'login');

        // Needed in order for test to pass. It seems like Jest doesn't know
        // how to handle getters that take arguments. It seems to identify such
        // calls as method calls and looks for a corresponding item in the
        // 'methods' object of the Vue component.
        Object.defineProperty(wrapper.vm, 'loadCurrentWorkspace', { value: jest.fn() });

        wrapper.setData({ emailAddress: 'validuser@joyent.com', password: 'goodPassword' });
        wrapper.find('button').trigger('click');

        expect(spy).toHaveBeenCalledWith({ user: 'validuser@joyent.com', password: 'goodPassword' });
    });
});
