import * as _ from 'lodash';
import { $create, $document, $get, $html, $text, logger } from './config';
import { customizeUtil } from './util';
import { MindMapMain } from './mind-map-main';

export class ViewProvider {
    opts: any;
    jm: any;
    layout: any;
    container = null;
    e_panel = null;
    e_nodes = null;
    e_canvas = null;
    canvas_ctx = null;
    size = { w: 0, h: 0 };
    selected_node = null;
    editing_node = null;
    previous_node = null;

    e_editor;
    e_select;
    current_select;
    actualZoom;
    zoomStep;
    minZoom;
    maxZoom;

    constructor(jm, options) {
        this.opts = options;
        this.jm = jm;
        this.layout = jm.layout;

        this.jm.mindMapDataReceiver.subscribe(data => {
            this.editNodeEnd(data);
        });
    }

    static get_select_option(value) {
        const e_option = $create('option');
        e_option.value = value;
        e_option.appendChild($document.createTextNode(value));
        return e_option;
    };

    init() {
        logger.debug('view.init');

        this.container = $get(this.opts.container);
        if (!this.container) {
            logger.error('the options.view.container was not be found in dom');
            return;
        }

        this.initView();
    }

    initView() {
        this.e_panel = $create('div');
        this.e_canvas = $create('canvas');
        this.e_nodes = $create('jmnodes');

        this.e_panel.className = 'jsmind-inner';
        this.e_panel.appendChild(this.e_canvas);
        this.e_panel.appendChild(this.e_nodes);

        this.actualZoom = 1;
        this.zoomStep = 0.1;
        this.minZoom = 0.5;
        this.maxZoom = 2;

        this.addEventToCanvas();
        this.initSelect();
        this.initEditor();

        this.container.appendChild(this.e_panel);
        this.canvas_ctx = this.e_canvas.getContext('2d');
    }

    initSelect() {
        this.e_select = $create('select');
        this.e_select.value = this.opts.selectedOptions[0];
        this.opts.selectedOptions.forEach((ele) => {
            this.e_select.appendChild(ViewProvider.get_select_option(ele));
        });
        this.addEventToSelect(this.e_select);
    }

    initEditor() {
        this.e_editor = $create('input');
        this.e_editor.className = 'jsmind-editor';
        this.e_editor.type = 'text';
        this.addEventToEditor(this.e_editor);
    }

    addEventToCanvas() {
        customizeUtil.dom.add_event(this.e_nodes, 'click', (e) => {
            this.editNodeEnd();
            e.stopPropagation();
        });
    }

    addEventToEditor(editor) {
        customizeUtil.dom.add_event(editor, 'keydown', (e) => {
            const evt = e || event;
            if (evt.keyCode == 13) {
                this.editNodeEnd();
                evt.stopPropagation();
            }
        });
        customizeUtil.dom.add_event(editor, 'blur', () => {
            this.editNodeEnd();
        });
        customizeUtil.dom.add_event(editor, 'click', (e) => {
            const evt = e || event;
            evt.stopPropagation();
        });
        customizeUtil.dom.add_event(editor, 'focus', (e) => {
            const evt = e || event;
            evt.stopPropagation();
            const type = this.editing_node.selected_type;
            if (this.getIsInteractSelectedValue(type)) {
                this.jm.mindMapDataTransporter.next(type);
            }
        });

    }

    addEventToSelect(select) {
        customizeUtil.dom.add_event(select, 'click', (e) => {
            const evt = e || event;
            evt.stopPropagation();
        });
        customizeUtil.dom.add_event(select, 'change', (e) => {
            const evt = e || event;
            evt.stopPropagation();
            const value = _.get(evt, 'srcElement.value');
            if (this.getIsInteractSelectedValue(value)) {
                this.jm.mindMapDataTransporter.next(value);
            }
        });
    }


    getIsInteractSelectedValue(value) {
        return this.jm.options.hasInteraction && value === _.last(this.jm.options.selectedOptions);
    }


