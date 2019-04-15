package main

import (
	"fmt"
	"net/http"
	"path"
	"time"

	"github.com/gorilla/mux"
)

func contentRoutes(r *mux.Router) {
	r.HandleFunc("/content/new", handleNewArticle).Methods("GET")
	r.HandleFunc("/content/new", handleNewArticlePost).Methods("POST")
}

func handleNewArticle(w http.ResponseWriter, r *http.Request) {
	fmt.Println("new article")

	data, contentType := checkLoggedIn(w, r)

	templates, err := getDefaultGuestTemplate(contentType, path.Join("tmpl", "content", "new.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	data.(map[string]interface{})["date"] = time.Now().Format(time.RFC850)
	templates.ExecuteTemplate(w, "default_template", data)
}

func handleNewArticlePost(w http.ResponseWriter, r *http.Request) {

}
