import { logger } from './config';
interface NodeData {
    view?: NodeView;
}

export interface NodeView {
    abs_x: string;
    abs_y: string;
    height: string;
    width: string;
}

export class MindMapNode {
    id: string;
    index: any;
    topic: string;
    selected_type: string;
    data: { is_created?: boolean };
    isroot: boolean;
    level: number;
    parent: MindMapNode;
    direction;
    expanded: boolean;
    children: Array<any>;
    is_created: boolean;
    private _data: NodeData;

    static compare;
    static inherited;

    constructor(sId, iIndex, sTopic, oData, bIsRoot, oParent?, eDirection?, bExpanded?, selectedType?, level?) {
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
        this.level = level;
        this.children = [];
        this._data = {};
        this.is_created = this.data.is_created;
        if (this.isroot) {
            this.level = 1;
        }
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
