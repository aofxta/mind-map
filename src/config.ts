export const $w: { [propName: string]: any } = window;

export const NAME: string = 'jsMind';
export const VERSION: string = '0.0.7';
export const AUTHOR = '';

export const logger = console;

export const DEFAULT_OPTIONS = {
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

export const $d = $w.document;
export const $g = function (id) {
    return $d.getElementById(id);
};
export const $c = function (tag) {
    return $d.createElement(tag);
};
export const $t = function (n, t) {
    if (n.hasChildNodes()) { n.firstChild.nodeValue = t; } else { n.appendChild($d.createTextNode(t)); }
};
export const $h = function (n, t) {
    n.innerHTML = t;
};