    addEvent(obj, event_name, event_handle) {
        customizeUtil.dom.add_event(this.e_nodes, event_name, function (e) {
            const evt = e || event;
            event_handle.call(obj, evt);
        });
    }

    getBindedNodeId(element) {
        if (element == null) {
            return null;
        }
        const tagName = element.tagName.toLowerCase();
        if (tagName == 'jmnodes' || tagName == 'body' || tagName == 'html') {
            return null;
        }
        if (tagName == 'jmnode' || tagName == 'jmexpander') {
            return element.getAttribute('nodeid');
        } else {
            return this.getBindedNodeId(element.parentElement);
        }
    }

    isExpander(element) {
        return (element.tagName.toLowerCase() == 'jmexpander');
    }

    reset() {
        logger.debug('view.reset');
        this.selected_node = null;
        this.clearLines();
        this.clearNodes();
        this.resetTheme();
    }

    resetTheme() {
        const theme_name = this.jm.options.theme;
        if (!!theme_name) {
            this.e_nodes.className = 'theme-' + theme_name;
        } else {
            this.e_nodes.className = '';
        }
    }

    resetCustomStyle() {
        const nodes = this.jm.mind.nodes;
        for (let nodeid in nodes) {
            this.resetNodeCustomStyle(nodes[nodeid]);
        }
    }

    load() {
        logger.debug('view.load');
        this.initNodes();
    }

    expandSize() {
        const min_size = this.layout.getMinSize();
        let min_width = min_size.w + this.opts.hmargin * 2;
        let min_height = min_size.h + this.opts.vmargin * 2;
        let client_w = this.e_panel.clientWidth;
        let client_h = this.e_panel.clientHeight;
        if (client_w < min_width) {client_w = min_width;}
        if (client_h < min_height) {client_h = min_height;}
        this.size.w = client_w;
        this.size.h = client_h;
    }

    initNodesSize(node) {
        const view_data = node._data.view;
        view_data.width = view_data.element.clientWidth;
        view_data.height = view_data.element.clientHeight;
    }

    initNodes() {
        const nodes = this.jm.mind.nodes;
        const doc_frag = $document.createDocumentFragment();
        for (let nodeid in nodes) {
            this.createNodeElement(nodes[nodeid], doc_frag);
        }
        this.e_nodes.appendChild(doc_frag);
        for (let nodeid in nodes) {
            this.initNodesSize(nodes[nodeid]);
        }
    }

    addNode(node) {
        this.createNodeElement(node, this.e_nodes);
        this.initNodesSize(node);
    }

    createNodeElement(node, parent_node) {
        let view_data = null;
        if ('view' in node._data) {
            view_data = node._data.view;
        } else {
            view_data = {};
            node._data.view = view_data;
        }

        const d = $create('jmnode');
        if (node.isroot) {
            d.className = 'root';
        } else {
            let d_e = $create('jmexpander');
            $text(d_e, '-');
            d_e.setAttribute('nodeid', node.id);
            d_e.style.visibility = 'hidden';
            parent_node.appendChild(d_e);
            view_data.expander = d_e;
        }
        if (!!node.topic) {
            if (this.opts.supportHtml) {
                $html(d, node.show());
            } else {
                $text(d, node.show());
            }
        }
        d.setAttribute('nodeid', node.id);
        d.style.visibility = 'hidden';
        this._resetNodeCustomStyle(d, node.data);
        parent_node.appendChild(d);
        view_data.element = d;
    }

    removeNode(node) {
        if (this.selected_node != null && this.selected_node.id == node.id) {
            this.selected_node = null;
        }
        if (this.editing_node != null && this.editing_node.id == node.id) {
            node._data.view.element.removeChild(this.e_editor);
            this.editing_node = null;
        }
        const children = node.children;
        let i = children.length;
        while (i--) {
            this.removeNode(children[i]);
        }
        if (node._data.view) {
            const element = node._data.view.element;
            const expander = node._data.view.expander;
            this.e_nodes.removeChild(element);
            this.e_nodes.removeChild(expander);
            node._data.view.element = null;
            node._data.view.expander = null;
        }
    }

