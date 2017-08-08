var m = require("mithril");

var Rack = require("./views/Rack");
var Layout = require("./views/Layout");
var Login = require("./views/Login");
var Problem = require("./views/Problem");

m.route(document.body, "/login", {
    "/rack": {
        render: function() {
            return m(Layout,
              m(Rack.allRacks,
                m(".select-rack.pure-u-2-3", "Select a rack in the sidebar")
              ));
        }
    },
    "/rack/:id": {
        render: function(vnode) {
            return m(Layout,
              m(Rack.allRacks,
                m(Rack.rackLayout, vnode.attrs))
            );
        }
    },
    "/problem": {
        render: function(vnode) {
            return m(Layout,
              m(Problem.selectProblemDevice)
            );
        }
    },
    "/problem/:id": {
        render: function(vnode) {
            return m(Layout,
              m(Problem.selectProblemDevice,
                m(Problem.showDevice, vnode.attrs)
              )
            );
        }
    },
    "/login": Login
});
