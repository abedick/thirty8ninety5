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
	accountRoutes(r)

	r.HandleFunc("/", authenticated(handleIndex)).Methods("GET")
	r.HandleFunc("/manage", admin(authenticated(handleManage))).Methods("GET")

	log.Fatal(http.ListenAndServe(PORT, r))
}

func handleIndex(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	tmpl["title"] = "Home"

	articles, errstr := getArticles("", true, 10)
	tmpl["error"] = errstr
	tmpl["articles"] = articles

	templates, err := getDefaultGuestTemplate(creds["perm"].(string), path.Join("tmpl", "index.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "default_template", tmpl)
}

func handleManage(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{}) {
	tmpl["title"] = "Manage"
	tmpl["index"] = true

	templates, err := getAdminTemplate("admin", path.Join("tmpl", "admin", "index.gohtml"))
	if err != nil {
		http.Error(w, "500 Internal Server Error, parsing", 500)
		fmt.Println(err.Error())
		return
	}
	templates.ExecuteTemplate(w, "admin_template", tmpl)
}

func getDefaultGuestTemplate(display string, filenames ...string) (*template.Template, error) {

	files := append([]string{path.Join("tmpl", "default.gohtml")},
		filenames...)

	switch display {
	case "admin":
		files = append(files, path.Join("tmpl", "nav.admin.gohtml"))
	case "user":
		files = append(files, path.Join("tmpl", "nav.user.gohtml"))
	default:
		files = append(files, path.Join("tmpl", "nav.guest.gohtml"))
	}

	return template.ParseFiles(files...)
}

func getAdminTemplate(display string, filenames ...string) (*template.Template, error) {

	files := append([]string{path.Join("tmpl", "admin", "layout.gohtml")},
		filenames...)

	switch display {
	case "admin":
		files = append(files, path.Join("tmpl", "nav.admin.gohtml"))
	case "user":
		files = append(files, path.Join("tmpl", "nav.user.gohtml"))
	default:
		files = append(files, path.Join("tmpl", "nav.guest.gohtml"))
	}

	return template.ParseFiles(files...)
}

// getArticles makes a request through gmbh to the content server to retrieve
// num articles from the database and then they are sorted by time, newest
// first
func getArticles(typ string, active bool, num int) ([]interface{}, string) {
	payload := gmbh.NewPayload()
	payload.Append("range", num)
	if active {
		payload.Append("active", "true")
	}
	payload.Append("type", typ)
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
