const $w = window;

const __name__: string = 'jsMind';
// library version
const __version__: string = '0.4a';
// author
const __author__ = 'wfsovereign';

// an noop function define
let _noop = function () {
};
const logger = console;

// check global constiables
// if (typeof $w[__name__] != 'undefined') {
//     logger.log(__name__ + ' has been already exist.');
//     return;
// }

const DEFAULT_OPTIONS = {
    container: '',   // id of the container
    editable: false, // you can change it in your options
    theme: null,
    mode: 'full',     // full or side
    support_html: true,

    view: {
        hmargin: 100,
        vmargin: 50,
        line_width: 2,
        line_color: '#555'
    },
    layout: {
        hspace: 30,
        vspace: 20,
        pspace: 13
    },
    default_event_handle: {
        enable_mousedown_handle: true,
        enable_click_handle: true,
        enable_dblclick_handle: true
    },
    shortcut: {
        enable: true,
        handles: {},
        mapping: {
            addchild: 45, // Insert
            addbrother: 13, // Enter
            editnode: 113,// F2
            delnode: 46, // Delete
            toggle: 32, // Space
            left: 37, // Left
            up: 38, // Up
            right: 39, // Right
            down: 40, // Down
        }
    },
};

const $d = $w.document;
const $g = function (id) {
    return $d.getElementById(id);
};
const $c = function (tag) {
    return $d.createElement(tag);
};
const $t = function (n, t) {
    if (n.hasChildNodes()) { n.firstChild.nodeValue = t; } else { n.appendChild($d.createTextNode(t)); }
};
const $h = function (n, t) {
    n.innerHTML = t;
};
if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (p) {
        return this.slice(0, p.length) === p;
    };
}


class MindMapModule {

    version: string = __version__;
    opts: { container: Array<any> } = {};
    options = this.opts;
    inited = false;
    mind = null;
    event_handles = [];
    direction = { left: -1, center: 0, right: 1 };
    event_type = { show: 1, resize: 2, edit: 3, select: 4 };

    constructor() {

        if (this.opts.container == null || this.opts.container.length == 0) {
            logger.error('the options.container should not be empty.');
            return;
        }
    }
}


