/* globals protractor, element, by, browser  */

var Draggable = require('../utils/DraggableFixture');

describe('The ingDraggable directive', function () {
    var draggable;

    beforeEach(function () {
        browser.get('directives/draggable.html');

        draggable = new Draggable('draggable');
    });

    it('should emit events when dragged', function(){
        expect(element(by.id('x')).getText()).toBe('0');
        expect(element(by.id('y')).getText()).toBe('0');
        expect(element(by.id('started')).getText()).toBe('false');
        expect(element(by.id('dragging')).getText()).toBe('false');
        expect(element(by.id('stopped')).getText()).toBe('false');

        draggable.drag(42, 7);

        expect(element(by.id('x')).getText()).toBe('42');
        expect(element(by.id('y')).getText()).toBe('7');
        expect(element(by.id('started')).getText()).toBe('true');
        expect(element(by.id('dragging')).getText()).toBe('true');
        expect(element(by.id('stopped')).getText()).toBe('true');
    });

    it('should drag the element', function(){
        expect(draggable.element.getCssValue('top')).toBe('0px');
        expect(draggable.element.getCssValue('left')).toBe('0px');

        draggable.drag(13, 37);

        expect(draggable.element.getCssValue('top')).toBe('37px');
        expect(draggable.element.getCssValue('left')).toBe('13px');
    });

});
