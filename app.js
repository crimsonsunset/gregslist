/**
 * @author Joe Sangiorgio
 * JS Backend for Knewton code test
 */

var scriptURLs = [
    "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.1/js/bootstrap.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js",
    "http://cdn.jsdelivr.net/jquery.sidr/1.2.1/jquery.sidr.js",
    "http://cdn.lukej.me/jquery.stacktable/1.0.0/stacktable.min.js",
];

var styleURLs = [
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css",
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.css",
    //"http://cdn.wijmo.com/themes/aristo/jquery-wijmo.css",
    "http://cdn.wijmo.com/themes/sterling/jquery-wijmo.css",
    //"http://cdn.wijmo.com/themes/arctic/jquery-wijmo.css",
    "https://raw.githubusercontent.com/artberri/sidr/master/dist/stylesheets/jquery.sidr.light.css",
    "http://cdn.lukej.me/jquery.stacktable/1.0.0/stacktable.css"
];

(function () {

    function loadScript(url, callback, index) {

        var script = document.createElement("script")
        script.type = "text/javascript";

        if (script.readyState) { //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback(index);
                }
            };
        } else { //Others
            script.onload = function () {
                callback(index);
            };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    function loadStyle(path) {
        var head = document.getElementsByTagName('head')[0], // reference to document.head for appending/ removing link nodes
            link = document.createElement('link');           // create the link node
        link.setAttribute('href', path);
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');

        var sheet, cssRules;
        // get the correct properties to check for depending on the browser
        if ('sheet' in link) {
            sheet = 'sheet';
            cssRules = 'cssRules';
        }
        else {
            sheet = 'styleSheet';
            cssRules = 'rules';
        }
        head.appendChild(link);  // insert the link node into the DOM and start loading the style sheet

        return link;
    }

    //load the css files
    for (var i = 0; i < styleURLs.length; i++) {
        loadStyle(styleURLs[i]);
    }

    //load the javascript files
    //jquery must be loaded before all other libraries
    loadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js", function (i) {
        console.log('jquery loaded!');
        for (var i = 0; i < scriptURLs.length; i++) {
            loadScript(scriptURLs[i], function (i) {
                console.log(scriptURLs[i] + '  loaded');
                if (i == scriptURLs.length - 1) {
                    setTimeout(function () {
                        gList.start();
                    }, 100);
                } else {
                }
            }, i);
        }
    })

})();

