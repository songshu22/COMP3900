# from db.db_access import db_insert_one

import pymongo
from pymongo import MongoClient
from pymongo import MongoClient


def get_database():
    # Provide the mongodb atlas url to connect python to mongodb using pymongo
    CONNECTION_STRING = "mongodb+srv://dev:devdinnerparty@dev-cluster.uc4votw.mongodb.net/?retryWrites=true&w=majority"

    # Create a connection using MongoClient. You can import MongoClient or use pymongo.MongoClient
    client = MongoClient(CONNECTION_STRING)

    # Create the database for our example (we will use the same database throughout the tutorial
    return client['dinnerparty']
    

def db_insert_one(col, dict):
    dbname = get_database()
    mycol = dbname[col]
    res = mycol.insert_one(dict)
    # print(res.inserted_id)
    return res.inserted_id

def db_update_one(col, old, new):
    dbname = get_database()
    mycol = dbname[col]
    mycol.update_one(old, new)
"""
    Find the all documents in the collection
"""
def db_find_all(col):
    dbname = get_database()
    mycol = dbname[col]
    # for x in mycol.find():
    #     print(x)
    return mycol.find()

"""
    querying
    e.g. to find document(s) with the name "Christian Yu"
         col = "Users"
         query = { "name": "Christian Yu" }
"""
def db_query(col, query):
    dbname = get_database()
    mycol = dbname[col]
    mydoc = mycol.find(query)
    # for x in mydoc:
    #     print(x)
    return mydoc

"""
    Delete the document with the name "Christian Yu":
    e.g.col = "Users 
        query = { "name": "Christian Yu" }
"""
def db_delete_one(col, query):
    dbname = get_database()
    mycol = dbname[col]
    mycol.delete_one(query)

"""
    Delete all the documents in a collection
"""
def db_delete_all(col):
    dbname = get_database()
    mycol = dbname[col]
    res = mycol.delete_many({})
    print(res.deleted_count, " documents deleted.")


# This is added so that many files can reuse the function get_database()
if __name__ == "__main__":    
    
    # Get the database
    # dbname = get_database()
    # db_insert_one("Users", {"name": "test01", "password": "pass"})
    db_update_one("Users",{ "name": "Chris" }, { "$set": { "name": "Christian Yu" } })