package main

import (
	"fmt"
	"log"
	"net/http"
	"path"
	"sort"
	"text/template"
	"time"

	"github.com/gmbh-micro/gmbh"
	"github.com/gorilla/mux"
)

const PORT = ":8080"

var client *gmbh.Client

func main() {
	fmt.Println("starting webserver")

	runtime := gmbh.SetRuntime(gmbh.RuntimeOptions{Blocking: false, Verbose: true})
	service := gmbh.SetService(gmbh.ServiceOptions{Name: "webserver"})

	var err error
	client, err = gmbh.NewClient(runtime, service)
	if err != nil {
		panic(err)
	}

	client.Start()

	r := mux.NewRouter()

	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

	contentRoutes(r)

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
	usr, contentType := checkLoggedIn(w, r)
	tmpl := make(map[string]interface{})
	tmpl["user"] = usr

	payload := gmbh.NewPayload()
	payload.Append("range", "10")
	payload.Append("active", "true")
	result, err := client.MakeRequest("content", "readMany", payload)
	if err == nil {
		tmpl["error"] = result.GetPayload().GetAsString("error")
		rawArticles := result.GetPayload().Get("articles")
		arrayArticles, ok := rawArticles.([]interface{})
		if ok {
			sort.SliceStable(arrayArticles, func(i, j int) bool {
				ti, err := time.Parse(time.RFC850, arrayArticles[i].(map[string]interface{})["date"].(string))
				if err != nil {
					return false
				}
				tj, err := time.Parse(time.RFC850, arrayArticles[j].(map[string]interface{})["date"].(string))
				if err != nil {
					return false
				}
				if ti.After(tj) {
					return true
				}
				return false
			})
			tmpl["articles"] = arrayArticles
		} else {
			fmt.Println("issues with articles")
		}
	} else {
		tmpl["error"] = "internal server error"
	}

	templates, err := getDefaultGuestTemplate(contentType, path.Join("tmpl", "index.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", tmpl)
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

// getArticles makes a request through gmbh to the content server to retrieve
// num articles from the database and then they are sorted by time, newest
// first
func getArticles(t string, num int) ([]interface{}, string) {
	payload := gmbh.NewPayload()
	payload.Append("range", num)
	payload.Append("type", t)
	result, err := client.MakeRequest("content", "readMany", payload)

	e := ""
	articles := make([]interface{}, 0)

	if err == nil {
		e = result.GetPayload().GetAsString("error")
		rawArticles := result.GetPayload().Get("articles")
		arrayArticles, ok := rawArticles.([]interface{})
		if ok {
			sort.SliceStable(arrayArticles, func(i, j int) bool {
				ti, err := time.Parse(time.RFC850, arrayArticles[i].(map[string]interface{})["date"].(string))
				if err != nil {
					return false
				}
				tj, err := time.Parse(time.RFC850, arrayArticles[j].(map[string]interface{})["date"].(string))
				if err != nil {
					return false
				}
				if ti.After(tj) {
					return true
				}
				return false
			})
			articles = arrayArticles
		} else {
			fmt.Println("issues with articles")
		}
	} else {
		e = "internal server error"
	}

	return articles, e
}
