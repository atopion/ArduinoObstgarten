cmake_minimum_required(VERSION 3.15)
project(ArduinoObstgarten)

set(CMAKE_CXX_STANDARD 14)

add_executable(ArduinoObstgarten main.cpp dummies/base.h dummies/RH_ASK.h dummies/SPI.h)