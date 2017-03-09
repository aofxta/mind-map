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

class MindMapNode {
    id: string;
    index: string;
    topic: string;
    selected_type: string;
    data: Object;
    isroot: boolean;
    parent: Object;
    direction;
    expanded: boolean;
    children: Array<any>;
    _data: Object;

    static compare;
    static inherited;

    constructor(sId, iIndex, sTopic, oData, bIsRoot, oParent, eDirection, bExpanded, selectedType) {
        if (!sId) {
            logger.error('invalid nodeid');
            return;
        }
        if (typeof iIndex != 'number') {
            logger.error('invalid node index');
            return;
        }
        if (typeof bExpanded === 'undefined') {bExpanded = true;}
        this.id = sId;
        this.index = iIndex;
        this.topic = sTopic;
        this.selected_type = selectedType;
        this.data = oData || {};
        this.isroot = bIsRoot;
        this.parent = oParent;
        this.direction = eDirection;
        this.expanded = !!bExpanded;
        this.children = [];
        this._data = {};
    };

    show() {
        if (this.selected_type) {
            return '' + (this.selected_type || '') + ' / ' + this.topic;
        }
        return this.topic;
    }

    get_location() {
        const vd = this._data.view;
        return {
            x: vd.abs_x,
            y: vd.abs_y
        };
    }

,
    get_size() {
        const vd = this._data.view;
        return {
            w: vd.width,
            h: vd.height
        }
    }
}

MindMapNode.compare = (node1, node2) => {
    let r;
    const i1 = node1.index;
    const i2 = node2.index;
    if (i1 >= 0 && i2 >= 0) {
        r = i1 - i2;
    } else if (i1 == -1 && i2 == -1) {
        r = 0;
    } else if (i1 == -1) {
        r = 1;
    } else if (i2 == -1) {
        r = -1;
    } else {
        r = 0;
    }
    return r;
};

MindMapNode.inherited = (pnode, node) => {
    if (!!pnode && !!node) {
        if (pnode.id === node.id) {
            return true;
        }
        if (pnode.isroot) {
            return true;
        }
        const pid = pnode.id;
        let p = node;
        while (!p.isroot) {
            p = p.parent;
            if (p.id === pid) {
                return true;
            }
        }
    }
    return false;
};


class MindMapMind {
    name = null;
    author = null;
    version = null;
    root = null;
    selected = null;
    nodes = {};

    constructor() {

    }

    get_node(nodeid) {
        if (nodeid in this.nodes) {
            return this.nodes[nodeid];
        } else {
            logger.warn('the node[id=' + nodeid + '] can not be found');
            return null;
        }
    }

    set_root(nodeid, topic, data) {
        if (this.root == null) {
            this.root = new jm.node(nodeid, 0, topic, data, true);
            this._put_node(this.root);
        } else {
            logger.error('root node is already exist');
        }
    }

    add_node(parent_node, nodeid, topic, data, idx, direction, expanded) {
        console.log('3');
        if (!jm.util.is_node(parent_node)) {
            return this.add_node(this.get_node(parent_node), nodeid, topic, data, idx, direction, expanded);
        }
        const nodeindex = idx || -1;
        topic = '销售经理名称';
        const selectedType = '销售经理';

        if (!!parent_node) {
            //logger.debug(parent_node);
            let node = null;
            if (parent_node.isroot) {
                let d = jm.direction.right;
                if (isNaN(direction)) {
                    logger.info('direction :', direction);
                    const children = parent_node.children;
                    logger.info('children :', children);
                    const children_len = children.length;
                    let r = 0;
                    // for(var i=0;i<children_len;i++){if(children[i].direction === jm.direction.left){r--;}else{r++;}}
                    d = jm.direction.right
                } else {
                    logger.info('direction :', direction);
                    d = (direction != jm.direction.left) ? jm.direction.right : jm.direction.left;
                }
                node = new jm.node(nodeid, nodeindex, topic, data, false, parent_node, d, expanded, selectedType);
            } else {
                node
                    = new jm.node(nodeid, nodeindex, topic, data, false, parent_node, parent_node.direction, expanded, selectedType);
            }
            if (this._put_node(node)) {
                parent_node.children.push(node);
                this._reindex(parent_node);
            } else {
                logger.error('fail, the nodeid \'' + node.id + '\' has been already exist.');
                node = null;
            }
            return node;
        } else {
            logger.error('fail, the [node_parent] can not be found.');
            return null;
        }
    }

    insert_node_before(node_before, nodeid, topic, data) {
        if (!jm.util.is_node(node_before)) {
            return this.insert_node_before(this.get_node(node_before), nodeid, topic, data);
        }
        if (!!node_before) {
            const node_index = node_before.index - 0.5;
            return this.add_node(node_before.parent, nodeid, topic, data, node_index);
        } else {
            logger.error('fail, the [node_before] can not be found.');
            return null;
        }
    }


