#!/bin/bash

start=`date +%s`



echo Teste servidor porto:4000
for i in {0..100}
do
	curl localhost:4000
done


echo Teste servidores cluster vários portos
for i in {0..10}
do
	curl localhost:8000
done





#LDAP testes
ldapsearch -H ldap://localhost:1389 -x -D cn=root -w secret -LLL -b "o=joyent" objectclass=* cn=root



#curl -I localhost:8000
#curl -I localhost:8001

#kill -s SIGUSR2 3874

end=`date +%s`

runtime=$( echo "$end - $start" | bc -l )



#Apache Bench
#ab -n 10000 -c 100 http://localhost:8000/


localhost:3000/api/login?team=user&username=user&password=user
localhost:3000/api/logout?token=0.6600718819536269
localhost:3000/api/login?team=teste&username=teste&password=teste



jsdoc -d=jsdoc app.js
jsdoc -d=jsdoc routes/api.js
jsdoc -d=jsdoc module_master/ldap.js

