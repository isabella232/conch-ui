import nock from 'nock';
import { conchApi } from '@src/config.js';
import * as workspace from '@api/workspaces.js';

// Fixtures
import devices from '@src/__fixtures__/devices.js';
import { rack, rackLayout } from '@src/__fixtures__/rackLayout.js';
import workspaceRacks from '@src/__fixtures__/workspaceRacks.js';
import workspaces from '@src/__fixtures__/workspaces.js';

sessionStorage.setItem('token', 'my-token');

describe('workspaces.js API', () => {
    let response;
    const rackId = rackLayout.id;
    const workspaceId = workspaces[0].id;

    beforeEach(() => {
        response = {};
    });

    describe('getAllRacks', () => {
        beforeEach(() => {
            nock(conchApi)
                .get(`/workspace/${workspaceId}/rack`)
                .reply(200, workspaceRacks);
        });

        test('should return a status of 200', async () => {
            expect.assertions(1);
            response = await workspace.getAllRacks(workspaceId);
            expect(response.status).toEqual(200);
        });

        test('should return an object containing workspace racks', async () => {
            expect.assertions(1);
            response = await workspace.getAllRacks(workspaceId);
            expect(response.data).toMatchObject(workspaceRacks);
        });
    });

    describe('getDevices', () => {
        beforeEach(() => {
            nock(conchApi)
                .get(`/workspace/${workspaceId}/device`)
                .reply(200, devices);
        });

        test('should return a status of 200', async () => {
            expect.assertions(1);
            response = await workspace.getDevices(workspaceId);
            expect(response.status).toEqual(200);
        });

        test('should return an object containing workspace devices', async () => {
            expect.assertions(1);
            response = await workspace.getDevices(workspaceId);
            expect(response.data).toMatchObject(devices);
        });
    });

    describe('getRackById', () => {
        beforeEach(() => {
            nock(conchApi)
                .get(`/workspace/${workspaceId}/rack/${rackId}`)
                .reply(200, rack);
        });

        test('should return an object containing workspace rack by ID', async () => {
            expect.assertions(1);
            response = await workspace.getRackById(workspaceId, rackId);
            expect(response).toMatchObject(rackLayout);
        });
    });

    describe('loadAllWorkspaces', () => {
        beforeEach(() => {
            nock(conchApi)
                .get(`/workspace`)
                .reply(200, workspaces);
        });

        test('should return a status of 200', async () => {
            expect.assertions(1);
            response = await workspace.loadAllWorkspaces();
            expect(response.status).toEqual(200);
        });

        test('should return an object containing workspaces', async () => {
            expect.assertions(1);
            response = await workspace.loadAllWorkspaces();
            expect(response.data).toMatchObject(workspaces);
        });
    });

    describe('setRackLayout', () => {
        const slotNames = rack.slots.map(slot => slot.name);
        const responseData = { updated: slotNames };

        beforeEach(() => {
            nock(conchApi)
                .post(`/workspace/${workspaceId}/rack/${rackId}/layout`)
                .reply(200, responseData);
        });

        test('should return a status of 200', async () => {
            expect.assertions(1);
            response = await workspace.setRackLayout(
                workspaceId,
                rackId,
                rackLayout
            );
            expect(response.status).toEqual(200);
        });

        test('should return an object containing the updated slot names', async () => {
            expect.assertions(1);
            response = await workspace.setRackLayout(
                workspaceId,
                rackId,
                rackLayout
            );
            expect(response.data).toMatchObject(responseData);
        });
    });
});
