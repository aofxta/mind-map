// sample subject

import { Observable } from './observable'
import { SubjectSubscription } from './subject-subscription'

const defaultObserver = {
    next: () => {
    },
    error: () => {
    },
    complete: () => {
    },
}

export class Subject {
    observer
    observers = []

    constructor () {
    }

    next (val) {
        this.observer = new Observable((observer) => {
            observer.next(val)
            observer.complete()
        })
        this.observers.forEach(item => this.observer.subscribe(item))
    }

    subscribe (observer) {
        let newObserver
        if (typeof observer === 'function') {
            newObserver = { ...defaultObserver, next: observer }
        } else {
            newObserver = { ...defaultObserver, ...observer }
        }
        this.observers.push(newObserver)

        return new SubjectSubscription(this, newObserver)
    }
}

