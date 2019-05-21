<template>
    <div class="data-center-browser">
        <PageHeader :title="`${currentWorkspaceName} workspace datacenters`" :subtitle="'Browse datacenter rooms, racks and devices'" />
        <section class="info-tiles">
            <div class="tile is-ancestor has-text-right">
                <div class="tile is-parent">
                    <article class="tile is-child box" style="padding: 0.75rem;">
                        <div class="dropdown is-right" :class="{ 'is-active': searchText }">
                            <div class="dropdown-trigger">
                                <div class="control" :class="{ 'is-loading': !this.workspaceDevices && searchText }">
                                    <input class="input search" placeholder="Search for Device" v-model="searchText" @focus="hideDropdown = false">
                                </div>
                            </div>
                            <div class="dropdown-menu is-paddingless">
                                <div class="dropdown-content" v-if="foundDevices.length && !hideDropdown">
                                    <a class="dropdown-item" v-for="(device, index) in foundDevices" :key="index" @click="setSearchedDevice(device)">
                                        {{ device.id }}
                                        <span class="has-text-grey-light" v-if="device.asset_tag">{{ device.asset_tag }}</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
            <div class="tile is-ancestor has-text-right">
                <div class="tile is-parent">
                    <article class="tile is-child">
                        <DeviceModal/>
                        <section class="section" v-if="!hasRackRooms">
                            <Spinner/>
                        </section>
                        <div class="columns is-gapless" v-else>
                            <div class="column is-3">
                                <RoomPanel :rack-rooms="rackRooms" />
                            </div>
                            <div class="column is-3">
                                <RackPanel v-if="activeRacks" :active-racks="activeRacks" />
                            </div>
                            <div class="column is-6">
                                <LayoutPanel :rack-loading="rackLoading" />
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import search from 'fuzzysearch';
import DeviceModal from '@views/components/DeviceModal.vue';
import LayoutPanel from './LayoutPanel.vue';
import PageHeader from '@views/components/PageHeader.vue';
import RackPanel from './RackPanel.vue';
import RoomPanel from './RoomPanel.vue';
import Spinner from '@views/components/Spinner.vue';
import { EventBus } from '@src/eventBus.js';
import { getRackById } from '@api/workspaces.js';
import { getLocation } from '@api/device.js';
import { mapActions, mapGetters, mapState } from 'vuex';
import { getRackRooms, getWorkspaceRacks, getWorkspaceDevices } from '@views/shared/utils.js';

export default {
    components: {
        DeviceModal,
        LayoutPanel,
        PageHeader,
        RackPanel,
        RoomPanel,
        Spinner,
    },
    data() {
        return {
            foundDevices: [],
            hideDropdown: true,
            maxFoundDevices: 12,
            rackFilterText: '',
            rackLoading: false,
            rackRooms: [],
            searchedDevice: null,
            searchText: null,
            workspaceDevices: null,
        };
    },
    methods: {
        ...mapActions([
            'clearActiveDevice',
            'clearActiveRoomName',
            'clearRackLayout',
            'setActiveRoomName',
            'setHighlightDeviceId',
            'setRackLayout',
        ]),
        clearActiveData() {
            this.clearActiveDevice();
            this.clearActiveRoomName();
            this.clearRackLayout();
        },
        setWorkspaceDevices() {
            getWorkspaceDevices(this.currentWorkspaceId)
                .then(response => {
                    this.workspaceDevices = response;
                });
        },
        setWorkspaceRacks() {
            getWorkspaceRacks(this.currentWorkspaceId)
                .then(response => {
                    this.rackRooms = getRackRooms(response);
                });
        },
        setFoundDevices(searchText) {
            const devices = this.workspaceDevices;
            const text = searchText.toLowerCase();

            this.foundDevices = devices.reduce((acc, device) => {
                if (acc.length > this.maxFoundDevices) {
                    return acc;
                }

                const deviceId = device.id.toLowerCase();
                const assetTag = device.asset_tag ? device.asset_tag.toLowerCase() : false;

                if (search(text, deviceId) || (assetTag && search(text, assetTag))) {
                    acc.push(device);
                }

                return acc;
            }, []);
        },
        setSearchedDevice(device) {
            this.hideDropdown = true;
            this.setHighlightDeviceId(device.id);

            getLocation(device.id)
                .then(response => {
                    const location = response.data;

                    if (location) {
                        if (location.datacenter_room && location.datacenter_room.az) {
                            this.setActiveRoomName(location.datacenter_room.az);
                        }

                        if (location.rack && location.rack.id) {
                            this.rackLoading = true;

                            getRackById(this.currentWorkspaceId, location.rack.id)
                                .then(response => {
                                    this.setRackLayout(response);
                                    this.rackLoading = false;
                                });
                        }
                    }
                });
        },
    },
    computed: {
        ...mapGetters([
            'currentWorkspaceId',
            'currentWorkspaceName',
        ]),
        ...mapState([
            'activeRoomName',
        ]),
        activeRacks() {
            if (this.rackRooms.length) {
                let racks;

                this.rackRooms.map(rackRoom => {
                    if (rackRoom.name === this.activeRoomName) {
                        racks = rackRoom.racks.sort((a, b) => {
                            a.name > b.name ? 1 : -1
                        });

                        return;
                    }
                });

                return racks;
            }
        },
        hasRackRooms() {
            return this.rackRooms.length > 0;
        },
    },
    watch: {
        searchText(searchText) {
            if (searchText !== '') {
                this.setFoundDevices(searchText);
            }
        },
    },
    created() {
        this.setWorkspaceDevices();
        this.setWorkspaceRacks();
    },
    mounted() {
        if (this.$route && this.$route.params) {
            const routeParams = this.$route.params;

            if (routeParams.roomName) {
                this.setActiveRoomName(routeParams.roomName);
            }

            if (routeParams.currentWorkspace && routeParams.rackId) {
                getRackById(routeParams.currentWorkspace, routeParams.rackId)
                    .then(response => {
                        this.setRackLayout(response);
                    });
            }
        }

        EventBus.$on('changeWorkspace:datacenter', () => {
            this.setWorkspaceDevices();
            this.setWorkspaceRacks();
            this.clearActiveData();
        });
    },
    destroyed() {
        this.clearActiveData();
    },
};
</script>