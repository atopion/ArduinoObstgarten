/*
 * Created by atopion on 30.11.2019.
 *
 * Dummy implementations for the Arduino Obstgarten project
 */

#include <iostream>
#include <chrono>
#include <thread>

#ifndef ARDUINOOBSTGARTEN_DUMMIES_H
#define ARDUINOOBSTGARTEN_DUMMIES_H

// Classes
class Serial_type {
public:
    void begin(int baud) {}
    void print  (const std::string &str) { std::cout << str; }
    void println(const std::string &str) { std::cout << str << std::endl; }
    void write  (const std::string &str) { std::cout << str; }
};

Serial_type Serial;

typedef std::string String;

// Functions
void pinMode(int pin, int mode) {}

void digitalWrite(int pin, int mode) {
    std::string m = (mode == 0x21 ? "HIGH" : (mode == 0x22 ? "LOW" : "undefined"));
    if(pin >= 0x10) std::cerr << "Pin A" << (pin - 0x10) << " is set to " << m << std::endl;
    else std::cerr << "Pin " << pin << " is set to " << m << std::endl;
}

float analogRead(int pin) { return 0.0; }

void delay(int ms) { std::this_thread::sleep_for(std::chrono::milliseconds(ms)); }

unsigned long millis() { return 10000000; }

long random(int min, int max) { return 25623; }
// Statics

// Pins
int A0 = 0x10;
int A1 = 0x11;
int A2 = 0x12;
int A3 = 0x13;
int A4 = 0x14;
int A5 = 0x15;
int A6 = 0x16;
int LED_BUILDIN = 0x17;

// Modes
int OUTPUT = 0x20;
int HIGH = 0x21;
int LOW = 0x22;


#endif //ARDUINOOBSTGARTEN_DUMMIES_H
