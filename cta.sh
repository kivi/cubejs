#!/bin/bash

interval=5000
max=150000

for i in `seq 0 $interval $max`
do
	node cta $i $interval
done
