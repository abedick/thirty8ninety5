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

	r.HandleFunc("/login", handleLogin).Methods("GET")
	r.HandleFunc("/login", handleLoginPost).Methods("POST")
	r.HandleFunc("/register", handleRegister).Methods("GET")
	r.HandleFunc("/register", handleRegisterPost).Methods("POST")
	r.HandleFunc("/logout", handleLogout).Methods("GET")

	r.HandleFunc("/", handleIndex).Methods("GET")

	log.Fatal(http.ListenAndServe(PORT, r))
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	fmt.Println("incoming request")

	data, contentType := checkLoggedIn(w, r)
	templates, err := getDefaultGuestTemplate(contentType, path.Join("tmpl", "content", "index.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", data)
}

func getDefaultGuestTemplate(display content, filenames ...string) (*template.Template, error) {

	files := append([]string{path.Join("tmpl", "default.gohtml")},
		filenames...)

	switch display {
	case admin:
		files = append(files, path.Join("tmpl", "nav.admin.gohtml"))
	case user:
		files = append(files, path.Join("tmpl", "nav.user.gohtml"))
	default:
		files = append(files, path.Join("tmpl", "nav.guest.gohtml"))
	}

	return template.ParseFiles(files...)
}
