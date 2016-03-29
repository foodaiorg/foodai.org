//var base = 'http://api.foodai.org'
var base = '';
function request_classification_result(image_url) {
        $("#show").attr('src', image_url);
        $("#image").fadeIn();
        $("#upload-bar").hide();
        $("#show_url").attr('href', image_url);

        var success_func = function (resp) {
            var response_ok_dom = "<div id='bar-{{tag}}' class='bar-main-container kinda-green'> <div class='row'> <div class='col col-xs-1'> <div class='row'> <div class='col col-xs-6'> <div class='afeed-back'> <span id='yes' class='yes glyphicon glyphicon-ok' onclick='onClickFeedback(this, \"{{guid}}\", \"{{tag}}\", \"1\");'/> </div></div><div class='col col-xs-6'> <div class='afeed-back'> <span id='no' class='no glyphicon glyphicon-remove' onclick='onClickFeedback(this, \"{{guid}}\", \"{{tag}}\", \"0\");'/> </div></div></div></div><div class='col col-xs-11'> <div class='progress-bar progress-bar-striped color-2 overflow' style='width:{{prob}}; height: 30px'>{{tag}}</div></div><div id='tag-{{tag}}' class='tag feed-back' hidden>{{tag}}</div></div></div>"
            var response_error_dom = "<div id='response-error' class='bar-main-container violet'> <div class='wrap'> <div>Error Code:{{code}}</div></div></div>"
            var new_html = '';

            console.log(resp);

            if (resp.code == 200) {
                new_html = '';
                for (var i = 0; i < 5; i++) {
                    new_html += response_ok_dom.replace(/\{\{tag}}/g, resp.tags[i][0])
                        .replace(/\{\{guid}}/g, resp.guid)
                        .replace(/\{\{prob}}/g, Number(parseFloat(resp.tags[i][1])*100).toFixed(2)+"%");
                }
                $("#predict").html(new_html);
            }
            else {
                new_html = response_error_dom;
                new_html = new_html.replace('{{code}}', resp.code);
                console.log(new_html);
                $("#predict").html(new_html);
            }
            $("#predict").fadeIn();

            setTimeout(function () {
//                jQuery.fx.off();
                $("#upload-bar").css('width', '0%');
            }, 1050);
        };

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: base + '/v1/classify',
            crossDomain: true,
            data: {
                'image_url': image_url,
                'qid': 0
            },
            success: success_func
        });

    }

function image_process(original_image) {

    var img = document.createElement("img");

    img.onload =
        function (e) {
            // draw the image to get its size
            var canvas = document.createElement('canvas');
            var context = canvas.getContext("2d");
            context.drawImage(img, 0, 0);
            var MAX_WIDTH = 512;
            var MAX_HEIGHT = 512;
            var width = img.width;
            var height = img.height;

            // calculate the desired output size
            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            // resize the canvas and redraw the image
            // auto scaling will be applied
            canvas.width = width;
            canvas.height = height;
            context = canvas.getContext("2d");
            context.drawImage(img, 0, 0, width, height);

            // convert to base64
            var image_url = canvas.toDataURL('image/jpeg');

            request_classification_result(image_url);
        };

    img.src = original_image;
}


$(document).ready(function () {



    // upload button
    $("input#upload-files").change(function () {
        on_upload();
        var filesToUpload = jQuery(this.files);

        var reader = new FileReader();
        reader.readAsDataURL(filesToUpload[0]);

        reader.onload = function (e) {
            setTimeout(function () {
                var image_url = image_process(e.target.result);
                console.log(image_url);
                request_classification_result(image_url);
            }, 500);
        };
    });

    // link button
    $("button#upload-btn-0").click(function () {
        on_upload();
        var image_url = document.getElementById("image_url").value;
        request_classification_result(image_url);
    });

});

function on_upload() {
    jQuery("div#image").fadeOut();
    jQuery("div#predict").fadeOut();
    //    jQuery("div#sim-txt").fadeOut();
    //    jQuery("div#sim-img").fadeOut();
    jQuery("div#upload-bar").show();

    var progress = jQuery(".progbar-percentage");
    jQuery("div#progbar").show();
    var percentage = Math.ceil(progress.attr('data-percentage'));
    jQuery({countNum: 0}).animate({countNum: percentage}, {
        duration: 1000,
        easing: 'linear',
        step: function () {
            // What todo on every count
            var pct = '';
            if (percentage == 0) {
                pct = Math.floor(this.countNum) + '%';
            } else {
                pct = Math.floor(this.countNum + 1) + '%';
            }
            //            progress.text(pct) && progress.siblings().children().css('width', pct);
            $('#upload-bar').css('width', pct);
        }
    });
}

/**
 * trigger the click on 'Enter' Key
 */
jQuery(document).ready(function () {
    jQuery('#imageurl').keyup(function (e) {
        if (e.keyCode == 13) {
            jQuery("button#upload-btn-0").click();
        }
    });
});


/**
 * Collecting user feedback
 */
function onClickFeedback(elem, guid, tag, correct) {
    //    elm = document.getElementById("bar-" + tag);
    //    cls = elm.className;
    //    clsprefix = 'bar-main-container ';
    //    elm_tag = document.getElementById("tag-" + tag);
    //    elm_tag.className = 'tag';

    data = {
        'guid': guid,
        'correct': correct,
        'tag': tag
    }

    $.ajax({
        type: 'GET',
        dataType: 'json',
        url: '/v1/feedback',
        crossDomain: true,
        data: data,
        success: function(e) {
            console.log(data)
        },
        onload: function(data) {
            $('#upload-bar').text = data;
            console.log(data);
        }
    });

    //    if (elm.className == clsprefix + feed) {
    //        elm.className = clsprefix + 'violet';
    //        data.append('op', 'del');
    //    } else {
    //        elm.className = clsprefix + feed;
    //        data.append('op', 'add');
    //        if (feed == 'no') {
    //            elm_tag.className = 'line-through';
    //        }
    //    }

    if (elem.classList[0] == 'yes') {
        var color = 'green';
    }
    if (elem.classList[0] == 'no') {
        var color = 'red';
    }
    baba = elem.parentNode.parentNode.parentNode;
    baba.firstElementChild.firstElementChild.firstElementChild.style.color = 'white';
    baba.lastElementChild.lastElementChild.lastElementChild.style.color = 'white';
    elem.style.color = color;
}
