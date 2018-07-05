import m from "mithril";
import R from "ramda";

import Auth from "../../models/Auth";
import Device from "../../models/Device";
import Rack from "../../models/Rack";
import Relay from "../../models/Relay";
import Workspace from "../../models/Workspace";
import Icons from "../component/Icons";
import Table from "../component/Table";

import RackProgress from "./RackProgress";

function deviceList(title, isProblem, devices) {
	const linkPrefix = isProblem ? "/problem/" : "/device/";
	return m(
		".pure-u-1.pure-u-sm-1-3.text-center",
		m("h2", title),
		devices
			? m(
					".status-device-list",
					devices.map(({ id }) =>
						m(
							"a.status-device-list-item",
							{
								href: linkPrefix + id,
								oncreate: m.route.link
							},
							id
						)
					)
			  )
			: m("i", "No devices")
	);
}

export default {
	loading: true,
	oninit: ({ state }) => {
		Auth.requireLogin(() =>
			Workspace.withWorkspace(workspaceId => {
				Promise.all([
					Device.loadDevices(workspaceId),
					Relay.loadActiveRelays(workspaceId),
					Rack.loadRooms(workspaceId)
				]).then(() => (state.loading = false));
			})
		);
	},
	view({ state }) {
		if (state.loading) return m(".loading", "Loading...");

		const activeDevices = R.filter(Device.isActive, Device.devices);
		const inactiveDevices = R.filter(
			R.compose(
				R.not,
				Device.isActive
			),
			Device.devices
		);

		const healthCounts = R.countBy(d => {
			if (R.propIs(String, "graduated", d)) return "GRADUATED";
			if (R.propIs(String, "validated", d)) return "VALIDATED";
			return R.prop("health", d);
		});

		const activeHealthCounts = healthCounts(activeDevices);
		const inactiveHealthCounts = healthCounts(inactiveDevices);
		const totalHealthCounts = healthCounts(Device.devices);

		const deviceHealthGroups = R.groupBy(R.prop("health"), Device.devices);
		return [
			m("h1.text-center", "Status"),
			m(".pure-u-1", m("h3.text-center", "Datacenter Rack Build Status")),
			R.isEmpty(Rack.rackRooms)
				? null
				: m(
						".pure-u-1",
						m(
							".text-center",
							m(RackProgress, { group: state.group })
						),
						m(
							".text-center",
							m(
								"button.pure-button",
								{
									onclick() {
										if (state.group === "role") {
											state.group = "status";
										} else {
											state.group = "role";
										}
									}
								},
								"Group by " +
									{
										role: "Status",
										status: "Rack Role"
									}[state.group || "status"]
							)
						)
				  ),
			Table(
				"Summary of Device Status",
				["", "Active Devices", "Inactive Devices", "Total Devices"],
				[
					[
						"Unknown",
						activeHealthCounts.UNKNOWN || 0,
						inactiveHealthCounts.UNKNOWN || 0,
						totalHealthCounts.UNKNOWN || 0
					],

					[
						"Failing",
						activeHealthCounts.FAIL || 0,
						inactiveHealthCounts.FAIL || 0,
						totalHealthCounts.FAIL || 0
					],

					[
						"Passing",
						activeHealthCounts.PASS || 0,
						inactiveHealthCounts.PASS || 0,
						totalHealthCounts.PASS || 0
					],

					[
						"Validated",
						activeHealthCounts.VALIDATED || 0,
						inactiveHealthCounts.VALIDATED || 0,
						totalHealthCounts.VALIDATED || 0
					],

					[
						"Graduated",
						activeHealthCounts.GRADUATED || 0,
						inactiveHealthCounts.GRADUATED || 0,
						totalHealthCounts.GRADUATED || 0
					],
					[
						m("b", "Sum"),
						activeDevices.length,
						inactiveDevices.length,
						activeDevices.length + inactiveDevices.length
					]
				]
			),
			Table(
				"Active Relays",
				["Name", "Devices Connected", "Actions"],
				Relay.activeList.map(({ alias, id, devices, location }) => {
					return [
						alias || id,
						R.filter(Device.isActive, devices).length,
						[
							m(
								"a.pure-button",
								{
									href: `/relay/${id}`,
									oncreate: m.route.link,
									title: "Show Relay Details"
								},
								Icons.showRelay
							),
							location
								? m(
										"a.pure-button",
										{
											href: `/rack/${location.rack_id}`,
											oncreate: m.route.link,
											title: "Show Connected Rack"
										},
										Icons.showRack
								  )
								: null
						]
					];
				})
			)
		];
	}
};
