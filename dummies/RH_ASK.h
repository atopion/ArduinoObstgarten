//
// Created by atopi on 30.11.2019.
//

#ifndef ARDUINOOBSTGARTEN_RH_ASK_H
#define ARDUINOOBSTGARTEN_RH_ASK_H

#include <iostream>
#include <cstdint>

class RH_ASK {
public:
    void init() {}
    void send(uint8_t* msg, size_t len) {
        std::cerr << "Message send: ";
        for(size_t i = 0; i < len; i++)
            std::cerr << msg[i];
        std::cerr << std::endl;
    }
    void waitPacketSent() {}
    bool recv(uint8_t *buf, uint8_t *bufsize) { return true; }

};


#endif //ARDUINOOBSTGARTEN_RH_ASK_H
