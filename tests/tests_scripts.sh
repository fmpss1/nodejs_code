#!/bin/bash

#node -v
#npm -v
#curl http://localhost:3000/api | jq


########################################################################
###Cenário 010101 1s
#for i in {0..0}
#do
	#WORKER
#	curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 1 -t 1




###Cenário 010105 1s
#for i in {0..0}
#do
        #WORKER
#        curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 5 -t 1




###Cenário 010110 1s
#for i in {0..0}
#do
        #WORKER
#        curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 10 -t 1




###Cenário 010110 1s
#for i in {0..0}
#do
        #WORKER
#        curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 30 -t 1
########################################################################




########################################################################
###Cenário 010101 5s
#for i in {0..0}
#do
        #WORKER
#       curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 1 -t 5




###Cenário 010105 5s
#for i in {0..0}
#do
        #WORKER
#        curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 5 -t 5




###Cenário 010110 5s
#for i in {0..0}
#do
        #WORKER
#        curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 10 -t 5




###Cenário 010110 5s
#for i in {0..0}
#do
        #WORKER
#        curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 30 -t 5
########################################################################




########################################################################
###Cenário 010101 10s
#for i in {0..0}
#do
        #WORKER
#       curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 1 -t 10




###Cenário 010105 10s
#for i in {0..0}
#do
        #WORKER
#        curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 5 -t 10




###Cenário 010110 10s
#for i in {0..0}
#do
        #WORKER
#        curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 10 -t 10




###Cenário 010110 10s
#for i in {0..0}
#do
        #WORKER
#        curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 30 -t 10
########################################################################




########################################################################
###Cenário 010101 30s
#for i in {0..0}
#do
        #WORKER
#       curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 1 -t 30




###Cenário 010105 30s
#for i in {0..0}
#do
        #WORKER
#        curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 5 -t 30




###Cenário 010110 30s
#for i in {0..0}
#do
        #WORKER
#        curl -I http://localhost:8005
#done
#loadtest
#loadtest http://localhost:8050 -c 10 -t 30




###Cenário 010110 30s
for i in {0..0}
do
        #WORKER
        curl -I http://localhost:8005
done
#loadtest
loadtest http://localhost:8050 -c 30 -t 30
########################################################################








