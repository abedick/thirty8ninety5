package main

import (
	"fmt"
	"net/http"
	"path"
	"time"

	"github.com/gmbh-micro/gmbh"
	"github.com/gorilla/mux"
)

func contentRoutes(r *mux.Router) {
	r.HandleFunc("/content/new", user(authenticated(handleNewArticle))).Methods("GET")
	r.HandleFunc("/content/new", user(authenticated(handleNewArticlePost))).Methods("POST")
	r.HandleFunc("/content/articles/{id}", authenticated(handleReadArticle)).Methods("GET")
	r.HandleFunc("/content/manage", admin(authenticated(handleManageArticle))).Methods("GET")
	r.HandleFunc("/content/manage/update/{id}", admin(authenticated(handleUpdateArticle))).Methods("GET")
	r.HandleFunc("/content/manage/update/{id}", admin(authenticated(handleUpdateArticlePost))).Methods("POST")
	r.HandleFunc("/content/manage/delete/{id}", admin(authenticated(handleDeleteArticlePost))).Methods("POST")
}

func handleNewArticle(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	fmt.Println("new article")

	tmpl["date"] = time.Now().Format(time.RFC850)
	templates, err := getDefaultGuestTemplate(creds["perm"].(string), path.Join("tmpl", "content", "new.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", tmpl)
}

func handleNewArticlePost(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {

	payload := gmbh.NewPayload()
	payload.Append("title", r.FormValue("title"))
	payload.Append("date", r.FormValue("date"))
	payload.Append("author", r.FormValue("author"))
	payload.Append("tags", r.FormValue("tags"))
	payload.Append("body", r.FormValue("body"))

	result, err := client.MakeRequest("content", "create", payload)
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

func handleReadArticle(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	vars := mux.Vars(r)
	fmt.Println(vars["id"])
	id := vars["id"]

	payload := gmbh.NewPayload()
	payload.Append("id", id)
	result, _ := client.MakeRequest("content", "read", payload)

	e := result.GetPayload().GetAsString("error")
	article := result.GetPayload().Get("data")
	tmpl["err"] = e
	tmpl["article"] = article

	templates, err := getDefaultGuestTemplate(creds["perm"].(string), path.Join("tmpl", "content", "read.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", tmpl)
}

func handleManageArticle(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {

	articles, e := getArticles("headline", false, 10)
	tmpl["articles"] = articles
	tmpl["error"] = e
	tmpl["content"] = true

	templates, err := getAdminTemplate(creds["perm"].(string), path.Join("tmpl", "content", "manage.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "admin_template", tmpl)
}

func handleUpdateArticle(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	vars := mux.Vars(r)
	fmt.Println(vars["id"])
	id := vars["id"]

	payload := gmbh.NewPayload()
	payload.Append("id", id)
	result, _ := client.MakeRequest("content", "read", payload)

	e := result.GetPayload().GetAsString("error")
	article := result.GetPayload().Get("data")

	tmpl["err"] = e
	tmpl["article"] = article
	tmpl["width"] = 11
	tmpl["content"] = true

	templates, err := getAdminTemplate(creds["perm"].(string), path.Join("tmpl", "content", "update.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "admin_template", tmpl)
}

func handleUpdateArticlePost(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {

	vars := mux.Vars(r)

	payload := gmbh.NewPayload()
	payload.Append("id", vars["id"])
	payload.Append("title", r.FormValue("title"))
	payload.Append("date", time.Now().Format(time.RFC850))
	payload.Append("author", r.FormValue("author"))
	payload.Append("tags", r.FormValue("tags"))
	payload.Append("body", r.FormValue("body"))

	result, err := client.MakeRequest("content", "update", payload)
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

func handleDeleteArticlePost(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	vars := mux.Vars(r)
	payload := gmbh.NewPayload()
	payload.Append("id", vars["id"])
	result, err := client.MakeRequest("content", "delete", payload)
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
