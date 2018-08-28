import m from "mithril";

import { conchApi } from "config";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default {
	view: ({ attrs, children: [contentView] }) => [
		m(Navbar, attrs),
		m(
			".section",
			m(
				".columns",
				m(
					".column.is-2",
					m(Sidebar, {
						user: attrs.user
					})
				),
				m(".column.is-10", contentView)
			)
		)
	]
};
