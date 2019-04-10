package main

import (
	"fmt"
	"log"
	"net/http"
	"path"
	"text/template"

	"github.com/gmbh-micro/gmbh"
	"github.com/gorilla/mux"
)

const PORT = ":8080"

var client *gmbh.Client

func main() {
	fmt.Println("starting webserver")

	runtime := gmbh.SetRuntime(gmbh.RuntimeOptions{Blocking: false, Verbose: true})
	service := gmbh.SetService(gmbh.ServiceOptions{Name: "content-server"})

	var err error
	client, err = gmbh.NewClient(runtime, service)
	if err != nil {
		panic(err)
	}

	client.Start()

	r := mux.NewRouter()

	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	r.HandleFunc("/", handleIndex).Methods("GET")

	r.HandleFunc("/login", handleLogin).Methods("GET")
	r.HandleFunc("/login", handleLoginPost).Methods("POST")

	log.Fatal(http.ListenAndServe(PORT, r))
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	fmt.Println("incoming request")

	templates, err := getDefaultGuestTemplate(path.Join("tmpl", "content", "index.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", nil)
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	fmt.Println("incoming login request")

	templates, err := getDefaultGuestTemplate(path.Join("tmpl", "content", "login.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", nil)
}

func handleLoginPost(w http.ResponseWriter, r *http.Request) {

	u, p, ok := r.BasicAuth()
	if ok {
		fmt.Println(u, p)
	} else {
		fmt.Println("not okay")
	}

	payload := gmbh.NewPayload()
	payload.AppendStringField("user", u)
	payload.AppendStringField("pass", p)
	result, err := client.MakeRequest("auth", "grant", payload)
	if err != nil {
		fmt.Println(err.Error())
	} else {
		fmt.Println(result)
	}

	w.Write([]byte("test-response"))
}

func getDefaultGuestTemplate(filenames ...string) (*template.Template, error) {
	return template.ParseFiles(
		append([]string{
			path.Join("tmpl", "default.gohtml"),
			path.Join("tmpl", "nav.gohtml")},
			filenames...,
		)...,
	)
}
