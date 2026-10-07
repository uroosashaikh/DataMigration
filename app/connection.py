import pymysql
import sys

def connect():
    prod = False
    ##prod = True
    database="dataMigration"
    password = ""
    testpass = "compaq94"
    usr = ""
    testusr = "root"
    prodDB = ""
    localDB = "localhost"
    print("establishing DB Connection")
    if len(sys.argv) > 1:
        prod = sys.argv[1:][0]
    
    if prod == True:
        print("using Prod")
        return pymysql.connect(host=prodDB,port=3307,user=usr,passwd=password,db=database)
    else:
        print("using test")
        return pymysql.connect(host=localDB, port=3306, user=testusr, passwd=testpass, db=database)
