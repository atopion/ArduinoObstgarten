param(
    [Parameter(Mandatory=$true)][String]$version="0.0.0"
)

Set-Location C:\code\node\ArduinoObstgarten\frontend\

Set-Location Login\
ionic build

Set-Location ..\ArduinoObstgarten\
ionic build

Set-Location ..\Server
tsc

Set-Location ..\
docker build -t atopi/arduino_obstgarten:$version -f .\docker\Dockerfile .

docker tag atopi/arduino_obstgarten:$version atopi/arduino_obstgarten:latest
docker tag atopi/arduino_obstgarten:$version registry.atopion.com/arduino_obstgarten:$version
docker tag atopi/arduino_obstgarten:$version registry.atopion.com/arduino_obstgarten:latest

docker push registry.atopion.com/arduino_obstgarten:latest