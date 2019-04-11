package main

import (
	"errors"
	"fmt"

	mgo "gopkg.in/mgo.v2"
)

// Mongodb - holds basic mongo database information
type Mongodb struct {
	Connected         bool
	Address           string
	Database          string
	Session           *mgo.Session
	AccountCollection string
}

// NewMongoClient returns a new mongodb object
func NewMongoClient(addr, collection string) *Mongodb {
	return &Mongodb{
		Address:           addr,
		AccountCollection: collection,
	}
}

// Connect - connects to mongodb at specified server
func (m *Mongodb) Connect() error {
	var err error
	m.Session, err = mgo.Dial(m.Address)
	if err != nil {
		errMsg := fmt.Sprintf("Could not connect to Mongo DB: %s", err.Error())
		return errors.New(errMsg)
	}
	m.Connected = true
	return nil
}

// // RetrieveAccountByUsername - returns the account assocaited with the user string
// // Note* Caller must handle all validation
// func (m *Mongodb) RetrieveAccountByUsername(user string) (account.User, error) {
// 	var usr account.User
// 	sess := m.Session.Clone()
// 	err := sess.DB(m.Database).C(m.AccountCollection).Find(bson.M{"Username": user}).One(&usr)
// 	sess.Close()
// 	return usr, err
// }

// // RetrieveAccountByRailwayID - returns the account assocaited with the RailwayID string
// // Note* Caller must handle all validation
// func (m *Mongodb) RetrieveAccountByRailwayID(id string) (account.User, error) {
// 	var usr account.User
// 	sess := m.Session.Clone()
// 	err := sess.DB(m.Database).C(m.AccountCollection).Find(bson.M{"RailwayID": id}).One(&usr)
// 	sess.Close()
// 	return usr, err
// }

// // RetrieveAccountsByIndex - returns all accounts in the specified start and stop range
// func (m *Mongodb) RetrieveAccountsByIndex(start, stop int) ([]account.User, error) {
// 	var usrs []account.User
// 	sess := m.Session.Clone()
// 	err := sess.DB(m.Database).C(m.AccountCollection).Find(nil).Skip(start).Limit(stop - start).All(&usrs)
// 	sess.Close()
// 	return usrs, err
// }

// // CountAccounts - returns number of accounts
// func (m *Mongodb) CountAccounts() int {
// 	sess := m.Session.Clone()
// 	count, err := sess.DB(m.Database).C(m.AccountCollection).Find(nil).Count()
// 	if err != nil {
// 		return 0
// 	}
// 	return count
// }

// AddUserToAccounts - adds the user to the account table
// Note* Caller must handle all validation
func (m *Mongodb) AddUserToAccounts(usr User) error {
	sess := m.Session.Clone()
	err := sess.DB(m.Database).C(m.AccountCollection).Insert(&usr)
	sess.Close()
	return err
}

// // UpdateUserAccount - adds the user to the account table
// // Note* Caller must handle all validation
// func (m *Mongodb) UpdateUserAccount(usr account.User) error {
// 	sess := m.Session.Clone()
// 	err := sess.DB(m.Database).C(m.AccountCollection).Update(bson.M{"RailwayID": usr.RailwayID}, usr)
// 	sess.Close()
// 	return err
// }

// // SearchAccountsForUniqueUsername - Returns all accounts that have the same username
// // Should only ever return a slice of length one.
// func (m *Mongodb) SearchAccountsForUniqueUsername(user string) (bool, error) {
// 	sess := m.Session.Clone()
// 	count, err := sess.DB(m.Database).C(m.AccountCollection).Find(bson.M{"Username": user}).Count()
// 	if count == 0 && err == nil {
// 		return true, err
// 	}
// 	return false, err
// }
