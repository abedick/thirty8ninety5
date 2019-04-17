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
	r.HandleFunc("/content/new", handleNewArticle).Methods("GET")
	r.HandleFunc("/content/new", handleNewArticlePost).Methods("POST")

	r.HandleFunc("/content/articles/{id}", handleReadArticle)

	r.HandleFunc("/content/manage", handleManageArticle)
	r.HandleFunc("/content/manage/update/{id}", handleUpdateArticle).Methods("GET")

	r.HandleFunc("/content/manage/update/{id}", handleUpdateArticlePost).Methods("POST")
	r.HandleFunc("/content/manage/delete/{id}", handleDeleteArticlePost).Methods("POST")
}

func handleNewArticle(w http.ResponseWriter, r *http.Request) {
	fmt.Println("new article")

	usr, contentType := checkLoggedIn(w, r)
	tmpl := make(map[string]interface{})
	tmpl["user"] = usr
	tmpl["date"] = time.Now().Format(time.RFC850)
	templates, err := getDefaultGuestTemplate(contentType, path.Join("tmpl", "content", "new.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", tmpl)
}

func handleNewArticlePost(w http.ResponseWriter, r *http.Request) {

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

func handleReadArticle(w http.ResponseWriter, r *http.Request) {

	usr, contentType := checkLoggedIn(w, r)

	vars := mux.Vars(r)
	fmt.Println(vars["id"])
	id := vars["id"]

	payload := gmbh.NewPayload()
	payload.Append("id", id)
	result, _ := client.MakeRequest("content", "read", payload)

	e := result.GetPayload().GetAsString("error")
	article := result.GetPayload().Get("data")

	tmpl := make(map[string]interface{})
	tmpl["user"] = usr
	tmpl["err"] = e
	tmpl["article"] = article

	templates, err := getDefaultGuestTemplate(contentType, path.Join("tmpl", "content", "read.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", tmpl)
}

func handleManageArticle(w http.ResponseWriter, r *http.Request) {

	usr, contentType := checkLoggedIn(w, r)
	if contentType != admin {
		http.Redirect(w, r, "/", 301)
		return
	}
	tmpl := make(map[string]interface{})
	tmpl["user"] = usr

	articles, e := getArticles("headline", 10)
	tmpl["articles"] = articles
	tmpl["error"] = e

	templates, err := getDefaultGuestTemplate(contentType, path.Join("tmpl", "content", "manage.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", tmpl)
}

func handleUpdateArticle(w http.ResponseWriter, r *http.Request) {
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
	result, _ := client.MakeRequest("content", "read", payload)

	e := result.GetPayload().GetAsString("error")
	article := result.GetPayload().Get("data")

	tmpl := make(map[string]interface{})
	tmpl["user"] = usr
	tmpl["err"] = e
	tmpl["article"] = article

	templates, err := getDefaultGuestTemplate(contentType, path.Join("tmpl", "content", "update.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", tmpl)
}

func handleUpdateArticlePost(w http.ResponseWriter, r *http.Request) {
	_, contentType := checkLoggedIn(w, r)
	if contentType != admin {
		http.Redirect(w, r, "/", 301)
		return
	}

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

func handleDeleteArticlePost(w http.ResponseWriter, r *http.Request) {
	_, contentType := checkLoggedIn(w, r)
	if contentType != admin {
		http.Redirect(w, r, "/", 301)
		return
	}
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
