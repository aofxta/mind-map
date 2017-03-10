import { logger } from './config';
import { customizeFormat } from './customize-format';

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

    load(mind_data) {
        let df = null;
        let mind = null;
        if (typeof mind_data === 'object') {
            if (!!mind_data.format) {
                df = mind_data.format;
            } else {
                df = 'node_tree';
            }
        } else {
            df = 'freemind';
        }

        if (df == 'node_array') {
            mind = customizeFormat.node_array.get_mind(mind_data);
        } else if (df == 'node_tree') {
            mind = customizeFormat.node_tree.get_mind(mind_data);
        } else if (df == 'freemind') {
            mind = customizeFormat.freemind.get_mind(mind_data);
        } else {
            logger.warn('unsupported format');
        }
        return mind;
    }

    get_data(data_format) {
        let data = null;
        if (data_format == 'node_array') {
            data = customizeFormat.node_array.get_data(this.jm.mind);
        } else if (data_format == 'node_tree') {
            data = customizeFormat.node_tree.get_data(this.jm.mind);
        } else if (data_format == 'freemind') {
            data = customizeFormat.freemind.get_data(this.jm.mind);
        } else {
            logger.error('unsupported ' + data_format + ' format');
        }
        return data;
    }
}

