import m from "mithril";
import moment from "moment";
import sortBy from "lodash/sortBy";
import stream from "mithril/stream";
import { request } from "mithril";
import countBy from "lodash/countBy";
import groupBy from "lodash/groupBy";

import { conchApi } from "config";

import { RadialProgress, Spinner } from "../component";

import Tabs from "./Tabs";
import NetworkingTab from "./NetworkingTab";
import OverviewTab from "./OverviewTab";
import SettingsTab from "./SettingsTab";
import StorageTab from "./StorageTab";
import ValidationTab from "./ValidationTab";
import ReportTab from "./ReportTab";

import Device from "src/models/Device";

export default () => {
	const activeDevice = stream();
	const deviceSettings = stream();
	let deviceLoading = true;
	let intervalId;

	return {
		oninit: ({ attrs: { activeDeviceId } }) => {
			activeDeviceId.map(deviceId => {
				if (deviceId == null) return;
				const device = new Device(deviceId);
				device.getDeviceDetails().then(res => {
					activeDevice(res);
				});
				device.getDeviceSettings().then(deviceSettings);
			});

			// refresh the device, settings, and any dependent streams every 15
			// seconds
			intervalId = setInterval(() => {
				activeDeviceId(activeDeviceId());
			}, 15000);
		},
		onremove: () => {
			clearInterval(intervalId);
		},
		view: ({ attrs: { activeDeviceId } }) => {
			return stream.merge([activeDevice, deviceSettings])() == null
				? m("section.section", m(Spinner))
				: [
						m(Tabs, {
							tabs: [
								{
									title: "Overview",
									component: OverviewTab
								},
								{
									title: "Validation",
									component: ValidationTab
								},
								{
									title: "Settings",
									component: SettingsTab
								},
								{
									title: "Storage",
									component: StorageTab
								},
								{
									title: "Networking",
									component: NetworkingTab
								},
								{
									title: "Latest Report",
									component: ReportTab
								}
							],
							activeDevice,
							activeDeviceId,
							deviceSettings
						})
				  ];
		}
	};
};
