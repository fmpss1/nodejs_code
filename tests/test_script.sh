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

















#curl -I localhost:8000
#curl -I localhost:8001

#kill -s SIGUSR2 3874

end=`date +%s`

runtime=$( echo "$end - $start" | bc -l )



#Apache Bench
#ab -n 10000 -c 100 http://localhost:8000/
