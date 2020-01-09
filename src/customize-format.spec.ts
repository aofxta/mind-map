import { expect } from 'chai'
import { customizeFormat } from './customize-format'

describe('customize-format test', function () {

    it('should success update selectable props', function () {
        expect(customizeFormat.config.selectable).to.true
        customizeFormat.setSelectable(false)
        expect(customizeFormat.config.selectable).to.false
    })


    describe('nodeTree format method', function () {

        it('_extractData method, should set props except some special key props', function () {
            const data = {
                'id': 80,
                'color': '#fff',
                'topic': 'show room',
                'direction': 'right',
                'selectedType': '销售经理',
                'backgroundColor': '#616161',
                'children': [],
            }

            expect(customizeFormat.nodeTree._extractData(data)).to.eql({
                'background-color': '#616161',
                'color': '#fff'
            })
        })
    })
})
