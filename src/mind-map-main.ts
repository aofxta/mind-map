import * as _ from 'lodash';
import { customizeUtil } from './util';
import { ShortcutProvider } from './shortcut-provider';
import { VERSION, DEFAULT_OPTIONS, logger, $win } from './config';
import { MindMapDataProvider } from './data-provider';
import { LayoutProvider } from './layout-provider';
import { customizeFormat } from './customize-format';
import { ViewProvider } from './view-provider';

export interface MindMapModuleOpts {
    container?: Array<any>;
    mode?: any;
    layout?: any;
    support_html?: any;
    view?: any;
    shortcut?: any;
    editable?: boolean;
    default_event_handle?: any;
    theme?: any;
    depth?: number;
    hierarchy_rule?: { [propName: string]: { name: string, getChildren: any } };
}


export class MindMapMain {

    version: string = VERSION;
    opts: MindMapModuleOpts = {};
    options = this.opts;
    inited = false;
    mind = null;
    event_handles = [];
    static direction;
    static event_type;
    data;
    layout;
    view;
    shortcut;

    static plugin;
    static plugins;
    static register_plugin;
    static init_plugins;
    static _init_plugins;
    static show;


    constructor(options) {
        customizeUtil.json.merge(this.opts, DEFAULT_OPTIONS);
        customizeUtil.json.merge(this.opts, options);
        if (this.opts.container == null || this.opts.container.length == 0) {
            logger.error('the options.container should not be empty.');
            return;
        }
        this.init();
    }


    init() {
        if (this.inited) {return;}
        this.inited = true;

        const opts = this.options;

        const opts_layout = {
            mode: opts.mode,
            hspace: opts.layout.hspace,
            vspace: opts.layout.vspace,
            pspace: opts.layout.pspace
        };
        const opts_view = {
            container: opts.container,
            support_html: opts.support_html,
            hmargin: opts.view.hmargin,
            vmargin: opts.view.vmargin,
            line_width: opts.view.line_width,
            line_color: opts.view.line_color
        };
        // create instance of function provider
        this.data = new MindMapDataProvider(this);
        this.layout = new LayoutProvider(this, opts_layout);
        this.view = new ViewProvider(this, opts_view);
        this.shortcut = new ShortcutProvider(this, opts.shortcut);

        this.data.init();
        this.layout.init();
        this.view.init();
        this.shortcut.init();

        this._event_bind();

        MindMapMain.init_plugins(this);
    }

    enable_edit() {
        this.options.editable = true;
    }

    disable_edit() {
        this.options.editable = false;
    }

    // call enable_event_handle('dblclick')
    // options are 'mousedown', 'click', 'dblclick'
    enable_event_handle(event_handle) {
        this.options.default_event_handle['enable_' + event_handle + '_handle'] = true;
    }

    // call disable_event_handle('dblclick')
    // options are 'mousedown', 'click', 'dblclick'
    disable_event_handle(event_handle) {
        this.options.default_event_handle['enable_' + event_handle + '_handle'] = false;
    }

    get_editable() {
        return this.options.editable;
    }

    set_theme(theme) {
        const theme_old = this.options.theme;
        this.options.theme = (!!theme) ? theme : null;
        if (theme_old != this.options.theme) {
            this.view.reset_theme();
            this.view.reset_custom_style();
        }
    }

    _event_bind() {
        this.view.add_event(this, 'mousedown', this.mousedown_handle);
        this.view.add_event(this, 'click', this.click_handle);
        this.view.add_event(this, 'dblclick', this.dblclick_handle);
    }

    mousedown_handle(e) {
        if (!this.options.default_event_handle['enable_mousedown_handle']) {
            return;
        }
        const element = e.target || event.srcElement;
        const nodeid = this.view.get_binded_nodeid(element);
        if (!!nodeid) {
            this.select_node(nodeid);
        } else {
            this.select_clear();
        }
    }

    click_handle(e) {
        if (!this.options.default_event_handle['enable_click_handle']) {
            return;
        }
        const element = e.target || event.srcElement;
        const isexpander = this.view.is_expander(element);
        if (isexpander) {
            const nodeid = this.view.get_binded_nodeid(element);
            if (!!nodeid) {
                this.toggle_node(nodeid);
            }
        }
    }

    dblclick_handle(e) {
        if (!this.options.default_event_handle['enable_dblclick_handle']) {
            return;
        }
        if (this.get_editable()) {
            const element = e.target || event.srcElement;
            const nodeid = this.view.get_binded_nodeid(element);
            if (!!nodeid && nodeid !== 'root') {
                this.begin_edit(nodeid);
            }
        }
    }

