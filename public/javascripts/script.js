$(document).ready(function() {
    let getHeight = document.getElementById('footer-reveal').offsetHeight;
    const regex = /[!@#$%^&*()\-+={}[\]:;"'<>,.?\/|\\]/;
    const regexNum = /\d/;

    setFooterHeight(getHeight);
    
    $("#search-target").on("click", function() {
        $("body").toggleClass('search-target');
    });

    $(".copy-toggle-target").on("click", function() {
        let textForClipboard = document.getElementById('copy-text-target');

        textForClipboard.select();
        textForClipboard.setSelectionRange(0, 99999);

        navigator.clipboard.writeText(textForClipboard.value);
    });

    $(".reveal").on("click", function() {
        let elementToToggle = $(this).parent().find("input[data-flow='password-toggle']");
        if (elementToToggle.attr("type") == "password") {
            $(this).parent().addClass("toggled");
            elementToToggle.attr("type", "text");
          } else {
            $(this).parent().removeClass("toggled");
            elementToToggle.attr("type", "password");
          }
    });


    $(window).scroll(function(event) {
        let getHeightUpdated = document.getElementById('footer-reveal').offsetHeight;
        if(getHeight != getHeightUpdated) {
            setFooterHeight(getHeightUpdated);
        }
    });
    
    $(".toast > .closebutton").on("click", function() {
        $(".toast").removeClass("active");
    });

    if($(".toast").length > 0) {
        setTimeout(function() { 
            $(".toast").removeClass("active");
        }, 2000);
    }
    
    $("form[data-flow='sign up form'] #pin").on("input", function() {
        let getThisFieldVal = $(this).val();
        if($(this).siblings(".warning-item").length || $(this).siblings(".passed-item").length) {
            $(this).siblings(".warning-item").remove();
            $(this).siblings(".passed-item").remove();
        }
        if($.trim(getThisFieldVal).length > 0) {
            if($.trim(getThisFieldVal).length > 10) {
                if(regex.test(getThisFieldVal)) { 
                    if(regexNum.test(getThisFieldVal)) {
                        $("form[data-flow='sign up form'] #pin").parent().append('<span class="passed-item right-tool tooltipitems" data-tooltip="Password is good enough"></span>');
                    } else {
                        $("form[data-flow='sign up form'] #pin").parent().append('<span class="warning-item right-tool tooltipitems" data-tooltip="Password should contain at least 1 number"></span>');
                    }
                } else {
                    $("form[data-flow='sign up form'] #pin").parent().append('<span class="warning-item right-tool tooltipitems" data-tooltip="Password should contain at least 1 special character"></span>');
                }
            } else {
                $("form[data-flow='sign up form'] #pin").parent().append('<span class="warning-item right-tool tooltipitems" data-tooltip="Password should be at least 10 characters long"></span>');
            }
        }
    });
    
    $("form[data-flow='sign up form'] #pinRepeat").on("input", function() {
        let getFirstPassField = $("form[data-flow='sign up form'] #pin").val();
        let getThisFieldVal = $(this).val();
        if($(this).siblings(".warning-item").length || $(this).siblings(".passed-item").length) {
            $(this).siblings(".warning-item").remove();
            $(this).siblings(".passed-item").remove();
        }
        if($.trim(getFirstPassField).length > 0) {
            if(getFirstPassField == getThisFieldVal) {
                $("form[data-flow='sign up form'] #pinRepeat").parent().append('<span class="passed-item right-tool tooltipitems" data-tooltip="Password Matches"></span>');
            } else {
                $("form[data-flow='sign up form'] #pinRepeat").parent().append('<span class="warning-item right-tool tooltipitems" data-tooltip="Password Doesnt match"></span>');
            }
        }
    });
});

function setFooterHeight(param) {
    $('section[data-flow="paralax-scroll-animation-notifier"]').css("padding-top", param);
}
