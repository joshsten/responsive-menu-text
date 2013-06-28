/* Responsive Menu Font Sizing
 * Joshua Enfield - 6/28/2013
 *  -------------
 * This resizes menus responsively. It takes into account the original font size.
 * If auto widths are on font sizes are adjusted based on the size left in menu items. 
 * If auto widths are off font sizes are adjusted based on the size left in the main nav.
 * ---------------
 * Common Usage: $('menuOLSelector').responsiveMenuText();
 * jQuery Usage expects markup in the form of ol > li > a
 */
$(function ($) {
    'use strict';

    var DEBUG = true;
    var diag = function (msg) {
        if (DEBUG) {
            console.log('[ Responsive Menus ] ' + msg);
        }
    };

    var config = {
        selector: {
            menuItems: '#mainNavMenu .mainNavItem',
            mainNav: '#mainNavMenu'
        },
        numberOfFontSizes: 20,
        tolerance: 0.00
    };

    var $mainNavMenu = $(config.selector.mainNav);
    var $topLevelMenuItems = $(config.selector.menuItems);
    var desktopFontSize = parseFloat($topLevelMenuItems.css('font-size')); // Initial Font Size. When at maximum size font-size should be this.
    var numberOfFontSizes = config.numberOfFontSizes;
    var fontSizes = getFontSizes();
    var currentFontIndex = fontSizes.length - 1;
    var ratioToTriggerResize = getRatio();
    var tolerance = config.tolerance;
    var autoWidths = false; // Assume autowidths are on and detect if they aren't

    // If the span wrapping the menu text for any menu item is a different width than the anchor then auto widths is on
    $topLevelMenuItems.each(function () {
        if (Math.floor($(this).width()) !== $(this).find('span').width()) {
            autoWidths = true;
        }
    });

    if (autoWidths)
        diag('Auto Widths Detected.');
    else {
        diag('Auto Widths Turned Off.');
    }

    diag('Font Sizes: ' + fontSizes);

    // Gets list of font sizes to resize amongst
    function getFontSizes() {
        var fontSizes = [];

        // Linear Scale
        for (var i = 0; i < numberOfFontSizes; i++) {
            fontSizes[i] = Math.floor(desktopFontSize / numberOfFontSizes * (i + 1));
        }

        // Exponential Decay
        /*
        fontSizes[numberOfFontSizes - 1] = desktopFontSize;
        for (var i = (numberOfFontSizes-2); i > 0; i--) {
            fontSizes[i] = Math.floor(0.95 * fontSizes[i+1]);
        }*/

        return fontSizes;
    }

    // Increases font size.
    var increaseFontSize = function () {
        var wasFontSizeIncreased = false;

        if (currentFontIndex < (fontSizes.length - 1)) {
            currentFontIndex++;
            wasFontSizeIncreased = true;
           // ratioToTriggerResize.itemRatio -= 0.1;
        }

        $topLevelMenuItems.css('font-size', fontSizes[currentFontIndex]);
        diag('INCREASE IN SIZE TRIGGERED (sizeIndex: ' + currentFontIndex + (currentFontIndex == (numberOfFontSizes -1)?'(MAX)' :'') + ' ,' + fontSizes[currentFontIndex] +')' );
        return wasFontSizeIncreased;
    };

    // Decreases font size.
    var decreaseFontSize = function () {
        var wasFontSizeDecreased = false;

        if (currentFontIndex > 0) {
            currentFontIndex--;
            wasFontSizeDecreased = true;
          //  ratioToTriggerResize.itemRatio += 0.1;
        }

        $topLevelMenuItems.css('font-size', fontSizes[currentFontIndex]);

        diag('DECREASE IN SIZE TRIGGERED (sizeIndex: ' + currentFontIndex + ',' + fontSizes[currentFontIndex] + ')');
        return wasFontSizeDecreased;
    };

    // Wraps menu Items with a span if spans are not already wrapping them.
    function createInnerWrappersIfWrappersDoNotExist() {
        if ($topLevelMenuItems.find('span').length === 0) {
            $topLevelMenuItems.wrapInner('<span/>').find('span').css('display', 'inline');
        }
    };

    // Get the ratios of space taken to space available for menu items and the menu itself
    function getRatio() {
        createInnerWrappersIfWrappersDoNotExist();  // Inner wrappers are required for this to work properly.
        var getItemRatio = function ($item) { return $item.find('span').width() / $item.width() };
        var itemRatio = getItemRatio($topLevelMenuItems.first());

        var widthConsumedByMenuItems = 0;
        $topLevelMenuItems.each(function () {
            widthConsumedByMenuItems += $(this).outerWidth(true);

            var currentItemRatio = getItemRatio($(this));
            if (currentItemRatio > itemRatio) {
                itemRatio = currentItemRatio;
            }

        });

        var menuRatio = widthConsumedByMenuItems / $mainNavMenu.width();
        var result = {
            menuRatio: menuRatio.toFixed(2),
            itemRatio: itemRatio.toFixed(2)
        };

        return result;
    };

    // Conditions
    var predicates = (function () {
        // Should return true when an increase in size should occur.
        var shouldIncreaseInSize = function () {
            var currentRatio = getRatio();
            diag(JSON.stringify(currentRatio));
            if (autoWidths) {
                return currentRatio.itemRatio < (ratioToTriggerResize.itemRatio - tolerance);
            } else {
                return currentRatio.menuRatio < (ratioToTriggerResize.menuRatio - tolerance);
            }
        };

        // Should return true when a decrease in size should occur.
        var shouldDescreaseInSize = function () {
            var currentRatio = getRatio();
            diag(JSON.stringify(currentRatio));
            if (autoWidths) {
                return currentRatio.itemRatio > (ratioToTriggerResize.itemRatio - tolerance);
            } else {
                return currentRatio.menuRatio > (ratioToTriggerResize.menuRatio - tolerance);
            }
        };

        return {
            shouldIncreaseInSize: shouldIncreaseInSize,
            shouldDescreaseInSize: shouldDescreaseInSize
        };

    }());

    // Function that actually adjusts menu font sizes.
    var adjustMenuFontSize = function () {
        createInnerWrappersIfWrappersDoNotExist();	// Inner wrappers are required for this to work properly.
        while (predicates.shouldIncreaseInSize() && increaseFontSize());
        while (predicates.shouldDescreaseInSize() && decreaseFontSize());
    };

    // Initialize default 
    var initDefault = function () {
        // Setup and bind menu resizing logic - TODO: this needs to be rebound to our media framework.
        $(window).bind('resize', adjustMenuFontSize);
    }

    // Handles cleanup.
    var dispose = function ()
    {
        $(window.unbind('resize', adjustMenuFontSize));
    }

    /* jQuery Plugin Support
       Expected Markup structure: ol > li > a
       Menu Text is dynamically wrapped by a span if it isn't already.
    */
    $.fn.responsiveMenuText = function () {
        $mainNavMenu = $(this);
        $topLevelMenuItems = $mainNavMenu.find('a');
        initDefault();
    };

    // AMD Module Support
    window.define = window.define || function () { };
    define([], function () {
        return {
            getName: function () { return 'ResponsiveMenuText'; },
            reAdjustMenu: adjustMenuFontSize,
            dispose: dispose
        }
    });

    // Adjust the menu font size if needed.
    adjustMenuFontSize();
    
    // Allow for calling default initialization inline.
    return {initDefault : initDefault};
}(jQuery));
