var m = require("mithril");
var Rack = require("../models/Rack");

var allRacks = {
    oninit: Rack.loadRooms,
    view: function() {
        return m(".room-list", Object.keys(Rack.rackRooms).map(
          function(roomName) {
            return [
              m("h3.room-list-header", roomName),
              m(".rack-list", Rack.rackRooms[roomName].map(
                function(rack) {
                  return m("a.rack-list-item",
                    {href: "/rack/" + rack.id, oncreate: m.route.link},
                    "Name: " + rack.name + ", Role: "
                      + rack.role + ", Size: " + rack.size
                  );
              }))

            ];
          })
        );
    }
};

// Focus on the next Slot input when Enter is pressed.
function enterAsTab(e) {
    try {
        var nextInput = e.target.parentNode.parentNode
                .nextSibling.lastChild.lastChild;
        if (e.which == 13 && nextInput) {
                nextInput.focus();
                e.preventDefault();
            }
    }
    catch (e){ }
}

var rackLayoutTable = { view: function () {
    return m("table.pure-table.pure-table-horizontal.pure-table-striped", [
        m("thead", m("tr", [
            m("th", "Slot number"),
            m("th", "Name"),
            m("th", "Alias"),
            m("th", "Vendor"),
            m("th", "Size"),
            m("th", "Device")
        ])),
        m("tbody",
            Object.keys(Rack.current.slots || {}).reverse().map(function(slot) {
                return m("tr", [
                    m("td", slot),
                    m("td", Rack.current.slots[slot].name),
                    m("td", Rack.current.slots[slot].alias),
                    m("td", Rack.current.slots[slot].vendor),
                    m("td", Rack.current.slots[slot].size),
                    m("td",
                        m("input[type=text][placeholder=Unassigned]",
                            { oninput:
                                m.withAttr("value",
                                    function(value) {
                                        Rack.current.slots[slot].occupant = value;
                                    }
                                ),
                                id: "slot-" + slot,
                                onkeypress: enterAsTab,
                                value: Rack.current.slots[slot].occupant
                            }
                        )
                    )
                ]);
            }))
    ]);
} };

var rackLayout = {
    oninit: function(vnode) { Rack.load(vnode.attrs.id) },
    view: function() {
        return m(".pure-g", [
            m(".pure-u-1-3", m("h3", "Datacenter")),
            m(".pure-u-1-3", m("h3", "Rack Name")),
            m(".pure-u-1-3", m("h3", "Rack Role")),
            m(".pure-u-1-3", Rack.current.datacenter),
            m(".pure-u-1-3", Rack.current.name),
            m(".pure-u-1-3", Rack.current.role),
            m(".pure-u-1", 
                m("form.pure-form",
                    { onsubmit: function (e) {
                        e.preventDefault; Rack.assignDevices(Rack.current);
                    } },
                [
                    m("button.pure-button.pure-button-primary[type=submit]", "Assign Devices"),
                    m(rackLayoutTable),
                ])
            )
        ]);
    }
};

module.exports = { allRacks: allRacks, rackLayout: rackLayout };
