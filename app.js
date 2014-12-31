/**
 * @author Joe Sangiorgio
 * JS Backend for Knewton code test
 */

//hide body to avoid FOUC
document.addEventListener("DOMContentLoaded", function(event) {
    document.getElementsByTagName('body')[0].style.visibility = 'hidden'
});

//external JS files to load
var scriptURLs = [
    "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js",
    "http://cdn.jsdelivr.net/jquery.sidr/1.2.1/jquery.sidr.js"
];

//external CSS files to load
var styleURLs = [
    "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.css",
    "http://cdn.wijmo.com/themes/sterling/jquery-wijmo.css",
    "http://cdn.jsdelivr.net/jquery.sidr/1.2.1/stylesheets/jquery.sidr.dark.css"
];

(function () {

    /**
     * Loads a Javascript file dynamically into the page
     * @param url - The location of the CDN Hosted file
     * @param callback - A function to be executed once script is loaded
     * @param index - used to test if this is the last script being loaded
     */
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

    /**
     * Loads a CSS file dynamically into the page
     * @param url - The location of the CDN Hosted file
     */
    function loadStyle(url) {
        var head = document.getElementsByTagName('head')[0],
            link = document.createElement('link');
        link.setAttribute('href', url);
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
        // insert the link node into the DOM
        head.appendChild(link);

        return link;
    }

    //load the css files
    for (var i = 0; i < styleURLs.length; i++) {
        loadStyle(styleURLs[i]);
    }

    //load the javascript files
    //jquery must be loaded before all other libraries, so have to nest others aftewards
    loadScript("https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js", function (i) {
        console.log('jquery loaded!');
        for (var i = 0; i < scriptURLs.length; i++) {
            loadScript(scriptURLs[i], function (i) {
                console.log(scriptURLs[i] + '  loaded');
                if (i == scriptURLs.length - 1) {
                    setTimeout(function () {
                        gList.start();
                    }, 150);
                } else {
                }
            }, i);
        }
    })

})();

var gList = (function () {
    var gList = {}

    //datastore that will be populated with all the li elements from the static HTML
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

    //convenience name map
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

    //datastore used for populating dynamic autocomplete search
    gList.searchData = []

    /**
     * Initializes all page elements, adding new styles and jquery ui elements for
     * a more robust and user friendly experience
     */
    gList.start = function () {

        console.log('start!')
        //operating on the assumption the exisiting HTML cannot be changed, so need to grab all items from
        //html file and populate json objects for easy manipulation
        _.each(gList.divNames, function (e, i, l) {
            gList.listItems[i] = $('#' + e + ' li')
            //utilize this for loop to populate search object as well
            _.each(gList.listItems[i], function (e2, i2, l2) {
                var currItem = {
                    label: e2.textContent,
                    category: i,
                    link: $("a", e2).attr('href')
                }
                gList.searchData.push(currItem)

            })
        });
        $("#container").width("100%");

        //leverage jquery ui to stylize page elements, making them more user friendly
        stylizeCategories()
        stylizeCal()
        stylizeSearch()


        //Start Responsive Work

        //add sidr for beginning of responsive design transition
        $("#topban").append("<a id='menuBtn' href='#sidr' style='float:left;'><img style='height: 20px;padding-top: 5px' src='http://goligraphist.com.au/img/menu.png'/a>");
        $("#topban").before("<div id='sidr'>");
        $('#menuBtn').sidr();
        $("#sidr").html($("#leftbar").html());
        $("#sidr").append($("#rightbar").html())

        fitWindow()

        //listen for resize event, fire corresponding stylizing function
        $(window).resize(function () {
            fitWindow();
        });
        $( document ).ready(function() {
            //is now safe to show new, stylized body
            document.getElementsByTagName('body')[0].style.visibility = 'visible'
        });

    }

    /**
     * Checks window width, uses value to adjust page accordingly
     */
    function fitWindow() {
        if ($(window).width() <= "970") {
            mobilizePage();
            gList.isMobile = true;
        } else if ($(window).width() >= "1024") {
            desktopPage();
            gList.isMobile = false;
        } else {
        }

    }

    /**
     * Changes page to mobile layout
     */
    function mobilizePage() {
        $('#rightbar').hide()
        $('#leftbar').hide()
        $('#menuBtn').show();

    }
    /**
     * Changes page to desktop layout
     */
    function desktopPage() {
        $('#rightbar').show()
        $('#leftbar').show()
        $('#menuBtn').hide();

    }

    /**
     * Changes all main page divs into jquery ui accordions,
     * which provide high degree of interactivity
     */
    function stylizeCategories(inDate) {

        //turn all main headings into accordions, collapsed by default.
        $(".col").accordion({
            collapsible: true,
            active: false
        });
    }

    /**
     * Changes calendar in sidebar into a more robust datepicker
     * with same functionality, and dates dynamically created
     */
    function stylizeCal() {
        //change side calendar into a more robust datepicker
        $(".cal").after("<div id='newCal'></div>");
        $(".cal").remove();
        $('#newCal').datepicker({
            onSelect: function (date) {
                gList.datePicked(date);
            }
        });
    }
    /**
     * Adds category search to the main page, allowing the user to have a meaningful,
     * dynamic experience with the content presented
     */
    function stylizeSearch() {

        //add expand all and collapse all buttons
        $("#topban").after("<header id='topban2' class='ban'> " +
        "<strong> category search </strong> <input id='catSearch'>" + "&nbsp;" +
        "<button id='expand'>+ all</button>" +
        "<button id='collapse'>- all</button></header>");
        $("#expand").click(function () {
            $(".col").accordion({
                active: 0
            });
        });
        $("#collapse").click(function () {
            $(".col").accordion({
                active: false
            });
        });

        //create custom search widget, based off of vanilla ui autocomplete
        //This one will have category specific visualization
        $.widget("custom.catcomplete", $.ui.autocomplete, {
            _create: function () {
                this._super();
                this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
            },
            _renderMenu: function (ul, items) {
                var that = this,
                    currentCategory = "";
                $.each(items, function (index, item) {
                    var li;
                    if (item.category != currentCategory) {
                        ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                        currentCategory = item.category;
                    }
                    li = that._renderItemData(ul, item);
                    if (item.category) {
                        li.attr("aria-label", item.category + " : " + item.label);
                    }
                });
            }
        });

        //utilize the newly created catcomplete search bar for the category search
        $("#catSearch").catcomplete({
            delay: 0,
            source: gList.searchData,
            select: function (event, ui) {
                window.location = ui.item.link
            },
            focus: function (event, ui) {
                gList.searchFocused(ui)
            },
            close: function (event, ui) {
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
        var year = inDate.substr(yearStart + 1);
        var date = inDate.substr(0, yearStart);
        var newDate = year + "-" + date
        window.location = "http://newyork.gregslist.org/search/eve?sale_date=" + newDate
    }

    /**
     * Helper function that interacts with the dynamic search results. Utilizes divNames
     * data object to find out which accordions are open and adjust page accordingly
     * @param inItem - the item gaining focus
     */
    gList.searchFocused = function (inItem) {

        if (gList.currOpenDiv != inItem.item.category) {
            $(".col").accordion({
                active: false
            });
            $("#" + gList.divNames[inItem.item.category]).accordion({
                active: 0
            });
            gList.currOpenDiv = inItem.item.category
        } else {
        }

    }

    return gList;
}());