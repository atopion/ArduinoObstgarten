import serial
import requests
import json
import time
import sys
import os

def lastIndexOf(str, val):
    for i in range(len(str)-1, 0, -1):
        if str[i] == val:
            return i


sleeptime = 300
sleepcounter = 0

nodekey = open("/etc/nodekey").read()

serial = serial.Serial("/dev/ttyACM0", 9600)

print(serial.name)
val = ""

packet_sunlight = { 'key': nodekey, 'type': 'sunlight', 'sensor': 0, 'value': 0.0 }
packet_humidity = { 'key': nodekey, 'type': 'sunlight', 'sensor': 0, 'value': 0.0 }

while True:
    data = serial.read().decode()

    if data == "&":
        print("Received Reset Signal, resetting Pi...")
        time.sleep(0.1)
        #os.system("/sbin/shutdown -r now")
        #sys.exit(0)

    elif data == "\n":
        if val.startswith("l"):
            val = val[lastIndexOf(val, "l"):]
            packet_sunlight['value'] = float(val[1:])
        elif val.startswith("h"):
            val = val[lastIndexOf(val, "h"):]
            packet_humidity['value'] = float(val[1:])
        else:
            continue
        #print("VAL:", val)
        val = ""

    elif data == "e":

        requests.post("https://bat-obstgarten.de:3000", json=packet_sunlight)
        requests.post("https://bat-obstgarten.de:3000", json=packet_humidity)

        time.sleep(sleeptime)
        sleepcounter += 1
        serial.flush()

        if sleepcounter >= 288:
            time.sleep(0.1)
            print("RESTART")
            #os.system("/sbin/shutdown -r now")
            #sys.exit(0)

    else:
        val += data



        

#with serial.Serial('/dev/ttyACM0', 9600, timeout=1) as ser:
#    x = ser.read()          # read one byte
#    s = ser.read(10)        # read up to ten bytes (timeout)
#    line = ser.readline()   # read a '\n' terminated line
#    print(line);
