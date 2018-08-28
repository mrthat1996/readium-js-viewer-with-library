var params = getURLQueryParams();

if(!params['bookTitle'] || !params['backLink']) {
    window.location = '/';
}

function getURLQueryParams() {
    var params = {};
    var query = window.location.search;
    if (query && query.length) {
        query = query.substring(1);
        var keyParams = query.split('&');
        for (var x = 0; x < keyParams.length; x++) {
            var keyVal = keyParams[x].split('=');
            if (keyVal.length > 1) {
                params[keyVal[0]] = decodeURIComponent(keyVal[1]);
            }
        }
    }
    return params;
};

$('.title h1').text(params['bookTitle']);
$('a.navbar-brand').attr('href', `viewer.html?epub=${encodeURIComponent(params['backLink'])}`);

$('.box-user-rating button').on('click', function() {
    // Current button
    let currentButton = $(this);
    
    // TURN OFF ALL THE LIGHTS
    $('.box-user-rating button:not(:first)').addClass('btn-grey')
    .removeClass('btn-warning')
    .addClass('btn-default');
    

    // Previous button
    // console.log($('.box-user-rating button:first').nextUntil(currentButton));
    if($('.box-user-rating button:first').is(currentButton)) return false;

    $('.box-user-rating button:first').nextUntil(currentButton)
    .removeClass('btn-grey')
    .addClass('btn-warning')
    .removeClass('btn-default');

    currentButton
    .removeClass('btn-grey')
    .addClass('btn-warning')
    .removeClass('btn-default');
});