    updateNode(node) {
        const view_data = node._data.view;
        const element = view_data.element;
        if (!!node.topic) {
            if (this.opts.supportHtml) {
                $html(element, node.show());
            } else {
                $text(element, node.show());
            }
        }
        view_data.width = element.clientWidth;
        view_data.height = element.clientHeight;
    }

    selectNode(node) {
        if (!!this.selected_node) {
            this.selected_node._data.view.element.className =
                this.selected_node._data.view.element.className.replace(/\s*selected\s*/i, '');
            this.resetNodeCustomStyle(this.selected_node);
        }
        if (!!node) {
            this.selected_node = node;
            node._data.view.element.className += ' selected';
            this.clearNodeCustomStyle(node);
        }
    }

    selectClear() {
        this.selectNode(null);
    }

    getEditingNode() {
        return this.editing_node;
    }

    isEditing() {
        return (!!this.editing_node);
    }

    createSelectByTypes(types) {
        const new_select = $create('select');
        types.slice(1).forEach(type => {
            new_select.appendChild(ViewProvider.get_select_option(type));
        });
        this.addEventToSelect(new_select);

        new_select.value = types[0];
        return new_select;
    }

    // when db click
    editNodeBegin(node, types) {
        if (!node.topic) {
            logger.warn("don't edit image nodes");
            return;
        }
        if (this.editing_node != null) {
            this.editNodeEnd();
        }
        this.editing_node = node;
        this.previous_node = node;
        const view_data = node._data.view;
        const element = view_data.element;
        const topic = node.topic;
        const ncs = getComputedStyle(element);
        this.e_editor.value = topic;
        this.e_editor.style.width
            = (element.clientWidth - parseInt(ncs.getPropertyValue('padding-left')) - parseInt(ncs.getPropertyValue('padding-right'))) + 'px';
        element.innerHTML = '';
        if (types) {
            this.current_select = this.createSelectByTypes(types);
        } else {
            this.current_select = this.e_select;
        }
        element.appendChild(this.current_select);
        element.appendChild(this.e_editor);
        element.style.zIndex = 5;
        // this.e_editor.focus();
        // this.e_editor.select();
    }

    editNodeEnd(value?) {
        if (this.editing_node != null) {
            const node = this.editing_node;
            this.editing_node = null;
            const view_data = node._data.view;
            const element = view_data.element;
            if (value) {
                this.e_editor.value = value;
            }
            const topic = this.e_editor.value;
            const selected_type = this.current_select.value;
            element.style.zIndex = 'auto';
            element.removeChild(this.e_editor);
            element.removeChild(this.current_select);
            if (customizeUtil.text.is_empty(topic) ||
                customizeUtil.text.is_empty(selected_type) ||
                (node.topic === topic && node.selected_type === selected_type)) {
                if (this.opts.supportHtml) {
                    $html(element, node.show());
                } else {
                    $text(element, node.show());
                }
            } else {
                this.jm.updateNode(node.id, topic, selected_type);
            }
        } else if (value) {
            this.jm.updateNode(this.previous_node.id, value, this.previous_node.selected_type);
        }
    }

    getViewOffset() {
        const bounds = this.layout.bounds;
        const _x = (this.size.w - bounds.e - bounds.w) / 2;
        const _y = this.size.h / 2;
        return { x: _x, y: _y };
    }

    resize() {
        this.e_canvas.width = 1;
        this.e_canvas.height = 1;
        this.e_nodes.style.width = '1px';
        this.e_nodes.style.height = '1px';

        this.expandSize();
        this._show();
    }