    get_select_types_by_hierarchy_rule(node) {
        if (!this.options.hierarchy_rule) {
            return null;
        }
        const types = [];
        types.push(node.selected_type);
        const parentSelectType = node.parent.isroot ? 'root' : node.parent.selected_type;
        let current_rule = _.find(this.options.hierarchy_rule, {name: parentSelectType});
        if (!current_rule) {
            return null;
        }
        current_rule.getChildren().forEach(children => {
            types.push(children.name);
        });
        return types;
    }

    begin_edit(node) {
        if (!customizeUtil.is_node(node)) {
            return this.begin_edit(this.get_node(node));
        }
        if (this.get_editable()) {
            if (!!node) {
                this.view.edit_node_begin(node, this.get_select_types_by_hierarchy_rule(node));
            } else {
                logger.error('the node can not be found');
            }
        } else {
            logger.error('fail, this mind map is not editable.');
            return;
        }
    }

    end_edit() {
        this.view.edit_node_end();
    }

    toggle_node(node) {
        if (!customizeUtil.is_node(node)) {
            return this.toggle_node(this.get_node(node));
        }
        if (!!node) {
            if (node.isroot) {return;}
            this.view.save_location(node);
            this.layout.toggle_node(node);
            this.view.relayout();
            this.view.restore_location(node);
        } else {
            logger.error('the node can not be found.');
        }
    }

    expand_node(node) {
        if (!customizeUtil.is_node(node)) {
            return this.expand_node(this.get_node(node));
        }
        if (!!node) {
            if (node.isroot) {return;}
            this.view.save_location(node);
            this.layout.expand_node(node);
            this.view.relayout();
            this.view.restore_location(node);
        } else {
            logger.error('the node can not be found.');
        }
    }

    collapse_node(node) {
        if (!customizeUtil.is_node(node)) {
            return this.collapse_node(this.get_node(node));
        }
        if (!!node) {
            if (node.isroot) {return;}
            this.view.save_location(node);
            this.layout.collapse_node(node);
            this.view.relayout();
            this.view.restore_location(node);
        } else {
            logger.error('the node can not be found.');
        }
    }

    expand_all() {
        this.layout.expand_all();
        this.view.relayout();
    }

    collapse_all() {
        this.layout.collapse_all();
        this.view.relayout();
    }

    expand_to_depth(depth) {
        this.layout.expand_to_depth(depth);
        this.view.relayout();
    }

    _reset() {
        this.view.reset();
        this.layout.reset();
        this.data.reset();
    }

    _show(mind) {
        const m = mind || customizeFormat.node_array.example;

        this.mind = this.data.load(m);
        if (!this.mind) {
            logger.error('data.load error');
            return;
        } else {
            logger.debug('data.load ok');
        }

        this.view.load();
        logger.debug('view.load ok');

        this.layout.layout();
        logger.debug('layout.layout ok');

        this.view.show(true);
        logger.debug('view.show ok');

        this.invoke_event_handle(MindMapMain.event_type.show, { data: [mind] });
    }

    // show entrance
    show(mind) {
        this._reset();
        this._show(mind);
    }

    get_meta() {
        return {
            name: this.mind.name,
            author: this.mind.author,
            version: this.mind.version
        };
    }

    get_data(data_format?) {
        const df = data_format || 'node_tree';
        return this.data.get_data(df);
    }

    get_depth() {
        const currentData = this.get_data().data;
        const getDepth = (data) => {
            let depth = 1;
            if (data.children && data.children[0]) {
                const childrenDepth = [];
                const childrenLength = data.children.length;
                for (let i = 0; i < childrenLength; i++) {
                    childrenDepth.push(getDepth(data.children[i]));
                }
                return depth + _.max(childrenDepth);
            }
            return depth;
        };
        return getDepth(currentData);
    }

    get_root() {
        return this.mind.root;
    }

    get_node(nodeid) {
        return this.mind.get_node(nodeid);
    }

    add_node(parent_node, nodeid, topic, data) {
        if (this.options.depth && (parent_node.level >= this.options.depth)) {
            throw new Error('over depth');
        }
        if (this.get_editable()) {
            const node = this.mind.add_node(parent_node, nodeid, topic, data);
            if (!!node) {
                this.view.add_node(node);
                this.layout.layout();
                this.view.show(false);
                this.view.reset_node_custom_style(node);
                this.expand_node(parent_node);
                this.invoke_event_handle(MindMapMain.event_type.edit, {
                    evt: 'add_node',
                    data: [parent_node.id, nodeid, topic, data],
                    node: nodeid
                });
            }
            return node;
        } else {
            logger.error('fail, this mind map is not editable');
            return null;
        }
    }

