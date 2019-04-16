"use strict";
// _indexWithArticles generates the index page articles
function _indexWithArticles(articles) {
    // console.log(articles);
    var container = document.getElementById("body-content");
    if (container == null) {
        console.log("DOM error");
        return;
    }
    for (var i in articles) {
        console.log(articles[i]);
        var row = __builder("div", "row-" + articles[i].id, "row justify-content-center");
        var col = __builder("div", "col-" + articles[i].id, "col-8");
        var card = __builder("div", "card-" + articles[i].id, "card");
        var title = __builder("h3", "card-title-" + articles[i].id, "card-title");
        title.innerHTML = "&nbsp;&nbsp;" + articles[i].title;
        var body = __builder("div", "card-body-" + articles[i].id, "card-body");
        body.innerHTML = articles[i].body;
        card.appendChild(body);
        col.appendChild(title);
        col.appendChild(card);
        row.appendChild(col);
        container.appendChild(row);
        container.appendChild(__builder("br", "", ""));
        container.appendChild(__builder("br", "", ""));
    }
}
//_submitContent handles new content requests
function _submitContent() {
    console.log("new content submission");
    var form = document.getElementById("article-form");
    var errorBox = document.getElementById('error-box');
    if (errorBox != null) {
        errorBox.style.display = 'none';
    }
    var box = document.getElementById("article-box");
    var error = function (msg) {
        if (errorBox != null) {
            errorBox.style.display = 'block';
            errorBox.innerHTML = msg;
        }
        // if(box != null){ box.removeChild(loading); }
        if (form != null) {
            form.style.display = 'block';
        }
    };
    var title = document.getElementById('article-title');
    var date = document.getElementById('article-date');
    var author = document.getElementById('article-author');
    var tags = document.getElementById('article-tags');
    var body = document.getElementById('article-body');
    if (title == undefined || title.value == "") {
        error("Title must not be blank.");
        return;
    }
    title = title.value;
    if (date == undefined || date.placeholder == "") {
        console.log(date.placeholder);
        error("Date must not be blank.");
        return;
    }
    date = date.placeholder;
    if (author == undefined || author.placeholder == "") {
        error("Author must not be blank.");
        return;
    }
    author = author.placeholder;
    if (tags == undefined || tags.value == "") {
        error("Tags must not be blank.");
        return;
    }
    tags = tags.value;
    if (body == undefined || body.value == "") {
        error("Body must not be blank.");
        return;
    }
    body = body.value;
    // @ts-ignore
    $.ajax({
        type: 'POST',
        url: '/content/new',
        data: {
            title: title,
            date: date,
            author: author,
            tags: tags,
            body: body,
        },
    }).done(function (data) {
        console.log(data);
        try {
            var pdata = JSON.parse(data);
            if (pdata.error) {
                error(pdata.error);
            }
            else {
                // window.location.href = "/";
                console.log("success");
            }
        }
        catch (_a) {
            error("could not contact server");
            console.log("data1");
        }
    }).fail(function (data) {
        console.log(data);
        error("could not contact server");
    });
}
// _login handles login requests
function _login() {
    console.log("login requested");
    var form = document.getElementById("login-form");
    var loading = __getLoading(1);
    var errorBox = document.getElementById('error-box');
    var box = document.getElementById("login-box");
    if (form != null) {
        form.style.display = 'none';
        if (box != null) {
            box.appendChild(loading);
        }
    }
    if (errorBox != null) {
        errorBox.style.display = 'none';
    }
    var error = function (msg) {
        if (errorBox != null) {
            errorBox.style.display = 'block';
            errorBox.innerHTML = msg;
        }
        if (box != null) {
            box.removeChild(loading);
        }
        if (form != null) {
            form.style.display = 'block';
        }
    };
    var unameField = document.getElementById("user");
    var pwordField = document.getElementById("pass");
    var uname = "";
    if (unameField != null) {
        uname = unameField.value;
        if (uname == "") {
            error("username cannot be blank");
            return;
        }
    }
    var pass = "";
    if (pwordField != null) {
        pass = pwordField.value;
        if (pass == "") {
            error("password cannot be blank");
            return;
        }
    }
    var authStr = btoa(uname + ":" + pass);
    authStr = "Basic " + authStr;
    // @ts-ignore
    $.ajax({
        type: 'POST',
        url: '/login',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', authStr);
        },
    }).done(function (data) {
        try {
            var pdata = JSON.parse(data);
            if (pdata.error) {
                error(pdata.error);
                return;
            }
            if (pdata.data == "success") {
                window.location.href = "/";
                return;
            }
            error("internal server error");
        }
        catch (_a) {
            error("could not contact server");
        }
    }).fail(function (data) {
        error("could not contact server");
    });
}
// _register handles registe requests
function _register() {
    console.log("register requested");
    var form = document.getElementById("register-form");
    var loading = __getLoading(1);
    var errorBox = document.getElementById('error-box');
    var box = document.getElementById("register-box");
    if (form != null) {
        form.style.display = 'none';
        if (box != null) {
            box.appendChild(loading);
        }
    }
    if (errorBox != null) {
        errorBox.style.display = 'none';
    }
    var error = function (msg) {
        if (errorBox != null) {
            errorBox.style.display = 'block';
            errorBox.innerHTML = msg;
        }
        if (box != null) {
            box.removeChild(loading);
        }
        if (form != null) {
            form.style.display = 'block';
        }
    };
    var unameField = document.getElementById("user");
    var emailField = document.getElementById("email");
    var pwordField = document.getElementById("pass");
    var pwordConfirmField = document.getElementById("passConfirm");
    var uname = "";
    if (unameField != null) {
        uname = unameField.value;
        if (uname == "") {
            error("username cannot be blank");
            return;
        }
    }
    var email = "";
    if (emailField != null) {
        email = emailField.value;
        if (email == "") {
            error("email cannot be blank");
            return;
        }
    }
    else {
        console.log("issues");
    }
    var pass = "";
    if (pwordField != null) {
        pass = pwordField.value;
        if (pass == "") {
            error("password cannot be blank");
            return;
        }
    }
    var passConfirm = "";
    if (pwordConfirmField != null) {
        passConfirm = pwordConfirmField.value;
        if (passConfirm == "") {
            error("password cannot be blank");
            return;
        }
    }
    if (passConfirm != pass) {
        error("passwords must match");
        return;
    }
    // @ts-ignore
    $.ajax({
        type: 'POST',
        url: '/register',
        data: {
            user: uname,
            email: email,
            pass: pass,
        },
    }).done(function (data) {
        try {
            var pdata = JSON.parse(data);
            if (pdata.error) {
                error(pdata.error);
            }
            else {
                window.location.href = "/";
            }
        }
        catch (_a) {
            error("could not contact server");
        }
    }).fail(function (data) {
        error("could not contact server");
    });
}
// __getLoading returns the loading image in a div with id = "loading-icon-<id>"
function __getLoading(id) {
    var img = document.createElement('img');
    img.setAttribute('src', 'static/img/loader.gif');
    img.className = "loading-icon";
    var loading = document.createElement('div');
    loading.id = "loading-icon-" + id;
    loading.appendChild(img);
    return loading;
}
function __builder(ele, id, classList) {
    var elem = document.createElement(ele);
    if (id && id != "") {
        elem.id = id;
    }
    if (classList && classList != "") {
        elem.classList = classList;
    }
    return elem;
}