    _show() {
        this.e_canvas.width = this.size.w;
        this.e_canvas.height = this.size.h;
        this.e_nodes.style.width = this.size.w + 'px';
        this.e_nodes.style.height = this.size.h + 'px';
        this.showNodes();
        this.showLines();
        //this.layout.cache_valid = true;
        this.jm.invokeEventHandleNextTick(MindMapMain.eventType.resize, { data: [] });
    }

    zoomIn() {
        return this.setZoom(this.actualZoom + this.zoomStep);
    }

    zoomOut() {
        return this.setZoom(this.actualZoom - this.zoomStep);
    }

    setZoom(zoom) {
        if ((zoom < this.minZoom) || (zoom > this.maxZoom)) {
            return false;
        }
        this.actualZoom = zoom;
        for (let i = 0; i < this.e_panel.children.length; i++) {
            this.e_panel.children[i].style.transform = 'scale(' + zoom + ')';
        }
        ;
        this.show(true);
        return true;

    }

    _centerRoot() {
        // center root node
        const outer_w = this.e_panel.clientWidth;
        const outer_h = this.e_panel.clientHeight;
        if (this.size.w > outer_w) {
            const _offset = this.getViewOffset();
            this.e_panel.scrollLeft = _offset.x - outer_w / 2;
        }
        if (this.size.h > outer_h) {
            this.e_panel.scrollTop = (this.size.h - outer_h) / 2;
        }
    }

    show(keep_center) {
        logger.debug('view.show');
        this.expandSize();
        this._show();
        if (!!keep_center) {
            this._centerRoot();
        }
    }

    relayout() {
        this.expandSize();
        this._show();
    }

    saveLocation(node) {
        const vd = node._data.view;
        vd._saved_location = {
            x: parseInt(vd.element.style.left) - this.e_panel.scrollLeft,
            y: parseInt(vd.element.style.top) - this.e_panel.scrollTop,
        };
    }

    restoreLocation(node) {
        const vd = node._data.view;
        this.e_panel.scrollLeft = parseInt(vd.element.style.left) - vd._saved_location.x;
        this.e_panel.scrollTop = parseInt(vd.element.style.top) - vd._saved_location.y;
    }

    clearNodes() {
        const mind = this.jm.mind;
        if (mind == null) {
            return;
        }
        const nodes = mind.nodes;
        let node = null;
        for (let nodeid in nodes) {
            node = nodes[nodeid];
            node._data.view.element = null;
            node._data.view.expander = null;
        }
        this.e_nodes.innerHTML = '';
    }

    showNodes() {
        const nodes = this.jm.mind.nodes;
        let node = null;
        let node_element = null;
        let operationArea = null;
        let expander = null;
        let p = null;
        let p_expander = null;
        let expander_text = '-';
        let view_data = null;
        const _offset = this.getViewOffset();
        for (let nodeid in nodes) {
            node = nodes[nodeid];
            view_data = node._data.view;
            node_element = view_data.element;
            operationArea = view_data.operationArea;
            expander = view_data.expander;
            if (!this.layout.isVisible(node)) {
                node_element.style.display = 'none';
                expander.style.display = 'none';
                continue;
            }
            this.resetNodeCustomStyle(node);
            p = this.layout.getNodePoint(node);
            view_data.abs_x = _offset.x + p.x;
            view_data.abs_y = _offset.y + p.y;
            node_element.style.left = (_offset.x + p.x) + 'px';
            node_element.style.top = (_offset.y + p.y) + 'px';
            node_element.style.display = '';
            node_element.style.visibility = 'visible';

            if (operationArea) {
                operationArea.style.left = (_offset.x + p.x) + 'px';
                operationArea.style.top = (_offset.y + p.y + 43) + 'px';
            }
            if (!node.isroot && node.children.length > 0) {
                expander_text = node.expanded ? '-' : '+';
                p_expander = this.layout.getExpanderPoint(node);
                expander.style.left = (_offset.x + p_expander.x) + 'px';
                expander.style.top = (_offset.y + p_expander.y) + 'px';
                expander.style.display = '';
                expander.style.visibility = 'visible';
                $text(expander, expander_text);
            }
            if (!node.isroot) {

            }
            // hide expander while all children have been removed
            if (!node.isroot && node.children.length == 0) {
                expander.style.display = 'none';
                expander.style.visibility = 'hidden';
            }
        }
    }

