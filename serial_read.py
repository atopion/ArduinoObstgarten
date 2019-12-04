import serial
import time
import sys
import os


ser = serial.Serial("/dev/ttyACM0", 9600)
print(ser.name)
while True:
    data = ser.read()
    if data == "&":
        print("Received Reset Signal, resetting Pi...")
        time.sleep(1)
        os.system("/sbin/shutdown -r now")
        #sys.exit(0)
    else:
        print(data)

#with serial.Serial('/dev/ttyACM0', 9600, timeout=1) as ser:
#    x = ser.read()          # read one byte
#    s = ser.read(10)        # read up to ten bytes (timeout)
#    line = ser.readline()   # read a '\n' terminated line
#    print(line);
