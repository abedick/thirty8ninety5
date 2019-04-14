"use strict";
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
    console.log(authStr);
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
