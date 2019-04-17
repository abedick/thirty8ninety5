package main

import (
	"fmt"
	"net/http"
	"path"
	"time"

	"github.com/gorilla/mux"

	"github.com/gmbh-micro/gmbh"
)

func accountRoutes(r *mux.Router) {
	r.HandleFunc("/accounts/manage", handleAccountsManage)
	r.HandleFunc("/accounts/manage/update/{id}", handleAccountsUpdate).Methods("GET")
	r.HandleFunc("/accounts/manage/update/{id}", handleAccountsUpdatePost).Methods("POST")
	r.HandleFunc("/accounts/manage/delete/{id}", handleAccountsDelete).Methods("POST")

	r.HandleFunc("/accounts/login", handleLogin).Methods("GET")
	r.HandleFunc("/accounts/login/auth", handleLoginPost).Methods("POST")
	r.HandleFunc("/accounts/register", handleRegister).Methods("GET")
	r.HandleFunc("/accounts/register/new", handleRegisterPost).Methods("POST")
	r.HandleFunc("/accounts/logout", handleLogout).Methods("GET")

}

func handleAccountsManage(w http.ResponseWriter, r *http.Request) {
	usr, contentType := checkLoggedIn(w, r)
	if contentType != admin {
		http.Redirect(w, r, "/", 301)
		return
	}
	tmpl := make(map[string]interface{})
	tmpl["user"] = usr
	tmpl["users"] = true

	payload := gmbh.NewPayload()
	payload.Append("range", 10)
	result, err := client.MakeRequest("auth", "readMany", payload)
	if err != nil {
		tmpl["error"] = "internal server error"
	} else {
		tmpl["error"] = result.GetPayload().Get("error")
		tmpl["users"] = result.GetPayload().Get("users")
	}

	templates, err := getAdminTemplate(contentType, path.Join("tmpl", "accounts", "manage.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "admin_template", tmpl)

}

func handleAccountsDelete(w http.ResponseWriter, r *http.Request) {
	_, contentType := checkLoggedIn(w, r)
	if contentType != admin {
		http.Redirect(w, r, "/", 301)
		return
	}

	vars := mux.Vars(r)
	payload := gmbh.NewPayload()
	payload.Append("id", vars["id"])
	result, err := client.MakeRequest("auth", "delete", payload)
	if err != nil {
		fmt.Println(err.Error())
		w.Write([]byte(`{"error":"internal server error"}`))
		return
	}
	e := result.GetPayload().GetAsString("error")
	d := result.GetPayload().GetAsString("data")
	if e != "" {
		w.Write([]byte(fmt.Sprintf(`{ "error":"%s"}`, e)))
	} else {
		w.Write([]byte(fmt.Sprintf(`{ "data":"%s"}`, d)))
	}
}

func handleAccountsUpdatePost(w http.ResponseWriter, r *http.Request) {
	_, contentType := checkLoggedIn(w, r)
	if contentType != admin {
		http.Redirect(w, r, "/", 301)
		return
	}
	vars := mux.Vars(r)
	payload := gmbh.NewPayload()
	payload.Append("id", vars["id"])
	payload.Append("email", r.FormValue("email"))
	payload.Append("perm", r.FormValue("perm"))
	result, err := client.MakeRequest("auth", "update", payload)
	if err != nil {
		fmt.Println(err.Error())
		w.Write([]byte(`{"error":"internal server error"}`))
		return
	}
	e := result.GetPayload().GetAsString("error")
	d := result.GetPayload().GetAsString("data")
	if e != "" {
		w.Write([]byte(fmt.Sprintf(`{ "error":"%s"}`, e)))
	} else {
		w.Write([]byte(fmt.Sprintf(`{ "data":"%s"}`, d)))
	}
}

func handleAccountsUpdate(w http.ResponseWriter, r *http.Request) {
	usr, contentType := checkLoggedIn(w, r)
	if contentType != admin {
		http.Redirect(w, r, "/", 301)
		return
	}

	vars := mux.Vars(r)
	fmt.Println(vars["id"])
	id := vars["id"]

	payload := gmbh.NewPayload()
	payload.Append("id", id)
	result, _ := client.MakeRequest("auth", "read", payload)

	e := result.GetPayload().GetAsString("error")
	account := result.GetPayload().Get("account")

	tmpl := make(map[string]interface{})
	tmpl["user"] = usr
	tmpl["err"] = e
	tmpl["account"] = account
	tmpl["users"] = true

	templates, err := getAdminTemplate(contentType, path.Join("tmpl", "accounts", "update.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "admin_template", tmpl)
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	fmt.Println("incoming login request")

	usr, contentType := checkLoggedIn(w, r)
	if contentType != guest {
		http.Redirect(w, r, "/", 301)
		return
	}
	tmpl := make(map[string]interface{})
	tmpl["user"] = usr

	templates, err := getDefaultGuestTemplate(contentType, path.Join("tmpl", "accounts", "login.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", tmpl)
}

func handleLoginPost(w http.ResponseWriter, r *http.Request) {
	u, p, ok := r.BasicAuth()
	if ok {
	} else {
		fmt.Println("not okay")
	}
	payload := gmbh.NewPayload()
	payload.Append("user", u)
	payload.Append("pass", p)
	result, err := client.MakeRequest("auth", "grant", payload)
	if err != nil {
		w.Write([]byte(fmt.Sprintf(`{ "error":"%s"}`, "internal server error")))
		return
	}
	e := result.GetPayload().GetAsString("error")
	if e != "" {
		w.Write([]byte(fmt.Sprintf(`{ "error":"%s"}`, e)))
		return
	}
	d := result.GetPayload().GetAsString("data")
	if d == "" {
		w.Write([]byte(fmt.Sprintf(`{"data":"error"}`)))
		return
	}
	err = attachCookie(&w, r, d)
	if err != nil {
		fmt.Println(err.Error())
	}
	w.Write([]byte(fmt.Sprintf(`{"data":"success"}`)))
	return
}

func handleRegister(w http.ResponseWriter, r *http.Request) {
	fmt.Println("incoming register")

	_, contentType := checkLoggedIn(w, r)
	if contentType != guest {
		http.Redirect(w, r, "/", 301)
		return
	}

	templates, err := getDefaultGuestTemplate(contentType, path.Join("tmpl", "accounts", "register.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", nil)
}

func handleLogout(w http.ResponseWriter, r *http.Request) {
	fmt.Println("incoming logout")
	DestroyToken(w, r)
	http.Redirect(w, r, "/", 301)
}

func handleRegisterPost(w http.ResponseWriter, r *http.Request) {

	fmt.Println("register post")

	payload := gmbh.NewPayload()
	payload.Append("user", r.FormValue("user"))
	payload.Append("email", r.FormValue("email"))
	payload.Append("pass", r.FormValue("pass"))
	payload.Append("time", time.Now().Format(time.RFC850))
	result, err := client.MakeRequest("auth", "register", payload)
	if err != nil {
		fmt.Println(err.Error())
		w.Write([]byte(`{"error":"internal server error"}`))
		return
	}

	e := result.GetPayload().GetAsString("error")
	if e != "" {
		w.Write([]byte(fmt.Sprintf(`{ "error":"%s"}`, e)))
		return
	}
	d := result.GetPayload().GetAsString("data")
	w.Write([]byte(fmt.Sprintf(`{"data":"%s"}`, d)))

	err = attachCookie(&w, r, d)
	if err != nil {
		fmt.Println(err.Error())
	}
	return
}
