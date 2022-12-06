from urllib.request import ProxyBasicAuthHandler
import pymongo

myclient = pymongo.MongoClient("mongodb://root@yitigerliu.com", password='root')
mydb = myclient['dinnerpartyDB']
collection = mydb['recipes_recipe']

for doc in collection.find({ "id": 170 }, {"title": 1}):
    try:
        doc.pop('image')
    except:
        pass
    # print("")
    print(doc)

doc_count = collection.count_documents({})
print(doc_count)