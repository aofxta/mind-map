import { logger } from './config';
import { customizeFormat } from './customize-format';
import { MindMapModuleOpts } from './mind-map-main'
import { MIND_TYPE } from './constants'

export class MindMapDataProvider {
    jm: any;

    constructor(jm) {
        this.jm = jm;
    }

    init() {
        logger.debug('data.init');
    }

    reset() {
        logger.debug('data.reset');
    }

    load(mind_data, opts: MindMapModuleOpts) {
        let df = null;
        let mind = null;
        if (typeof mind_data === 'object') {
            if (!!mind_data.format) {
                df = mind_data.format;
            } else {
                df = MIND_TYPE.NODE_TREE;
            }
        } else {
            df = MIND_TYPE.FREE_MIND;
        }
        customizeFormat.setSelectable(opts.selectable)

        if (df === MIND_TYPE.NODE_ARRAY) {
            mind = customizeFormat.node_array.getMind(mind_data);
        } else if (df === MIND_TYPE.NODE_TREE) {
            mind = customizeFormat.nodeTree.getMind(mind_data);
        } else if (df === MIND_TYPE.FREE_MIND) {
            mind = customizeFormat.freemind.getMind(mind_data);
        } else {
            logger.warn('unsupported format');
        }
        return mind;
    }

    getData(data_format) {
        let data = null;
        if (data_format === MIND_TYPE.NODE_ARRAY) {
            data = customizeFormat.node_array.getData(this.jm.mind);
        } else if (data_format === MIND_TYPE.NODE_TREE) {
            data = customizeFormat.nodeTree.getData(this.jm.mind);
        } else if (data_format === MIND_TYPE.FREE_MIND) {
            data = customizeFormat.freemind.getData(this.jm.mind);
        } else {
            logger.error('unsupported ' + data_format + ' format');
        }
        return data;
    }
}