    get_node_before(node) {
        if (!node) {return null;}
        if (!jm.util.is_node(node)) {
            return this.get_node_before(this.get_node(node));
        }
        if (node.isroot) {return null;}
        const idx = node.index - 2;
        if (idx >= 0) {
            return node.parent.children[idx];
        } else {
            return null;
        }
    }


    insert_node_after(node_after, nodeid, topic, data) {
        if (!jm.util.is_node(node_after)) {
            return this.insert_node_after(this.get_node(node_after), nodeid, topic, data);
        }
        if (!!node_after) {
            const node_index = node_after.index + 0.5;
            return this.add_node(node_after.parent, nodeid, topic, data, node_index);
        } else {
            logger.error('fail, the [node_after] can not be found.');
            return null;
        }
    }

    get_node_after(node) {
        if (!node) {return null;}
        if (!jm.util.is_node(node)) {
            return this.get_node_after(this.get_node(node));
        }
        if (node.isroot) {return null;}
        const idx = node.index;
        const brothers = node.parent.children;
        if (brothers.length >= idx) {
            return node.parent.children[idx];
        } else {
            return null;
        }
    }

    move_node(node, beforeid, parentid, direction) {
        if (!jm.util.is_node(node)) {
            return this.move_node(this.get_node(node), beforeid, parentid, direction);
        }
        if (!parentid) {
            parentid = node.parent.id;
        }
        return this._move_node(node, beforeid, parentid, direction);
    }

,

    _flow_node_direction(node, direction) {
        if (typeof direction === 'undefined') {
            direction = node.direction;
        } else {
            node.direction = direction;
        }
        let len = node.children.length;
        while (len--) {
            this._flow_node_direction(node.children[len], direction);
        }
    }


    _move_node_internal(node, beforeid) {
        if (!!node && !!beforeid) {
            if (beforeid == '_last_') {
                node.index = -1;
                this._reindex(node.parent);
            } else if (beforeid == '_first_') {
                node.index = 0;
                this._reindex(node.parent);
            } else {
                const node_before = (!!beforeid) ? this.get_node(beforeid) : null;
                if (node_before != null && node_before.parent != null && node_before.parent.id == node.parent.id) {
                    node.index = node_before.index - 0.5;
                    this._reindex(node.parent);
                }
            }
        }
        return node;
    }

    _move_node(node, beforeid, parentid, direction) {
        if (!!node && !!parentid) {
            if (node.parent.id != parentid) {
                // remove from parent's children
                const sibling = node.parent.children;
                let si = sibling.length;
                while (si--) {
                    if (sibling[si].id == node.id) {
                        sibling.splice(si, 1);
                        break;
                    }
                }
                node.parent = this.get_node(parentid);
                node.parent.children.push(node);
            }

            if (node.parent.isroot) {
                if (direction == jsMind.direction.left) {
                    node.direction = direction;
                } else {
                    node.direction = jm.direction.right;
                }
            } else {
                node.direction = node.parent.direction;
            }
            this._move_node_internal(node, beforeid);
            this._flow_node_direction(node);
        }
        return node;
    }

    remove_node(node) {
        if (!jm.util.is_node(node)) {
            return this.remove_node(this.get_node(node));
        }
        if (!node) {
            logger.error('fail, the node can not be found');
            return false;
        }
        if (node.isroot) {
            logger.error('fail, can not remove root node');
            return false;
        }
        if (this.selected != null && this.selected.id == node.id) {
            this.selected = null;
        }
        // clean all subordinate nodes
        const children = node.children;
        let ci = children.length;
        while (ci--) {
            this.remove_node(children[ci]);
        }
        // clean all children
        children.length = 0;
        // remove from parent's children
        const sibling = node.parent.children;
        let si = sibling.length;
        while (si--) {
            if (sibling[si].id == node.id) {
                sibling.splice(si, 1);
                break;
            }
        }
        // remove from global nodes
        delete this.nodes[node.id];
        // clean all properties
        for (let k in node) {
            delete node[k];
        }
        // remove it's self
        node = null;
        //delete node;
        return true;
    }

    _put_node(node) {
        if (node.id in this.nodes) {
            logger.warn('the nodeid \'' + node.id + '\' has been already exist.');
            return false;
        } else {
            this.nodes[node.id] = node;
            return true;
        }
    }

    _reindex(node) {
        if (node instanceof jm.node) {
            node.children.sort(jm.node.compare);
            const length = node.children.length;
            for (let i = 0; i < length; i++) {
                node.children[i].index = i + 1;
            }
        }
    }
}
