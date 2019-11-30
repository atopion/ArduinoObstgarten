/*
 * Arduino Obstgarten
 * created by atopion, 30.11.19
 * version 0.1
 */

#include <cstring>
#include "dummies/base.h"
#include "dummies/RH_ASK.h"
#include "dummies/SPI.h"


// GLOBAL SPACE
RH_ASK rf_driver;

char own_id = 0x03;
uint32_t own_seq = 0;

char id0 = 0x00;
char id1 = 0x01;
char id2 = 0x02;
char id4 = 0x04;
char id5 = 0x05;
char id6 = 0x06;
char id7 = 0x07;

uint32_t id0_seq = -1;
uint32_t id1_seq = -1;
uint32_t id2_seq = -1;
uint32_t id4_seq = -1;
uint32_t id5_seq = -1;
uint32_t id6_seq = -1;
uint32_t id7_seq = -1;


/* Package structure:
 *  - 1x magic number @ 1 byte: M (0x33 for ACK, 0x44 for Data)
 *  - 5x float payload values @ 4 bytes: PX
 *  - 1x char sender id @ 1 byte: I
 *  - 1x uint32_t sequence number @ 4 bytes: S
 *  => 26 bytes
 *
 *  Data packet:
 *     0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19   20   21   22   23   24   25
 *  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+
 *  |  M | P1 | P1 | P1 | P1 | P2 | P2 | P2 | P2 | P3 | P3 | P3 | P3 | P4 | P4 | P4 | P4 | P5 | P5 | P5 | P5 |  I |  S |  S |  S |  S |
 *  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+
 *
 *  ACK packet:
 *     0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19   20   21   22   23   24   25
 *  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+
 *  |  M |  I |  S |  S |  S |  S |  0 |  0 |  0 |  0 |  0 |  0 |  0 |  0 |  0 |  0 |  0 |  0 |  0 |  0 |  0 |  0 |  0 |  0 |  0 |  0 |
 *  +----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+----+
 */
uint8_t active_packet[26];
int data_open_counter = 0;

int analog_pin_1 = A0;
int analog_pin_2 = A1;
int analog_pin_3 = A2;
int analog_pin_4 = A3;
int analog_pin_5 = A4;

unsigned long last_time = 0;
unsigned long time_interval = 600000;  // 10 min

unsigned long random_last_time = 0;
unsigned long random_time_interval = 0;


// FUNCTION SPACE

void floatAsBytes(uint8_t result[4], float value) {
    memcpy(result, (unsigned char*) (&value), 4);
}

void intAsBytes(uint8_t result[4], uint32_t value) {
    memcpy(result, (unsigned char*) (&value), 4);
}

/* Check if id of packet is valid and sequence number of packet is bigger than saved sequence number */
bool check_sequence(const uint8_t *buf)
{
    // Check for valid id
    if(buf[21] > 7 || buf[21] == 3)
        return false;

    // Convert bytes
    uint32_t seq = 0;
    seq = (seq << 8) + buf[22];
    seq = (seq << 8) + buf[23];
    seq = (seq << 8) + buf[24];
    seq = (seq << 8) + buf[25];

    if(buf[21] == 0 && seq > id0_seq) { id0_seq = seq; return true; }
    if(buf[21] == 1 && seq > id1_seq) { id1_seq = seq; return true; }
    if(buf[21] == 2 && seq > id2_seq) { id2_seq = seq; return true; }

    if(buf[21] == 4 && seq > id4_seq) { id4_seq = seq; return true; }
    if(buf[21] == 5 && seq > id5_seq) { id5_seq = seq; return true; }
    if(buf[21] == 6 && seq > id6_seq) { id6_seq = seq; return true; }
    if(buf[21] == 7 && seq > id7_seq) { id7_seq = seq; return true; }
    return false;
}

void build_ack_packet(uint8_t buf[26], uint32_t seq, uint8_t id)
{
    buf[0] = 0x33;
    buf[1] = id;
    intAsBytes(&buf[2], seq);
    intAsBytes(&buf[6], 0);
    intAsBytes(&buf[10], 0);
    intAsBytes(&buf[14], 0);
    intAsBytes(&buf[18], 0);
    intAsBytes(&buf[22], 0);
}


void receive_and_forward() {
    uint8_t buf[26];
    uint8_t buflen = sizeof(buf);

    if(rf_driver.recv(buf, &buflen))
    {
        // Check for magic number (0x33 - ACK, 0x44 - data)
        if(buf[0] == 0x33)
        {
            uint32_t seq = 0;
            seq = (seq << 8) + buf[2];
            seq = (seq << 8) + buf[3];
            seq = (seq << 8) + buf[4];
            seq = (seq << 8) + buf[5];

            if(buf[1] == own_id && seq == own_seq -1)
                data_open_counter++;
        }
        else if(buf[0] == 0x44 && check_sequence(buf))
        {
            rf_driver.send(buf, buflen);
            rf_driver.waitPacketSent();

            // Antenna clear delay (arbitrary)
            delay(5);

            uint32_t seq = 0;
            seq = (seq << 8) + buf[22];
            seq = (seq << 8) + buf[23];
            seq = (seq << 8) + buf[24];
            seq = (seq << 8) + buf[25];

            uint8_t ack_buffer[26];
            build_ack_packet(ack_buffer, seq, buf[21]);

            rf_driver.send(ack_buffer, 26);
            rf_driver.waitPacketSent();

            // Antenna clear delay (arbitrary)
            delay(5);
        }
    }
}


// RUN SPACE

void setup() {
    Serial.begin(9600);
    rf_driver.init();
}

void loop() {

    // First: guard for overflow
    if((millis() < 1000000000 && last_time > 4000000000) || millis() - last_time > time_interval)
    {
        last_time = millis();

        // prepare packet
        float analogValue1 = analogRead(analog_pin_1);
        float analogValue2 = analogRead(analog_pin_2);
        float analogValue3 = analogRead(analog_pin_3);
        float analogValue4 = analogRead(analog_pin_4);
        float analogValue5 = analogRead(analog_pin_5);

        floatAsBytes(&active_packet[1], analogValue1);
        floatAsBytes(&active_packet[5], analogValue2);
        floatAsBytes(&active_packet[9], analogValue3);
        floatAsBytes(&active_packet[13], analogValue4);
        floatAsBytes(&active_packet[17], analogValue5);

        active_packet[21] = own_id;

        intAsBytes(&active_packet[22], own_seq);
        own_seq++;
        data_open_counter = 0;
        random_time_interval = random(500, 4000);

        // send packet
        rf_driver.send(active_packet, 26);
        rf_driver.waitPacketSent();

        // Antenna clear delay (arbitrary)
        delay(5);
    }

    if(data_open_counter < 3 && ((millis() < 1000000000 && random_last_time > 4000000000) || millis() - random_last_time > random_time_interval))
    {
        // resend packet
        rf_driver.send(active_packet, 26);
        rf_driver.waitPacketSent();

        // Antenna clear delay (arbitrary)
        delay(5);

        random_time_interval = random(500, 4000);
    }

    receive_and_forward();
    receive_and_forward();
    receive_and_forward();
    receive_and_forward();
}