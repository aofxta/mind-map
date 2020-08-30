import { expect } from 'chai'
import { Subject } from './subject'


describe('subject', function () {

    it('should get correct push value when subscribe', function () {
        const $s = new Subject()
        const testData = 'hello world'

        $s.subscribe(data => {
            expect(data).to.eq(testData)
        })
        $s.next(testData)
    })

    it('should unsubscribe successful', function () {
        const $s = new Subject()

        const subscription = $s.subscribe(() => {})
        expect($s.observers.length).to.eq(1)
        subscription.unsubscribe()
        expect($s.observers.length).to.eq(0)
    })

    it('should get correct push value when multiple subscribe', function () {
        const $s = new Subject()
        let testData = 'hello world'

        $s.subscribe(data => {
            expect(data).to.eq(testData)
        })
        $s.next(testData)
        $s.subscribe(data => {
            expect(data).to.eq(testData)
        })
        testData = 'hello kitty'
        $s.next(testData)
    })
})
