/* globals protractor, element, by */

var Slider = require('../utils/SliderFixture').Slider;

describe('The ingSlider directive', function () {

    beforeEach(function () {
        browser.get('directives/slider.html');
    });

    describe('Horizontal slider', function () {

        var slider = new Slider('horizontalSlider'),
            handle = slider.getHandle();

        var getArgs = function(callback){
            protractor.promise.all([
                slider.getMax(),
                slider.getMin(),
                slider.getStep()
            ]).then(function(vals){
                var max = vals[0], min = vals[1], step = vals[2];
                callback(max, min, step);
            });
        };

        var setValue = function(value){
            var input = slider.getModelInput();
            input.sendKeys(protractor.Key.BACK_SPACE, value.toString());
        };

        it('should allow dragging the handle and update the value', function () {
            getArgs(function(max, min, step){
                expect(slider.getValue()).toBe(min.toString());
                handle.moveRight().then(function(){
                    expect(slider.getValue()).toBe((min + step).toString());
                }).then(function(){
                    return handle.moveRight().then(function(){
                        expect(slider.getValue()).toBe((min + step*2).toString());
                    });
                }).then(function(){
                    return handle.moveLeft().then(function(){
                        expect(slider.getValue()).toBe((min+step).toString());
                    });
                });
            });
        });

        it('should set the model to the minimum when dragging below the left boundary', function () {
            getArgs(function(max, min, step){
                expect(slider.getValue()).toBe(min.toString());
                handle.moveLeft().then(function(){
                    expect(slider.getValue()).toBe(min.toString());
                });
            });
        });

        it('should not update the model when dragging beyond the right boundary', function () {
            getArgs(function(max, min, step){
                expect(slider.getValue()).toBe(min.toString());
                handle.moveRight(max + step).then(function(){
                    expect(slider.getValue()).toBe(max.toString());
                });
            });
        });

        it('should update the handle position when the model is updated', function () {
            getArgs(function(max, min, step){
                setValue(min + step);
                expect(slider.getValue()).toBe((min + step).toString());
                // TODO: Check the actual handle position
            });
        });

        it('should fill the bar as many steps as the value', function () {
            getArgs(function(max, min, step){
                setValue(min + 3*step);
                expect(slider.getBar().getFilledSteps()).toBe(3);
            });
        });

        it('should leave as many steps in the bar unfilled as there remain', function () {
            getArgs(function(max, min, step){
                setValue(max - 2*step);
                expect(slider.getBar().getRemainingSteps()).toBe(max-2-min);
            });
        });

        it('should be in invalid state when its value is outside its range', function () {
            getArgs(function(max, min, step){
                expect(handle.element.getAttribute('class')).not.toMatch('ng-invalid');
                expect(handle.element.getAttribute('class')).not.toMatch('ng-invalid-min');
                setValue(min - step);
                expect(handle.element.getAttribute('class')).toMatch('ng-invalid');
                expect(handle.element.getAttribute('class')).toMatch('ng-invalid-min');
                setValue(min + step);
                expect(handle.element.getAttribute('class')).not.toMatch('ng-invalid');
                expect(handle.element.getAttribute('class')).not.toMatch('ng-invalid-min');
                expect(handle.element.getAttribute('class')).not.toMatch('ng-invalid-max');
                setValue(max + step);
                expect(handle.element.getAttribute('class')).toMatch('ng-invalid');
                expect(handle.element.getAttribute('class')).toMatch('ng-invalid-max');
                setValue(min + step);
                expect(handle.element.getAttribute('class')).not.toMatch('ng-invalid');
                expect(handle.element.getAttribute('class')).not.toMatch('ng-invalid-min');
                expect(handle.element.getAttribute('class')).not.toMatch('ng-invalid-max');
            });
        });

        // For some reason, Protractor does not manage to focus the handle,
        // so we exclude this test for now.
        xit('should allow altering the value through the keyboard', function () {
            getArgs(function(max, min, step){
                var handle = slider.getHandle();
                slider.getModelInput().then(function(input){
                    handle.element.getWebElement().sendKeys(protractor.Key.RIGHT);
                    expect(slider.getValue()).toBe((min + step).toString());
                    handle.element.getWebElement().sendKeys(protractor.Key.UP);
                    expect(slider.getValue()).toBe((min + step + step).toString());
                    handle.element.getWebElement().sendKeys(protractor.Key.DOWN);
                    expect(slider.getValue()).toBe((min + step).toString());
                    handle.element.getWebElement().sendKeys(protractor.Key.LEFT);
                    expect(slider.getValue()).toBe((min).toString());
                    handle.element.getWebElement().sendKeys(protractor.Key.PAGE_UP);
                    expect(slider.getValue()).toBe((max).toString());
                    handle.element.getWebElement().sendKeys(protractor.Key.PAGE_DOWN);
                    expect(slider.getValue()).toBe((min).toString());
                });
            });
        });
    });

});