    insert_node_before(node_before, nodeid, topic, data) {
        if (this.get_editable()) {
            const beforeid = customizeUtil.is_node(node_before) ? node_before.id : node_before;
            const node = this.mind.insert_node_before(node_before, nodeid, topic, data);
            if (!!node) {
                this.view.add_node(node);
                this.layout.layout();
                this.view.show(false);
                this.invoke_event_handle(MindMapMain.event_type.edit, {
                    evt: 'insert_node_before',
                    data: [beforeid, nodeid, topic, data],
                    node: nodeid
                });
            }
            return node;
        } else {
            logger.error('fail, this mind map is not editable');
            return null;
        }
    }

    insert_node_after(node_after, nodeid, topic, data) {
        if (this.get_editable()) {
            const node = this.mind.insert_node_after(node_after, nodeid, topic, data);
            if (!!node) {
                this.view.add_node(node);
                this.layout.layout();
                this.view.show(false);
                this.invoke_event_handle(MindMapMain.event_type.edit, {
                    evt: 'insert_node_after',
                    data: [node_after.id, nodeid, topic, data],
                    node: nodeid
                });
            }
            return node;
        } else {
            logger.error('fail, this mind map is not editable');
            return null;
        }
    }

    remove_node(node) {
        if (!customizeUtil.is_node(node)) {
            return this.remove_node(this.get_node(node));
        }
        if (this.get_editable()) {
            if (!!node) {
                if (node.isroot) {
                    logger.error('fail, can not remove root node');
                    return false;
                }
                const nodeid = node.id;
                const parentid = node.parent.id;
                const parent_node = this.get_node(parentid);
                this.view.save_location(parent_node);
                this.view.remove_node(node);
                this.mind.remove_node(node);
                this.layout.layout();
                this.view.show(false);
                this.view.restore_location(parent_node);
                this.invoke_event_handle(MindMapMain.event_type.edit, {
                    evt: 'remove_node',
                    data: [nodeid],
                    node: parentid
                });
            } else {
                logger.error('fail, node can not be found');
                return false;
            }
        } else {
            logger.error('fail, this mind map is not editable');
            return;
        }
    }

    update_node(nodeid, topic, selected_type) {
        if (this.get_editable()) {
            if (customizeUtil.text.is_empty(topic)) {
                logger.warn('fail, topic can not be empty');
                return;
            }
            const node = this.get_node(nodeid);
            if (!!node) {
                if (node.topic === topic && node.selected_type === selected_type) {
                    logger.info('nothing changed');
                    this.view.update_node(node);
                    return;
                }
                node.topic = topic;
                node.selected_type = selected_type;
                this.view.update_node(node);
                this.layout.layout();
                this.view.show(false);
                this.invoke_event_handle(MindMapMain.event_type.edit, {
                    evt: 'update_node',
                    data: [nodeid, topic],
                    node: nodeid
                });
            }
        } else {
            logger.error('fail, this mind map is not editable');
            return;
        }
    }

    move_node(nodeid, beforeid, parentid, direction) {
        if (this.get_editable()) {
            const node = this.mind.move_node(nodeid, beforeid, parentid, direction);
            if (!!node) {
                this.view.update_node(node);
                this.layout.layout();
                this.view.show(false);
                this.invoke_event_handle(MindMapMain.event_type.edit, {
                    evt: 'move_node',
                    data: [nodeid, beforeid, parentid, direction],
                    node: nodeid
                });
            }
        } else {
            logger.error('fail, this mind map is not editable');
            return;
        }
    }

    select_node(node) {
        if (!customizeUtil.is_node(node)) {
            return this.select_node(this.get_node(node));
        }
        if (!node || !this.layout.is_visible(node)) {
            return;
        }
        this.mind.selected = node;
        if (!!node) {
            this.view.select_node(node);
        }
    }

    get_selected_node() {
        if (!!this.mind) {
            return this.mind.selected;
        } else {
            return null;
        }
    }

    select_clear() {
        if (!!this.mind) {
            this.mind.selected = null;
            this.view.select_clear();
        }
    }

    is_node_visible(node) {
        return this.layout.is_visible(node);
    }

    find_node_before(node) {
        if (!customizeUtil.is_node(node)) {
            return this.find_node_before(this.get_node(node));
        }
        if (!node || node.isroot) {return null;}
        let n = null;
        if (node.parent.isroot) {
            const c = node.parent.children;
            let prev = null;
            let ni = null;
            for (let i = 0; i < c.length; i++) {
                ni = c[i];
                if (node.direction === ni.direction) {
                    if (node.id === ni.id) {
                        n = prev;
                    }
                    prev = ni;
                }
            }
        } else {
            n = this.mind.get_node_before(node);
        }
        return n;
    }

