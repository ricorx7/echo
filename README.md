A GO application that will allow you to use the serial port over the internet using a websocket connection.
View serial data and record serial data.


## BUILD
set GOPATH=PATH\To\GO
go build

## Run Application
echo --port COM5 --baud 115200 --record /home/user/DIR/

This will open a serial port connection to COM5 with a baudrate of 115200.  
Open up the web browser and go to the file path:
localhost:8989/serial

Communicate with the serial port using the web browser.

## Set IP Address if not viewing on localhost
If you are viewing the web browser from a different IP address, you will need to change the Websocket address.
 - Click the Status tab
 - Change the server address to match the address that the process is running on.  (ex: 192.168.1.1:8989/ws)
 - Click connect.
 - Then all the serial ports will be listed on the Serial Port tab.

Most of this code was derived from http://github.com/johnlauer/serial-port-json-server
