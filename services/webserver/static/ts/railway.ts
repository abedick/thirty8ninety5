function _deleteContent(id: string){
    if(!id){
        console.log("could not parse id");
        return;
    }

    let errorBox = document.getElementById('error-box');
    if(errorBox != null){
        errorBox.style.display = 'none';
    }
    let error = (msg:string)=>{
        if(errorBox != null){
            errorBox.style.display = 'block';
            errorBox.innerHTML = msg;
        }
    };
    let successBox = document.getElementById('success-box');
    if(successBox != null){
        successBox.style.display = 'none';
    }
    let success = (msg:string)=>{
        if(successBox != null){
            successBox.style.display = 'block';
            successBox.innerHTML = msg + "<hr>";
        }
    };

    // @ts-ignore
    $.ajax({
        type: 'POST',
        url: '/content/manage/delete/'+id,
    }).done((data:any)=>{
        console.log(data);
        try {
            let pdata = JSON.parse(data);
            if(pdata.error){
                error(pdata.error);
            } else {
                let activeBox = document.getElementById("article-active");
                if(activeBox != null){
                    activeBox.setAttribute("placeholder", "false");
                }
                success("Marked article as inactive");
            }
        } catch {
            error("could not contact server");
        }
    }).fail((data:any)=>{
        error("could not contact server");
    });
}

function _updateContent(id: string){
    console.log(id);
    let form = document.getElementById("article-form");
    let errorBox = document.getElementById('error-box');
    if(errorBox != null){
        errorBox.style.display = 'none';
    }
    let box = document.getElementById("article-box");
    let error = (msg:string)=>{
        if(errorBox != null){
            errorBox.style.display = 'block';
            errorBox.innerHTML = msg;
        }
        // if(box != null){ box.removeChild(loading); }
        if(form != null){ form.style.display = 'block'; }
    };


    let title: any = document.getElementById('article-title');
    let date: any = document.getElementById('article-date');
    let author: any = document.getElementById('article-author');
    let tags: any = document.getElementById('article-tags');
    let body: any = document.getElementById('article-body');

    if(title == undefined || title.value == ""){
        error("Title must not be blank.");
        return;
    }
    title = title.value;

    if(date == undefined || date.placeholder == ""){
        console.log(date.placeholder)
        error("Date must not be blank.");
        return;
    }
    date = date.placeholder;

    if(author == undefined || author.placeholder == ""){
        error("Author must not be blank.");
        return;
    }
    author = author.placeholder;

    if(tags == undefined || tags.value == ""){
        error("Tags must not be blank.");
        return;
    }
    tags = tags.value;

    if(body == undefined || body.value == ""){
        error("Body must not be blank.");
        return;
    }
    body = body.value;

    // @ts-ignore
    $.ajax({
        type: 'POST',
        url: '/content/manage/update/'+id,
        data: {
            title: title,
            date: date,
            author: author,
            tags: tags,
            body: body,
        },
    }).done((data:any)=>{
        console.log(data);
        try {
            let pdata = JSON.parse(data);
            if(pdata.error){
                error(pdata.error);
            } else {
                window.location.href = "/content/manage";
                console.log("success");
            }
        } catch {
            error("could not contact server");
            console.log("data1");
        }
    }).fail((data:any)=>{
        console.log(data);
        error("could not contact server");
    });
}

//_submitContent handles new content requests
function _submitContent(){
    console.log("new content submission");
    let form = document.getElementById("article-form");
    let errorBox = document.getElementById('error-box');
    if(errorBox != null){
        errorBox.style.display = 'none';
    }
    let box = document.getElementById("article-box");
    let error = (msg:string)=>{
        if(errorBox != null){
            errorBox.style.display = 'block';
            errorBox.innerHTML = msg;
        }
        // if(box != null){ box.removeChild(loading); }
        if(form != null){ form.style.display = 'block'; }
    };

    let title: any = document.getElementById('article-title');
    let date: any = document.getElementById('article-date');
    let author: any = document.getElementById('article-author');
    let tags: any = document.getElementById('article-tags');
    let body: any = document.getElementById('article-body');

    if(title == undefined || title.value == ""){
        error("Title must not be blank.");
        return;
    }
    title = title.value;

    if(date == undefined || date.placeholder == ""){
        console.log(date.placeholder)
        error("Date must not be blank.");
        return;
    }
    date = date.placeholder;

    if(author == undefined || author.placeholder == ""){
        error("Author must not be blank.");
        return;
    }
    author = author.placeholder;

    if(tags == undefined || tags.value == ""){
        error("Tags must not be blank.");
        return;
    }
    tags = tags.value;

    if(body == undefined || body.value == ""){
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
    }).done((data:any)=>{
        console.log(data);
        try {
            let pdata = JSON.parse(data);
            if(pdata.error){
                error(pdata.error);
            } else {
                window.location.href = "/";
                console.log("success");
            }
        } catch {
            error("could not contact server");
            console.log("data1");
        }
    }).fail((data:any)=>{
        console.log(data);
        error("could not contact server");
    });

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

function __builder(ele:any, id?:string, classList?:string): any{
    let elem = document.createElement(ele);
    if(id && id != ""){
        elem.id = id;
    }
    if(classList && classList != ""){
        elem.classList = classList;
    }
    return elem;
}

function __articleBuilder(article:any): any {
    let card = __cardBuilder(article.id);
    card.title.innerHTML = "&nbsp;&nbsp;" + article.title;
    
    let lhs = __builder("div","","col-6");
    lhs.innerHTML = `<small>${article.date}</small>`;

    let rhs = __builder("div","","col-6 text-right");
    rhs.innerHTML = `<small>By: ${article.authors}</small>`;
    
    let body = __builder("div","","")
    body.innerHTML = article.body;

    let row = __builder("div","","row");
    row.appendChild(lhs);
    row.appendChild(rhs);

    let footer = __builder("div","","text-right");
    footer.innerHTML = `<small><a href="/content/articles/${article.id}">permalink<a>`

    card.body.appendChild(row);
    card.body.appendChild(__builder("hr"));
    card.body.appendChild(body);
    card.body.appendChild(__builder("hr"));
    card.body.appendChild(footer);

    return card.card;
}

function __cardBuilder(id: any, titleStr?:any, bodyStr?:any): any{
    let row = __builder("div","row-"+id,"row justify-content-center");
    let col = __builder("div","col-"+id,"col-8");
    let card = __builder("div","card-"+id, "card");
    let title = __builder("h3","card-title-"+id,"card-title");
    if(titleStr){
        title.innerHTML = "&nbsp;&nbsp;" + titleStr;
    }
    let body = __builder("div", "card-body-"+id, "card-body");
    if(bodyStr){
        body.innerHTML = bodyStr;
    }
    card.appendChild(body);
    col.appendChild(title);
    col.appendChild(card);
    row.appendChild(col);
    return { card: row, body: body, title: title };
}