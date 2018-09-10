import m from "mithril";
import Spinner from "views/component/Spinner";
import { ProgressIcon } from "views/DatacenterBrowser/Progress";

// ok to not be component because they don't change
const headers = [
	m("th", "Slot"),
	m("th", ""),
	m("th", "Product Name"),
	m("th.has-text-right", "Assigned Device"),
	m("th.has-text-right", "Asset Tag")
];

export default {
	view: ({ attrs: { deviceSlots, activeDeviceId, highlightDeviceId } }) => {
		return m(
			"table.table.is-fullwidth.is-hoverable",
			m("thead", m("tr", headers)),
			m("tfoot", m("tr", headers)),
			m(
				"tbody",
				deviceSlots().map(slot => {
					let occupant = slot.occupant;
					return m(
						"tr",
						{
							onclick() {
								slot.occupant &&
									activeDeviceId(slot.occupant.id);
							},
							style: slot.occupant && "cursor: pointer",
							class:
								slot.occupant &&
								highlightDeviceId() &&
								slot.occupant.id === highlightDeviceId() &&
								"is-selected"
						},
						m("th", slot.id),
						m(
							"td",
							m(
								"p",
								m(ProgressIcon, {
									progress: slot.progress
								})
							)
						),
						m("td", slot.name),
						m(
							"td.has-text-right.has-text-light",
							occupant && occupant.id
						),
						m(
							"td.has-text-right",
							occupant &&
								m(
									"span.has-text-grey-light",
									occupant.asset_tag
								)
						)
					);
				})
			)
		);
	}
};
