'use strict';

var $ = require('../../vendor/jquery.min.js');

var ace = require('brace');
require('brace/theme/iplastic');
require('brace/mode/svg');

var editor;

function getDefaultCode() {
    return '<g stroke="#000" stroke-width="2" stroke-linecap="round">\n' +
        '    <path d="M1 19l6-6"/>\n' +
        '    <path d="M9 8h6"/>\n' +
        '    <path d="M12 5v6"/>\n' +
        '</g>\n' +
        '<circle cx="12" cy="8" r="7" fill="none" stroke="#000" stroke-width="2"/>';
}

function getSavedCode() {
    if (localStorage.savedCode) {
        return localStorage.savedCode;
    } else {
        return getDefaultCode();
    }
}

function saveCode(code) {
    localStorage.savedCode = code;
}

function refreshSvg() {
    var height = $('#vector-height').val();
    var width = $('#vector-width').val();
    var zoomedScale = $('#vector-zoomed-scale').val();
    var backgroundColor = $('#vector-background-color').val();
    var code = editor.getValue();
    saveCode(code);

    // Fix size and general style of preview windows
    $('.preview-container--original').css({
        width              : width,
        height             : height,
        'background-color' : backgroundColor,
    });
    $('.preview-container--zoomed').css({
        width              : width * zoomedScale,
        height             : height * zoomedScale,
        'background-color' : backgroundColor,
    });

    $('.vector-preview--original').html(
        '<svg width="' + width + '" height="' + height + '">' +
         code +
        '</svg>'
    );

    var minimized = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' +
         code.replace(/>\s+</g, '><') + '</svg>';
    $('#code-output').val(minimized);
    $('#code-output-base64').val('data:image/svg+xml;base64,' + btoa(minimized));

    $('.vector-preview--zoomed').html(
        '<svg width="' + (width * zoomedScale) + '" height="' + (height * zoomedScale) + '">' +
        '<g transform="scale(' + zoomedScale + ')">' +
         code +
        '</g>' +
        '</svg>'
    );
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('.under-image').attr('src', e.target.result);
            $('.under-image').css('opacity', $('#underlay-opacity').val());

            // Make the vector size the same as the underlay image
            var image = new Image();
            image.onload = function() {
                $('#vector-width').val(this.width);
                $('#vector-height').val(this.height);
                refreshSvg();
            };
            image.src = e.target.result;
        };

        reader.readAsDataURL(input.files[0]);
    }
}

editor = ace.edit('editor');
editor.$blockScrolling = Infinity;
editor.setTheme('ace/theme/iplastic');
editor.getSession().setMode('ace/mode/svg');
editor.setValue(getSavedCode());
editor.getSession().on('change', refreshSvg);
$('#vector-width, #vector-height, #vector-zoomed-scale, #vector-background-color').on('change', refreshSvg);

$('#custom-image-underlay-upload').change(function(){
    readURL(this);
});
$('#underlay-opacity').on('change', function() {
    $('.under-image').css('opacity', $(this).val());
});
$('#onion-skin-opacity').on('input', function() {
    $('.vector-preview').css('opacity', $(this).val());
});

refreshSvg();
