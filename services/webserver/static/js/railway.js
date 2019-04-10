"use strict";
// _login handles login request
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
        console.log(data);
    }).fail(function (data) {
        console.log(data);
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
