package main

import (
	"errors"
	"fmt"
	"net/http"
	"os"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gorilla/sessions"
)

var store = sessions.NewCookieStore([]byte(os.Getenv("RAILWAYSTORE")))
var tmpSecret = os.Getenv("RAILWAYAUTH")

func attachCookie(w *http.ResponseWriter, r *http.Request, token string) error {
	session, err := store.Get(r, "railway")
	if err != nil {
		return errors.New("Could not create a new session," + err.Error())
	}
	session.Values["token"] = token
	err = session.Save(r, *w)
	if err != nil {
		return errors.New("Could not create a new session," + err.Error())
	}
	return nil
}

func getToken(r *http.Request) (string, error) {
	session, err := store.Get(r, "railway")
	if err != nil {
		return "", errors.New("Could not access railway cookie.1")
	}
	token := session.Values["token"]
	if token == nil {
		fmt.Println(session.Values)
		return "", errors.New("Could not access railway cookie.2")
	}
	return token.(string), nil
}

func destroyToken(w http.ResponseWriter, r *http.Request) error {
	session, err := store.Get(r, "railway")
	if err != nil {
		return errors.New("Could not create a new sesion," + err.Error())
	}
	session.Values["token"] = "==="
	session.Options.MaxAge = -1
	session.Save(r, w)
	return nil
}

func validateToken(tokenString string) (bool, map[string]interface{}) {
	var emptyMap map[string]interface{}
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		key := []byte(tmpSecret)
		return key, nil
	})
	if err != nil {
		return false, emptyMap
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		_, ok := claims["data"].(map[string]interface{})
		if !ok {
			return false, nil
		}
		return true, claims["data"].(map[string]interface{})
	}
	return false, emptyMap
}
