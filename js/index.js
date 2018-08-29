let PublicURL = window.location.origin;
let params = getURLQueryParams();
let libUrl = "http://lcp.trunguit.net:3000/opds2/publications.json";
if (params['epubs']) {
    libUrl = params['epubs'];
}
var ele_loading = document.getElementById('loading');
var spinner = new Spinner().spin();
ele_loading.appendChild(spinner.el);

$(document).ready(function () {
    loadLibrary();
});

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

function checkLicense(json) {
    var links = json.links;
    for (let i = 0; i < links.length; i++) {
        if (links[i]['rel'] == 'license') {
            return true;
            break;
        }
    };
    return false;
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function isCacheCookie(name) {
    if (getCookie(name) != "")
        return true;
    return false;
}

function regex_match(input, patten) {
    var match = patten.exec(input);
    return match;
}

function preloadEpub(link, ele) {
    ele.toggleClass('animated').toggleClass('bounce').toggleClass('infinite');
    //Check if selected epub is encrypted
    $.ajax({
        url: link,
        type: 'GET',
        success: function (data, status) {
            licenseCallback(data, link, ele);
        },
        error: function (er) {
            ele.removeClass('animated').removeClass('bounce').removeClass('infinite');
            window.location.href = './viewer.html?epub=' + encodeURIComponent(link);
            console.log(er);
        }
    });
}
//Callback if get manifest success
function licenseCallback(data, manifest_link, ele) {
    let link = manifest_link.replace('manifest.json', '');
    let isEncrypted = checkLicense(data);
    let epub_id = regex_match(manifest_link, /pub\/(.*?)\//gm)[1];
    if (isEncrypted) {
        if (isCacheCookie(epub_id)) {
            hash = getCookie(epub_id);
            login_link = link.replace('/pub/', '/pub/*-' + hash + '-*') + 'manifest.json/show';
            $.ajax({
                url: login_link,
                type: 'GET',
                success: function () {
                    setCookie(epub_id, hash);
                    window.location.href = './viewer.html?epub=' + encodeURIComponent(link);
                },
                error: function () {
                    ele.removeClass('animated').removeClass('bounce').removeClass('infinite');
                }
            });
        } else {
            swal({
                title: 'Enter your password!',
                input: 'password',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'OK',
                showLoaderOnConfirm: true,
                preConfirm: (pass) => {
                    var hash = sha256.create();
                    hash.update(pass);
                    hash = btoa(hash.hex());
                    login_link = link.replace('/pub/', '/pub/*-' + hash + '-*') + 'manifest.json/show';
                    return fetch(login_link)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(response.statusText)
                            }
                            setCookie(epub_id, hash);
                            window.location.href = './viewer.html?epub=' + encodeURIComponent(link);
                        })
                        .catch(error => {
                            swal.showValidationError(
                                'Wrong password!'
                            )
                        })
                }
            });
            ele.removeClass('animated').removeClass('bounce').removeClass('infinite');
        }
    } else {
        window.location.href = PublicURL + '/viewer.html?epub=' + encodeURIComponent(link);
    }
}

function loadLibrary() {
    $.ajax({
        url: libUrl,
        type: 'GET',
        success: function (data, status) {
            try {
                var temp = JSON.stringify(data);
                json = JSON.parse(temp);
                Parse_Feed_JSON(json);
            } catch (e) {
                Parse_Feed_XML(data);
            }
        },
        error: function (e) {
            spinner.stop();
            console.log(e);
        }
    });
}

function Parse_Feed_JSON(data) {
    data.publications.forEach(publication => {
        var title = publication.metadata.title;
        var author = publication.metadata.author ? publication.metadata.author[0].name : "Author not spectified";
        var cover = publication.images ? publication.images[0].href : "http://actar.com/wp-content/uploads/2015/12/nocover.jpg";
        var href = publication.links[0].href;
        var li = `<li>
                    <a class="item-img" onclick="preloadEpub('${href}', $(this).parent())" style="background-image: url('${cover}')"></a>
                    <div class="item-detail">
                        <h5 class="item-title"><a
                                title="${title}">${title}</a></h5>
                        <div class="item-data">
                            <small class="item-vol">${author}</small>
                        </div>
                    </div>
                </li>`;
        $("#publications-list").append(li);
    });
    $("#publications-list").addClass('pulse');
    spinner.stop();
}

function Parse_Feed_XML(data) {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(data, "text/xml");
    epubs = xmlDoc.getElementsByTagName('entry');
    console.log(epubs);
    for (var i = 0; i < epubs.length - 1; i++) {
        let title = epubs[i].getElementsByTagName('title')[0].innerHTML;
        let author = epubs[i].getElementsByTagName('author')[0].innerHTML ? epubs[i].getElementsByTagName('author')[0].innerHTML : "Author not spectified";
        let cover = "http://actar.com/wp-content/uploads/2015/12/nocover.jpg";
        let links = epubs[i].getElementsByTagName('link');
        let href = '#';
        for (var j = 0; j < links.length; j++) {
            const test_img = /image/g;
            const test_epub = /epub/g;
            if (test_img.test(links[j].getAttribute('type'))) {
                cover = links[j].getAttribute('href');
            }
            if (test_epub.test(links[j].getAttribute('type'))) {
                href = links[j].getAttribute('href');
            }

        }

        let li = `<li>
                    <a class="item-img" onclick="preloadEpub('${href}', $(this).parent())" style="background-image: url('${cover}')"></a>
                    <div class="item-detail">
                        <h5 class="item-title"><a
                                title="${title}">${title}</a></h5>
                        <div class="item-data">
                            <small class="item-vol">${author}</small>
                        </div>
                    </div>
                </li>`;
        $("#publications-list").append(li);
    }
    $("#publications-list").addClass('pulse');
    spinner.stop();
}