#!/bin/bash

#Cenário 010101


echo Teste servidores cluster vários portos
for i in {0..5}
do
	#WORKER
	curl -I http://localhost:8005
	#CPs
	#curl -I http://localhost:8050 é necessário alterar os portos no código ainda!!!
done
#loadtest
loadtest http://localhost:8005 -t 10 -c 1
