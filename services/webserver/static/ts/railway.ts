//_submitContent handles new content requests
function _submitContent(){
    console.log("new content submission");
}

// _login handles login requests
function _login(){
    console.log("login requested");
    let form = document.getElementById("login-form");
    let loading = __getLoading(1)
    let errorBox = document.getElementById('error-box');
    let box = document.getElementById("login-box");
    if(form != null){
        form.style.display = 'none';
        if(box != null){
            box.appendChild(loading);
        }
    }
    if(errorBox != null){
        errorBox.style.display = 'none';
    }

    let error = (msg:string)=>{
        if(errorBox != null){
            errorBox.style.display = 'block';
            errorBox.innerHTML = msg;
        }
        if(box != null){ box.removeChild(loading); }
        if(form != null){ form.style.display = 'block'; }
    };

    let unameField: any = document.getElementById("user");
    let pwordField: any = document.getElementById("pass");

    let uname: string = "";
    if(unameField != null){
        uname = unameField.value;
        if(uname == ""){
            error("username cannot be blank");
            return;
        }
    }
    let pass: string = "";
    if(pwordField != null){
        pass = pwordField.value;
        if(pass == ""){
            error("password cannot be blank");
            return
        }
    }

    let authStr = btoa(`${uname}:${pass}`);
    authStr = `Basic ${authStr}`;

    console.log(authStr);

    // @ts-ignore
    $.ajax({
        type: 'POST',
        url: '/login',
        beforeSend: (xhr:any)=>{ 
            xhr.setRequestHeader('Authorization',authStr); 
        },
    }).done((data:any)=>{
        try {
            let pdata = JSON.parse(data);
            if(pdata.error){
                error(pdata.error);
                return
            }
            if(pdata.data == "success"){
                window.location.href = "/";
                return
            }
            error("internal server error");
        }catch{
            error("could not contact server");    
        }
    }).fail((data:any)=>{
        error("could not contact server");
    });
}

// _register handles registe requests
function _register(){
    console.log("register requested");
    let form = document.getElementById("register-form");
    let loading = __getLoading(1)
    let errorBox = document.getElementById('error-box');
    let box = document.getElementById("register-box");
    if(form != null){
        form.style.display = 'none';
        if(box != null){
            box.appendChild(loading);
        }
    }
    if(errorBox != null){
        errorBox.style.display = 'none';
    }

    let error = (msg:string)=>{
        if(errorBox != null){
            errorBox.style.display = 'block';
            errorBox.innerHTML = msg;
        }
        if(box != null){ box.removeChild(loading); }
        if(form != null){ form.style.display = 'block'; }
    };

    let unameField: any = document.getElementById("user");
    let emailField: any = document.getElementById("email");
    let pwordField: any = document.getElementById("pass");
    let pwordConfirmField: any = document.getElementById("passConfirm");

    let uname: string = "";
    if(unameField != null){
        uname = unameField.value;
        if(uname == ""){
            error("username cannot be blank");
            return;
        }
    }
    let email: string = "";
    if(emailField != null){
        email = emailField.value;
        if(email == ""){
            error("email cannot be blank");
            return;
        }
    } else {
        console.log("issues"); 
    }

    let pass: string = "";
    if(pwordField != null){
        pass = pwordField.value;
        if(pass == ""){
            error("password cannot be blank");
            return
        }
    }
    let passConfirm: string = "";
    if(pwordConfirmField != null){
        passConfirm = pwordConfirmField.value;
        if(passConfirm == ""){
            error("password cannot be blank");
            return
        }
    }

    if(passConfirm != pass){
        error("passwords must match");
        return
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
    }).done((data:any)=>{
        try {
            let pdata = JSON.parse(data);
            if(pdata.error){
                error(pdata.error);
            } else {
                window.location.href = "/";
            }
        } catch {
            error("could not contact server");
        }
    }).fail((data:any)=>{
        error("could not contact server");
    });
}


// __getLoading returns the loading image in a div with id = "loading-icon-<id>"
function __getLoading(id: number): HTMLDivElement{
    let img = document.createElement('img')
    img.setAttribute('src', 'static/img/loader.gif');
    img.className = "loading-icon";

    let loading = document.createElement('div');
    loading.id = "loading-icon-" + id;
    loading.appendChild(img);

    return loading;
}