package main

import "fmt"

const url = "mongodb://localhost:27017"
const col = "user_accounts"

// User - For handling users stored and returned from the database
type User struct {
	Username string `bson:"Username" json:"Username"`
	Password string `bson:"Password"`
	Name     string `bson:"Name" json:"Name"`
	Email    string `bson:"Email" json:"Email"`
	Created  string `bson:"Created" json:"Created"`
	Updated  string `bson:"Updated" json:"Updated"`
	PermLvl  int    `bson:"PermLvl" json:"PermLvl"`
	Admin    bool   `bson:"Admin"`
}

func main() {
	conn := NewMongoClient(url, col)
	err := conn.Connect()
	if err != nil {
		panic(err)
	}
	fmt.Println("connected")

	// u := User{
	// 	Username: "abe dick",
	// 	Password: "soemthing",
	// 	Name:     "abe",
	// 	Email:    "test@test.com",
	// 	Created:  "earlier",
	// 	Updated:  "now",
	// 	PermLvl:  100,
	// 	Admin:    true,
	// }
	// err = conn.AddUserToAccounts(u)
	// if err != nil {
	// 	panic(err)
	// }
}
