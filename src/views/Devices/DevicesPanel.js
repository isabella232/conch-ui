import m from "mithril";
import stream from "mithril/stream";
import search from "fuzzysearch";
import sortBy from "lodash/sortBy";

import Spinner from "../component/Spinner";
import { ProgressIcon, deviceToProgress } from "../DatacenterBrowser/Progress";

export default () => {
	const deviceSearchText = stream("");
	const deviceSearchTextLC = deviceSearchText.map(t => t.toLowerCase());

	const selectedProgress = stream("all");
	let availableDeviceProgress;

	let availableProducts;
	const selectedProductId = stream("all");

	const deviceFilter = stream.combine(
		(progress, productId, searchText) => device => {
			const deviceId = device ? device.id.toLowerCase() : "";
			const assetTag =
				device && device.asset_tag
					? device.asset_tag.toLowerCase()
					: "";
			const progressFilter =
				progress() === "all" || progress() === deviceToProgress(device);
			const productFilter =
				productId() === "all" ||
				productId() === device.hardware_product;
			const searchFilter =
				search(searchText(), deviceId) ||
				search(searchText(), assetTag);

			return progressFilter && productFilter && searchFilter;
		},
		[selectedProgress, selectedProductId, deviceSearchTextLC]
	);

	let filteredDevices;

	//const selectedProgress = stream("all");
	//const rackProgressFilter = rack =>
	//selectedProgress() === "all" ||
	//selectedProgress() === rackToProgress(rack);
	//let availableRackProgress;

	return {
		oninit: ({ attrs: { workspaceDevices, hardwareProductLookup } }) => {
			availableDeviceProgress = workspaceDevices.map(devices =>
				Array.from(
					devices.reduce((acc, device) => {
						acc.add(deviceToProgress(device));
						return acc;
					}, new Set(["all"]))
				).sort()
			);

			availableProducts = workspaceDevices.map(devices => {
				const products = sortBy(
					Array.from(
						devices.reduce((acc, device) => {
							acc.add(
								hardwareProductLookup[device.hardware_product]
							);
							return acc;
						}, new Set())
					),
					"name"
				);
				products.unshift({ id: "all", name: "all" });
				return products;
			});

			// reset filters when activeRacks change
			workspaceDevices.map(() => {
				selectedProgress("all");
				deviceSearchText("");
			});
			filteredDevices = stream.combine(
				(devices, filter) => devices().filter(filter()),
				[workspaceDevices, deviceFilter]
			);
		},
		view: ({ attrs: { activeDeviceId, workspaceDevices } }) =>
			m(
				"nav.panel",
				m(
					"p.panel-heading",
					`${filteredDevices().length} of ${
						workspaceDevices().length
					} Devices`
				),
				[
					m(
						".panel-block",
						m(
							"p.control.has-icons-left",
							m(
								"input.input.is-small[type=text][placeholder=Search Devices]",
								{
									oninput: m.withAttr(
										"value",
										deviceSearchText
									),
									value: deviceSearchText()
								}
							),
							m(
								"span.icon.is-small.is-left",
								m("i.fas fa-search")
							)
						)
					),
					m(
						"p.panel-tabs",
						availableDeviceProgress().map(p =>
							m(
								"a",
								{
									onclick: e => {
										selectedProgress(p);
									},
									// don't break spaces
									style: "white-space:pre",
									class:
										selectedProgress() === p && "is-active"
								},
								p
							)
						)
					),
					m(
						"p.panel-tabs",
						availableProducts().map(p =>
							m(
								"a",
								{
									onclick: e => {
										selectedProductId(p.id);
									},
									// don't break spaces
									style: "white-space:pre",
									class:
										selectedProductId() === p.id &&
										"is-active"
								},
								p.name
							)
						)
					),
					filteredDevices().reduce((acc, device) => {
						acc.push(
							m(
								"a.panel-block",
								{
									onclick: e => {
										activeDeviceId(device.id);
									},
									style: "white-space:pre",
									class:
										activeDeviceId() === device.id &&
										"is-active"
								},
								m(
									".panel-icon",
									m(ProgressIcon, {
										progress: deviceToProgress(device)
									})
								),
								device.id,
								device.asset_tag &&
									m(
										"p.has-text-grey-light",
										`  ${device.asset_tag}`
									)
							)
						);
						return acc;
					}, [])
				]
			)
	};
};
