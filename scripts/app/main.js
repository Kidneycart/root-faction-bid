(function ($) {
    'use strict';
    // INIT

    // DATA
    var pageData = {
        returnPage: '#home-container',
        showingAboutPage: false,
    };

    // DECLARES

    // FUNCTIONS

    // FUNCTIONS - FoC
        var FOC = {
        resetPage: function () {
            setPageNumber("");
            navigateToPage('#home-container');
        },
		showWarning: function() {
			setWarningSubText("");
			setWarningOKButtonText("");
			navigateToPage('#warning-container');
		},
		warningCancel: function() {
			FOC.resetPage();
		},
		warningConfirm: function() {
			FOC.resetPage();
		},
        toggleAboutDisplay: function () {
            if (pageData.showingAboutPage) {
                navigateToPage(pageData.returnPage);
                pageData.showingAboutPage = false;
            } else {
                navigateToPage('#about-container');
                pageData.showingAboutPage = true;
            }
        },
    };

    // FUNCTION - Nav
    var navigateToPage = function (divName) {
        // hide all
        $('#home-container').hide();
        $('#entry-container').hide();
        $('#loading-container').hide();
        $('#results-container').hide();
        $('#about-container').hide();
		$('#warning-container').hide();
		$('#error-container').hide();
        // show one
        $(divName).show();
        // set page to show when closing about-container
        if (divName != '#about-container') {
            pageData.returnPage = divName;
        }
    };

    // FUNCTION - Utility

    // CONTROL

    // loader
    var loader = function () {
        setTimeout(function () {
            if ($('#loader').length > 0) {
                $('#loader').removeClass('show');
            }
        }, 1);
    };
    loader(); // INIT, page load

    var setloader = function (isOn) {
        if ($('#loader').length > 0) {
            if (isOn) {
                $('#loader').addClass('show');
            } else {
                $('#loader').removeClass('show');
            }
        }
    };

    // FUNCTION HOOKS
    // home page

    // nav
    var navHome = document.getElementsByName('nav-home')[0];
     navHome.addEventListener("click", function () { FOC.resetPage(); }, false);
    var navAbout = document.getElementsByName('footer-about-button')[0];
    navAbout.addEventListener("click", function () { FOC.toggleAboutDisplay(); }, false);

    //other

	// INIT temp data
})(jQuery);