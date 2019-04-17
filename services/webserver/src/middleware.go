package main

import (
	"net/http"
)

func admin(handler func(w http.ResponseWriter, r *http.Request)) func(w http.ResponseWriter, r *http.Request) {
	h := func(w http.ResponseWriter, r *http.Request) {
		c := getCreds(w, r)
		if c["perm"] != "admin" {
			http.Redirect(w, r, "/", 301)
			return
		}
		handler(w, r)
	}
	return h
}

func guest(handler func(w http.ResponseWriter, r *http.Request)) func(w http.ResponseWriter, r *http.Request) {
	h := func(w http.ResponseWriter, r *http.Request) {
		c := getCreds(w, r)
		if c["perm"] != "guest" {
			http.Redirect(w, r, "/", 301)
			return
		}
		handler(w, r)
	}
	return h
}

func user(handler func(w http.ResponseWriter, r *http.Request)) func(w http.ResponseWriter, r *http.Request) {
	h := func(w http.ResponseWriter, r *http.Request) {
		c := getCreds(w, r)
		if c["perm"] == "guest" {
			http.Redirect(w, r, "/accounts/login", 301)
			return
		}
		handler(w, r)
	}
	return h
}

func authenticated(handler func(w http.ResponseWriter, r *http.Request, creds, tmpl map[string]interface{})) func(w http.ResponseWriter, r *http.Request) {
	h := func(w http.ResponseWriter, r *http.Request) {
		c := getCreds(w, r)
		t := getTemplate(w, r, c)
		handler(w, r, c, t)
	}
	return h
}

func getCreds(w http.ResponseWriter, r *http.Request) map[string]interface{} {
	m := make(map[string]interface{})
	tknStr, err := getToken(r)
	if err != nil {
		m["perm"] = "guest"
		return m
	}
	valid, claims := validateToken(tknStr)
	if !valid {
		destroyToken(w, r)
		m["perm"] = "guest"
		return m
	}
	if claims["perm"] == "admin" {
		m["perm"] = "admin"
		m["username"] = claims["username"]
		return m
	} else if claims["perm"] == "user" {
		m["perm"] = "user"
		m["username"] = claims["username"]
		return m
	}
	m["perm"] = "guest"
	return m
}

func getTemplate(w http.ResponseWriter, r *http.Request, creds map[string]interface{}) map[string]interface{} {
	m := make(map[string]interface{})
	m["user"] = creds
	return m
}
