/*
  Graph

  A simple example of communication from the Arduino board to the computer: The
  value of analog input 0 is sent out the serial port. We call this "serial"
  communication because the connection appears to both the Arduino and the
  computer as a serial port, even though it may actually use a USB cable. Bytes
  are sent one after another (serially) from the Arduino to the computer.

  You can use the Arduino Serial Monitor to view the sent data, or it can be
  read by Processing, PD, Max/MSP, or any other program capable of reading data
  from a serial port. The Processing code below graphs the data received so you
  can see the value of the analog input changing over time.

  The circuit:
  - any analog input sensor attached to analog in pin 0

  created 2006
  by David A. Mellis
  modified 9 Apr 2012
  by Tom Igoe and Scott Fitzgerald

  This example code is in the public domain.

  http://www.arduino.cc/en/Tutorial/Graph
*/

int button = 0;
const char reset_signal = '&';
int butt_stat = 0;
float avg = 0.0;
const int samples = 10;
float sampling_array[samples];
int pos = 0;
float sum;
int thresh = 523;
float humidity = 0.0;


void setup() {
  // initialize the serial communication:
  Serial.begin(9600);
  //pinMode(button, INPUT);
}

void loop() {
  // send the value of analog input 0:
  butt_stat = digitalRead(button);
  if (butt_stat == LOW){
    Serial.println(reset_signal);
    //for(int i=0;i<100;i++){
      //Serial.println("!!!");
    //}
    
  }
  pos = pos % samples;
  humidity = (float)analogRead(A4);
  sampling_array[pos] = humidity;
  pos++;
  sum = 0;
  
  for (int i=0; i<samples;i++){   // sum up last samples
    sum = sum + sampling_array[i];
  }
  
  
  avg = sum/samples;  // take average of last samples
  if (avg <= thresh){
    Serial.print("h");
    Serial.println(0);
  } else {
    Serial.print("h");
    Serial.println(avg - thresh);
  }
  
  Serial.print("l");
  Serial.println(analogRead(A0));

  Serial.println("e");
  // wait a bit for the analog-to-digital converter to stabilize after the last
  // reading:
  delay(20000);
}
