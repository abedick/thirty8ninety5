package main

import (
	"fmt"
	"net/http"
	"path"
	"time"

	"github.com/gmbh-micro/gmbh"
	"github.com/gorilla/mux"
)

func accountRoutes(r *mux.Router) {
	r.HandleFunc("/accounts/manage", admin(authenticated(handleAccountsManage))).Methods("GET")
	r.HandleFunc("/accounts/manage/update/{id}", admin(authenticated(handleAccountsUpdate))).Methods("GET")
	r.HandleFunc("/accounts/manage/update/{id}", admin(authenticated(handleAccountsUpdatePost))).Methods("POST")
	r.HandleFunc("/accounts/manage/delete/{id}", admin(authenticated(handleAccountsDelete))).Methods("POST")
	r.HandleFunc("/accounts/login", guest(authenticated(handleLogin))).Methods("GET")
	r.HandleFunc("/accounts/login/auth", guest(authenticated(handleLoginPost))).Methods("POST")
	r.HandleFunc("/accounts/register", guest(authenticated(handleRegister))).Methods("GET")
	r.HandleFunc("/accounts/register/new", guest(authenticated(handleRegisterPost))).Methods("POST")
	r.HandleFunc("/accounts/logout", authenticated(handleLogout)).Methods("GET")
}

func handleAccountsManage(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	tmpl["title"] = "Manage"
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

	templates, err := getAdminTemplate(creds["perm"].(string), path.Join("tmpl", "accounts", "manage.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		return
	}
	templates.ExecuteTemplate(w, "admin_template", tmpl)

}

func handleAccountsDelete(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	vars := mux.Vars(r)
	payload := gmbh.NewPayload()
	payload.Append("id", vars["id"])
	result, err := client.MakeRequest("auth", "delete", payload)
	if err != nil {
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

func handleAccountsUpdatePost(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	vars := mux.Vars(r)
	payload := gmbh.NewPayload()
	payload.Append("id", vars["id"])
	payload.Append("email", r.FormValue("email"))
	payload.Append("perm", r.FormValue("perm"))
	result, err := client.MakeRequest("auth", "update", payload)
	if err != nil {
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

func handleAccountsUpdate(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	tmpl["title"] = "Manage"
	vars := mux.Vars(r)
	id := vars["id"]

	payload := gmbh.NewPayload()
	payload.Append("id", id)
	result, err := client.MakeRequest("auth", "read", payload)
	if err != nil {
		tmpl["err"] = err.Error()
	} else {
		e := result.GetPayload().Get("error")
		account := result.GetPayload().Get("account")
		tmpl["err"] = e
		tmpl["account"] = account
	}
	tmpl["users"] = true

	templates, err := getAdminTemplate(creds["perm"].(string), path.Join("tmpl", "accounts", "update.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		return
	}
	templates.ExecuteTemplate(w, "admin_template", tmpl)
}

func handleLogin(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	tmpl["title"] = "Login"
	templates, err := getDefaultGuestTemplate(creds["perm"].(string), path.Join("tmpl", "accounts", "login.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		return
	}
	templates.ExecuteTemplate(w, "default_template", tmpl)
}

func handleLoginPost(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	u, p, ok := r.BasicAuth()
	if !ok {
		w.Write([]byte(fmt.Sprintf(`{ "error":"%s"}`, "could not parse auth")))
		return
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
	}
	w.Write([]byte(fmt.Sprintf(`{"data":"success"}`)))
	return
}

func handleRegister(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	tmpl["title"] = "Register"
	templates, err := getDefaultGuestTemplate(creds["perm"].(string), path.Join("tmpl", "accounts", "register.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		return
	}
	templates.ExecuteTemplate(w, "default_template", nil)
}

func handleLogout(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	destroyToken(w, r)
	http.Redirect(w, r, "/", 301)
}

func handleRegisterPost(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	payload := gmbh.NewPayload()
	payload.Append("user", r.FormValue("user"))
	payload.Append("email", r.FormValue("email"))
	payload.Append("pass", r.FormValue("pass"))
	payload.Append("time", time.Now().Format(time.RFC850))
	result, err := client.MakeRequest("auth", "register", payload)
	if err != nil {
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
	}
	return
}
