
/*
Script de testes
Este script é constituído por vários cenários, que após criados são testados com o loadtest.
O resultado obtido serve para fundamentar as conclusões para a solução a implementar.
*/




//Entre cada cenário forçar a limpeza dos portos usados - tentar por neste script o comando !!! ver na net
//Todos os portos ativos
netstat -a
netstat -a -n -o







//MASTER

curl -X POST \ --user 'id:secret' \ --data ...

//LDAP testes
ldapsearch -H ldap://localhost:1389 -x -D cn=root -w secret -LLL -b "o=joyent" objectclass=* cn=root

localhost:3000/api/login?team=user&username=user&password=user
localhost:3000/api/logout?token=0.6600718819536269
localhost:3000/api/login?team=teste&username=teste&password=teste




//SCALE


//Cenário 010101
//WORKER
curl -I localhost:8005			//ou mesmo só curl sem o -I -- Testar
//CPs
curl -I localhost:8050
//loadtest
loadtest localhost -t 10 -c 1

//Cenário 010501
//WORKER
curl -I localhost:8005
//CPs

for (i = 0; i < 5; i++) {
	curl -I "localhost:805"+i;
}
curl -I localhost:8050
curl -I localhost:8051
curl -I localhost:8052
curl -I localhost:8053
curl -I localhost:8054
//loadtest
loadtest localhost -t 10 -c 1

//Cenário 011001
//WORKER
curl -I localhost:8005
//CPs
curl -I localhost:8050
curl -I localhost:8051
curl -I localhost:8052
curl -I localhost:8053
curl -I localhost:8054
curl -I localhost:8055
curl -I localhost:8056
curl -I localhost:8057
curl -I localhost:8058
curl -I localhost:8059
//loadtest
loadtest localhost -t 10 -c 1





	




-------------------------------test_script.sh

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



#kill -s SIGUSR2 3874

end=`date +%s`

runtime=$( echo "$end - $start" | bc -l )
