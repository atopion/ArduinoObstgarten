import serial
import time
import sys
import os

ser = serial.Serial("/dev/ttyACM0", 9600)

print(ser.name)
val = ""
while True:
    data = ser.read()

    if data.decode() == "\n":
        if val.startswith("l"):
            print("it's light")
        print(val)
        val = ""
        continue
    else:
        val += data.decode()
    if data.decode() == "&":
        print("Received Reset Signal, resetting Pi...")
        # time.sleep(0.1)
        # os.system("/sbin/shutdown -r now")
        #sys.exit(0)
    else:
        continue
        # print(val)

#with serial.Serial('/dev/ttyACM0', 9600, timeout=1) as ser:
#    x = ser.read()          # read one byte
#    s = ser.read(10)        # read up to ten bytes (timeout)
#    line = ser.readline()   # read a '\n' terminated line
#    print(line);