    find_node_after(node) {
        if (!customizeUtil.is_node(node)) {
            return this.find_node_after(this.get_node(node));
        }
        if (!node || node.isroot) {return null;}
        let n = null;
        if (node.parent.isroot) {
            const c = node.parent.children;
            let getthis = false;
            let ni = null;
            for (let i = 0; i < c.length; i++) {
                ni = c[i];
                if (node.direction === ni.direction) {
                    if (getthis) {
                        n = ni;
                        break;
                    }
                    if (node.id === ni.id) {
                        getthis = true;
                    }
                }
            }
        } else {
            n = this.mind.get_node_after(node);
        }
        return n;
    }

    set_node_color(nodeid, bgcolor, fgcolor) {
        if (this.get_editable()) {
            const node = this.mind.get_node(nodeid);
            if (!!node) {
                if (!!bgcolor) {
                    node.data['background-color'] = bgcolor;
                }
                if (!!fgcolor) {
                    node.data['foreground-color'] = fgcolor;
                }
                this.view.reset_node_custom_style(node);
            }
        } else {
            logger.error('fail, this mind map is not editable');
            return null;
        }
    }

    set_node_font_style(nodeid, size, weight, style) {
        if (this.get_editable()) {
            const node = this.mind.get_node(nodeid);
            if (!!node) {
                if (!!size) {
                    node.data['font-size'] = size;
                }
                if (!!weight) {
                    node.data['font-weight'] = weight;
                }
                if (!!style) {
                    node.data['font-style'] = style;
                }
                this.view.reset_node_custom_style(node);
                this.view.update_node(node);
                this.layout.layout();
                this.view.show(false);
            }
        } else {
            logger.error('fail, this mind map is not editable');
            return null;
        }
    }

    set_node_background_image(nodeid, image, width, height, rotation) {
        if (this.get_editable()) {
            const node = this.mind.get_node(nodeid);
            if (!!node) {
                if (!!image) {
                    node.data['background-image'] = image;
                }
                if (!!width) {
                    node.data['width'] = width;
                }
                if (!!height) {
                    node.data['height'] = height;
                }
                if (!!rotation) {
                    node.data['background-rotation'] = rotation;
                }
                this.view.reset_node_custom_style(node);
                this.view.update_node(node);
                this.layout.layout();
                this.view.show(false);
            }
        } else {
            logger.error('fail, this mind map is not editable');
            return null;
        }
    }

    set_node_background_rotation(nodeid, rotation) {
        if (this.get_editable()) {
            const node = this.mind.get_node(nodeid);
            if (!!node) {
                if (!node.data['background-image']) {
                    logger.error('fail, only can change rotation angle of node with background image');
                    return null;
                }
                node.data['background-rotation'] = rotation;
                this.view.reset_node_custom_style(node);
                this.view.update_node(node);
                this.layout.layout();
                this.view.show(false);
            }
        } else {
            logger.error('fail, this mind map is not editable');
            return null;
        }
    }

    resize() {
        this.view.resize();
    }

    // callback(type ,data)
    add_event_listener(callback) {
        if (typeof callback === 'function') {
            this.event_handles.push(callback);
        }
    }

    invoke_event_handle(type, data) {
        const j = this;
        $win.setTimeout(function () {
            j._invoke_event_handle(type, data);
        }, 0);
    }

    _invoke_event_handle(type, data) {
        const l = this.event_handles.length;
        for (let i = 0; i < l; i++) {
            this.event_handles[i](type, data);
        }
    }

}

MindMapMain.direction = { left: -1, center: 0, right: 1 };
MindMapMain.event_type = { show: 1, resize: 2, edit: 3, select: 4 };

MindMapMain.plugin = function (name, init) {
    this.name = name;
    this.init = init;
};

MindMapMain.plugins = [];

MindMapMain.register_plugin = function (plugin) {
    if (plugin instanceof MindMapMain.plugin) {
        MindMapMain.plugins.push(plugin);
    }
};

MindMapMain.init_plugins = function (sender) {
    $win.setTimeout(function () {
        MindMapMain._init_plugins(sender);
    }, 0);
};

MindMapMain._init_plugins = function (sender) {
    let l = MindMapMain.plugins.length;
    let fn_init = null;
    for (let i = 0; i < l; i++) {
        fn_init = MindMapMain.plugins[i].init;
        if (typeof fn_init === 'function') {
            fn_init(sender);
        }
    }
};

// quick way
MindMapMain.show = function (options, mind) {
    let _jm = new MindMapMain(options);
    _jm.show(mind);
    return _jm;
};
