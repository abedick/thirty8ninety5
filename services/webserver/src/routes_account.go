package main

import (
	"fmt"
	"net/http"
	"path"

	"github.com/gmbh-micro/gmbh"
)

func accountRoutes() {

}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	fmt.Println("incoming login request")

	data, contentType := checkLoggedIn(w, r)
	if contentType != guest {
		http.Redirect(w, r, "/", 301)
		return
	}

	templates, err := getDefaultGuestTemplate(contentType, path.Join("tmpl", "accounts", "login.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", data)
}

func handleLoginPost(w http.ResponseWriter, r *http.Request) {
	u, p, ok := r.BasicAuth()
	if ok {
		fmt.Println(u, p)
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
