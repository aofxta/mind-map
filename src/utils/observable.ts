// sample observable

export interface IObserver {
    closed?: boolean;
    next: (value?) => void;
    error: (err: any) => void;
    complete: () => void;
}

export class Observable {
    subscriber

    constructor (subscribe: (ob: IObserver) => void) {
        this.subscriber = subscribe
    }

    pipe (...operations) {
        return operations.reduce((prev, fn) => fn(prev), this)
    }

    subscribe (observer) {
        const defaultObserver = {
            next: () => {
            },
            error: () => {
            },
            complete: () => {
            },
        }
        if (typeof observer === 'function') {
            return this.subscriber({ ...defaultObserver, next: observer })
        } else {
            return this.subscriber({ ...defaultObserver, ...observer })
        }
    }
}