var gList = (function () {
    var gList = {}

    gList.listItems = {
        "community": [],
        "personals": [],
        "forums": [],
        "housing": [],
        "forSale": [],
        "services": [],
        "jobs": [],
        "gigs": [],
        "resumes": []
    }

    gList.divNames = {
        "community": "ccc",
        "personals": "ppp",
        "forums": "forums",
        "housing": "hhh",
        "forSale": "sss",
        "services": "bbb",
        "jobs": "jjj",
        "gigs": "ggg",
        "resumes": "res"
    }

    gList.searchData=[]

    //Constants
    //number of comments to load per page
    gList.DISPLAY_NUM = 100

    gList.start = function () {

        console.log('start!')

        //operating on the assumption the exisiting HTML cannot be changed, so need to grab all items from
        //html and populate json objects for easy operation
        _.each(gList.divNames, function (e, i, l) {
            gList.listItems[i] = $('#' + e + ' li')
            _.each(gList.listItems[i], function (e2, i2, l2) {
                var currItem = {
                    label: e2.textContent,
                    category: i,
                    link: $("a",e2).attr('href')
                }
                gList.searchData.push(currItem)

            })
        });
        $( "#container" ).width("100%");
        //$('#main').stacktable();
        gList.stylizeCategories()
        gList.stylizeCal()
        gList.stylizeSearch()


        //add new, predictive category searching to topbar
    }

    gList.stylizeCategories = function (inDate) {

        //leverage jquery ui to stylize page elements, making them more user friendly

        //turn all main headings into accordions, collapsed by default.
        $(".col").accordion({
            collapsible: true,
            active: false
        });
    }
    gList.stylizeCal = function () {
        //change side calendar into a more robust datepicker
        $(".cal").after("<div id='newCal'></div>");
        $( ".cal" ).remove();
        $('#newCal').datepicker({
            onSelect: function(date) {
                gList.datePicked(date);
            }
        });
    }
    gList.stylizeCal = function () {
        //change side calendar into a more robust datepicker
        $(".cal").after("<div id='newCal'></div>");
        $( ".cal" ).remove();
        $('#newCal').datepicker({
            onSelect: function(date) {
                gList.datePicked(date);
            }
        });
    }

    gList.stylizeSearch = function () {

        $("#topban").after("<header id='topban2' class='ban'> " +
        "<strong> category search </strong> <input id='catSearch'>"+"&nbsp;"+
        "<button id='expand'>+ all</button>"+
        "<button id='collapse'>- all</button></header>");


        //create custom search widget, based off of vanilla ui autocomplete
        //This one will have category specific visualization
        $.widget( "custom.catcomplete", $.ui.autocomplete, {
            _create: function() {
                this._super();
                this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
            },
            _renderMenu: function( ul, items ) {
                var that = this,
                    currentCategory = "";
                $.each( items, function( index, item ) {
                    var li;
                    if ( item.category != currentCategory ) {
                        ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
                        currentCategory = item.category;
                    }
                    li = that._renderItemData( ul, item );
                    if ( item.category ) {
                        li.attr( "aria-label", item.category + " : " + item.label );
                    }
                });
            }
        });

        $( "#expand" ).click(function() {
            $(".col").accordion({
                active: 0
            });
        });

        $( "#collapse" ).click(function() {
            $(".col").accordion({
                active: false
            });
        });

        $( "#catSearch" ).catcomplete({
            delay: 0,
            source: gList.searchData,
            select: function (event, ui) {
                window.location = ui.item.link
            },
            focus: function( event, ui ) {
                gList.searchFocused(ui)
            },
            close: function( event, ui ) {
                //support for escape key, want to close all divs if it is hit
                if (event.which == 27) {
                    $(".col").accordion({
                        active: false
                    });
                } else {

                }
            }
        });
    }

    /**
     * Helper function that directs user to corresponding date picked by datepicker
     * Follows the convention set forth by 'cal' div in original HTML
     * @param the date, default formatted by jquery datepicker
     */
    gList.datePicked = function (inDate) {
        inDate = inDate.replace(/\//g, '-');
        var yearStart = inDate.lastIndexOf("-");
        var year = inDate.substr(yearStart+1);
        var date = inDate.substr(0,yearStart);
        var newDate = year + "-" + date
        window.location = "http://newyork.gregslist.org/search/eve?sale_date="+newDate
    }

    gList.searchFocused = function (inItem) {

        if (gList.currOpenDiv != inItem.item.category) {
            $(".col").accordion({
                active: false
            });
            $("#"+gList.divNames[inItem.item.category]).accordion({
                active: 0
            });
            gList.currOpenDiv = inItem.item.category
        } else {}

    }


    return gList;
}());

//prototype overrides

/**
 * Further formats strings returned from moment's fromNow function into
 * BuzzFeed-specific timestamps
 * @param inStr the time string to be further manipulated
 */
String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
}

//util functions

/**
 * Checks if substring exists inside string
 * @param test the string to check
 * @param str the substring to test
 */
function contains(test, str) {
    if (test.indexOf(str) != -1) {
        return test
    } else {
        return false
    }
}
/**
 * Removes non-human readable characters from text, replacing them
 * with the appropriate ascii characters
 * @param inStr the string containing encoded characters
 */
function cleanStrings(inStr) {
    return $('<textarea />').html(inStr).text();
}
/**
 * Used to sort an array of objects.
 * * @param {string} field - The field you wish to sort by
 * * @param {boolean} reverse - sort in ascending/descending order
 * * @param {function} primer - function that tells how to sort
 */
var sort_by = function (field, reverse, primer) {
    var key = function (x) {
        return primer ? primer(x[field]) : x[field]
    };
    return function (a, b) {
        var A = key(a), B = key(b);
        //alert(A + " , " + B)
        return ((A < B) ? -1 :
                (A > B) ? +1 : 0) * [-1, 1][+!!reverse];
    }
};