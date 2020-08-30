import { IObserver } from './observable'
import { Subject } from './subject'

export class SubjectSubscription {
    closed: boolean = false;

    constructor(public subject: Subject, public subscriber: IObserver) {
    }

    unsubscribe() {
        if (this.closed) {
            return;
        }

        this.closed = true;

        const subject = this.subject;
        const observers = subject.observers;

        this.subject = null;

        if (!observers || observers.length === 0) {
            return;
        }

        const subscriberIndex = observers.indexOf(this.subscriber);

        if (subscriberIndex !== -1) {
            observers.splice(subscriberIndex, 1);
        }
    }
}
