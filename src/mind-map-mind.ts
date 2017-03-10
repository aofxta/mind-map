import { logger } from './config';
import { MindMapNode } from './mind-map-node';
import { customizeUtil } from './util';
import { MindMapMain } from './mind-map-main';

export class MindMapMind {
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
            this.root = new MindMapNode(nodeid, 0, topic, data, true);
            this._put_node(this.root);
        } else {
            logger.error('root node is already exist');
        }
    }

    add_node(parent_node, nodeid, topic, data, idx, direction?, expanded?) {
        console.log('3');
        if (!customizeUtil.is_node(parent_node)) {
            return this.add_node(this.get_node(parent_node), nodeid, topic, data, idx, direction, expanded);
        }
        const nodeindex = idx || -1;
        topic = '销售经理名称';
        const selectedType = '销售经理';

        if (!!parent_node) {
            //logger.debug(parent_node);
            let node = null;
            if (parent_node.isroot) {
                let d = MindMapMain.direction.right;
                if (isNaN(direction)) {
                    logger.info('direction :', direction);
                    const children = parent_node.children;
                    logger.info('children :', children);
                    const children_len = children.length;
                    let r = 0;
                    // for(var i=0;i<children_len;i++){if(children[i].direction === jm.direction.left){r--;}else{r++;}}
                    d = MindMapMain.direction.right
                } else {
                    logger.info('direction :', direction);
                    d = (direction != MindMapMain.direction.left) ?
                        MindMapMain.direction.right :
                        MindMapMain.direction.left;
                }
                node = new MindMapNode(nodeid, nodeindex, topic, data, false, parent_node, d, expanded, selectedType);
            } else {
                node
                    = new MindMapNode(nodeid, nodeindex, topic, data, false, parent_node, parent_node.direction, expanded, selectedType);
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
        if (!customizeUtil.is_node(node_before)) {
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
        if (!customizeUtil.is_node(node)) {
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
        if (!customizeUtil.is_node(node_after)) {
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
        if (!customizeUtil.is_node(node)) {
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
        if (!customizeUtil.is_node(node)) {
            return this.move_node(this.get_node(node), beforeid, parentid, direction);
        }
        if (!parentid) {
            parentid = node.parent.id;
        }
        return this._move_node(node, beforeid, parentid, direction);
    }

    _flow_node_direction(node, direction?) {
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
                if (direction == MindMapMain.direction.left) {
                    node.direction = direction;
                } else {
                    node.direction = MindMapMain.direction.right;
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
        if (!customizeUtil.is_node(node)) {
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
        if (node instanceof MindMapNode) {
            node.children.sort(MindMapNode.compare);
            const length = node.children.length;
            for (let i = 0; i < length; i++) {
                node.children[i].index = i + 1;
            }
        }
    }
}
