<template>
    <nav class="panel rack-panel">
        <p class="panel-heading has-text-centered">
            {{ activeRoomName }} Racks
        </p>
        <div class="panel-block">
            <p class="control has-icons-left">
                <input
                    type="text"
                    class="input is-small"
                    placeholder="Search Racks"
                    v-model="searchText"
                />
                <span class="icon is-small is-left">
                    <i class="fas fa-search"></i>
                </span>
            </p>
        </div>
        <p class="panel-tabs" v-if="filteredActiveRacks.length > 0">
            <a
                v-for="(progress, index) in availableRackProgress"
                :key="index"
                :class="{ 'is-active': selectedProgress === progress }"
                @click="selectedProgress = progress"
            >
                {{ progress }}
            </a>
        </p>
        <p class="panel-tabs" v-if="filteredActiveRacks.length > 0">
            <a
                v-for="(role, index) in availableRackRoles"
                :key="index"
                :class="{ 'is-active': selectedRole === role }"
                @click="selectedRole = role"
            >
                {{ role }}
            </a>
        </p>
        <template v-if="filteredActiveRacks.length > 0">
            <a
                v-for="(rack, index) in filteredActiveRacks"
                :key="index"
                class="panel-block"
                :class="{ 'is-active': isRackSelected(rack.id) }"
                @click="activateRack(rack.id)"
            >
                <div class="panel-icon">
                    <ProgressIcon :progress="rackToProgress(rack)" />
                </div>
                {{ rack.name }}
            </a>
        </template>
        <p
            class="panel-block"
            v-else-if="filteredActiveRacks.length === 0 && searchText"
            style="justify-content: center;"
        >
            No racks found
        </p>
    </nav>
</template>

<script>
import search from 'fuzzysearch';
import ProgressIcon from '@views/components/ProgressIcon.vue';
import { mapActions, mapState } from 'vuex';
import { getRack, getRackAssignment } from '@api/racks';
import { getDeviceDetails, getDeviceSettings } from '@api/devices.js';
import { EventBus } from '@src/eventBus.js';

export default {
    components: { ProgressIcon },
    data() {
        return {
            availableRackRoles: '',
            availableRackProgress: '',
            searchText: '',
            selectedProgress: 'all',
            selectedRole: 'all',
        };
    },
    methods: {
        ...mapActions(['setRackLayout']),
        async activateRack(rackId, pushRoute = true) {
            this.$emit('rack-activated');
            let rack = await getRack(rackId).then(response => response.data);

            const rackAssignment = await getRackAssignment(rackId).then(
                response => response.data
            );

            rack.slots = {};

            for (let i = 0; i < rackAssignment.length; i++) {
                const assignment = rackAssignment[i];
                const deviceId = assignment.device_id;
                const slotId = assignment.rack_unit_start;

                if (deviceId) {
                    assignment.occupant = await getDeviceDetails(deviceId).then(
                        response => response.data
                    );

                    assignment.occupant.settings = await getDeviceSettings(
                        deviceId
                    ).then(response => response.data);
                } else {
                    assignment.occupant = {};
                }

                rack.slots[slotId] = assignment;
            }

            this.setRackLayout(rack);

            if (pushRoute) {
                this.$router.push({
                    name: 'datacenterRack',
                    params: { rackId },
                });
            }
        },
        isRackSelected(rackId) {
            if (this.rackLayout && this.rackLayout.id) {
                return this.rackLayout.id === rackId ? true : false;
            } else if (this.$route.params && this.$route.params.rackId) {
                const rackIdParam = this.$route.params.rackId;

                return rackId === rackIdParam ? true : false;
            }

            return false;
        },
        rackFilterMatch(rack) {
            return (
                this.rackNameFilter(rack.name) &&
                this.rackRoleFilter(rack.rack_role_name) &&
                this.rackProgressFilter(rack)
            );
        },
        rackNameFilter(rackName) {
            return search(
                this.searchText.toLowerCase(),
                rackName.toLowerCase()
            );
        },
        rackToProgress(rack) {
            if (rack['device_progress']['fail']) {
                return 'failing';
            } else if (rack['device_progress']['pass']) {
                return 'in progress';
            } else if (rack['device_progress']['valid']) {
                return 'validated';
            } else {
                return 'not started';
            }
        },
        rackRoleFilter(role) {
            return (
                this.selectedRole === 'all' ||
                this.selectedRole === role.toLowerCase()
            );
        },
        rackProgressFilter(rack) {
            return (
                this.selectedProgress === 'all' ||
                this.selectedProgress === this.rackToProgress(rack)
            );
        },
    },
    computed: {
        ...mapState(['activeRoomName', 'rackLayout', 'rackRooms']),
        activeRacks() {
            if (this.rackRooms.length) {
                let racks;

                this.rackRooms.map(rackRoom => {
                    if (rackRoom.name === this.activeRoomName) {
                        racks = rackRoom.racks.sort((a, b) => {
                            a.name > b.name ? 1 : -1;
                        });

                        return racks;
                    }
                });

                return racks;
            }

            return [];
        },
        filteredActiveRacks() {
            if (this.activeRacks && this.activeRacks.length) {
                return this.activeRacks.reduce((acc, rack) => {
                    if (this.rackFilterMatch(rack)) {
                        acc.push(rack);
                    }

                    return acc;
                }, []);
            }

            return [];
        },
    },
    created() {
        // get the list of available rack roles
        this.availableRackRoles = Array.from(
            this.activeRacks.reduce((acc, rack) => {
                const rackRole = rack.rack_role_name.toLowerCase();

                if (!acc.has(rackRole)) {
                    acc.add(rackRole);
                }

                return acc;
            }, new Set(['all']))
        ).sort();

        this.availableRackProgress = Array.from(
            this.activeRacks.reduce((acc, rack) => {
                acc.add(this.rackToProgress(rack));

                return acc;
            }, new Set(['all']))
        ).sort();

        if (this.$route.params && this.$route.params.rackId) {
            this.activateRack(this.$route.params.rackId, false);
        }
    },
    mounted() {
        EventBus.$on('refreshRackLayout', rack => {
            this.activateRack(rack.id);
        });
    },
};
</script>
