// _login handles login request
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
            console.log(data);
    }).fail((data:any)=>{
            console.log(data);
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