    resetNodeCustomStyle(node) {
        this._resetNodeCustomStyle(node._data.view.element, node.data);
    }

    _resetNodeCustomStyle(node_element, node_data) {
        if ('background-color' in node_data) {
            node_element.style.backgroundColor = node_data['background-color'];
        }
        if ('foreground-color' in node_data) {
            node_element.style.color = node_data['foreground-color'];
        }
        if ('width' in node_data) {
            node_element.style.width = node_data['width'] + 'px';
        }
        if ('height' in node_data) {
            node_element.style.height = node_data['height'] + 'px';
        }
        if ('font-size' in node_data) {
            node_element.style.fontSize = node_data['font-size'] + 'px';
        }
        if ('font-weight' in node_data) {
            node_element.style.fontWeight = node_data['font-weight'];
        }
        if ('font-style' in node_data) {
            node_element.style.fontStyle = node_data['font-style'];
        }
        if ('color' in node_data) {
            node_element.style.color = node_data['color'];
        }
        if ('background-image' in node_data) {
            const backgroundImage = node_data['background-image'];
            if (backgroundImage.startsWith('data') && node_data['width'] && node_data['height']) {
                const img = new Image();

                img.onload = function () {
                    const c = $create('canvas');
                    c.width = node_element.clientWidth;
                    c.height = node_element.clientHeight;
                    const img = this;
                    if (c.getContext) {
                        const ctx = c.getContext('2d');
                        ctx.drawImage(img, 2, 2, node_element.clientWidth, node_element.clientHeight);
                        const scaledImageData = c.toDataURL();
                        node_element.style.backgroundImage = 'url(' + scaledImageData + ')';
                    }
                };
                img.src = backgroundImage;

            } else {
                node_element.style.backgroundImage = 'url(' + backgroundImage + ')';
            }
            node_element.style.backgroundSize = '99%';

            if ('background-rotation' in node_data) {
                node_element.style.transform = 'rotate(' + node_data['background-rotation'] + 'deg)';
            }

        }
    }

    clearNodeCustomStyle(node) {
        const node_element = node._data.view.element;
        node_element.style.backgroundColor = "";
        node_element.style.color = "";
    }

    clearLines(canvas_ctx?) {
        const ctx = canvas_ctx || this.canvas_ctx;
        customizeUtil.canvas.clear(ctx, 0, 0, this.size.w, this.size.h);
    }

    showLines(canvas_ctx?) {
        this.clearLines(canvas_ctx);
        const nodes = this.jm.mind.nodes;
        let node = null;
        let pin = null;
        let pout = null;
        const _offset = this.getViewOffset();
        for (let nodeid in nodes) {
            node = nodes[nodeid];
            if (!!node.isroot) {continue;}
            if (('visible' in node._data.layout) && !node._data.layout.visible) {continue;}
            pin = this.layout.getNodePointIn(node);
            pout = this.layout.getNodePointOut(node.parent);
            this.drawLine(pout, pin, _offset, canvas_ctx);
        }
    }

    drawLine(pin, pout, offset, canvas_ctx) {
        let ctx = canvas_ctx || this.canvas_ctx;
        ctx.strokeStyle = this.opts.lineColor;
        ctx.lineWidth = this.opts.lineWidth;
        ctx.lineCap = 'round';

        customizeUtil.canvas.bezierto(
            ctx,
            pin.x + offset.x,
            pin.y + offset.y,
            pout.x + offset.x,
            pout.y + offset.y);
    }
}


