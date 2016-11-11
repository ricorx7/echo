package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"text/template"
)

///
/// Flags to set at startup
///
var (
	version      = "0.1"
	versionFloat = float32(0.1)
	addr         = flag.String("addr", ":8989", "http service address")
	port         = flag.String("port", "", "Serial COM Port")
	baud         = flag.String("baud", "115200", "Baud Rate")
	record       = flag.String("record", "", "Folder Path to record")
)

// serialHander passes the template
// to the http request.
func serialHandler(c http.ResponseWriter, req *http.Request) {
	//homeTemplate.Execute(c, req.Host)
	t, _ := template.ParseFiles("serial.html")
	t.Execute(c, nil)
}

// main will start the application.
func main() {
	// Parse the flags
	flag.Parse()

	// setup logging
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

	// Display the flags
	log.Println("Port:" + *port)
	log.Println("Baud:" + *baud)
	log.Println("Addr: " + *addr)
	log.Println("Record Path: " + *record)

	// Convert the baud rate to int
	baudInt, err := strconv.Atoi(*baud)
	if err != nil {
		log.Println("Baud rate give is bad")
		return
	}

	// Start Echo
	go echo.init(port, baudInt)

	// HTTP server
	http.Handle("/react/", http.StripPrefix("/react/", http.FileServer(http.Dir("react")))) // React Frontend folder

	// Record folder
	http.Handle("/record/", http.StripPrefix("/record/", http.FileServer(http.Dir("record")))) // Record folder

	http.HandleFunc("/serial", serialHandler)                                                  // Display the websocket data
	http.HandleFunc("/ws", wsHandler)                                                          // wsHandler in websocketConn.go.  Creates websocket
	http.Handle("/client/", http.StripPrefix("/client/", http.FileServer(http.Dir("client")))) // React Frontend folder

	// API
	http.HandleFunc("/serial/list", echoListSerialHandler)             // List the serial ports
	http.HandleFunc("/serial/connect", echoConnectSerialHandler)       //Connect serial port
	http.HandleFunc("/serial/disconnect", echoDisconnectSerialHandler) // Disconnect serial port

	if err := http.ListenAndServe(*addr, nil); err != nil {
		fmt.Printf("Error trying to bind to port: %v, so exiting...", err)
		log.Fatal("Error ListenAndServe:", err)
	}
}

// CheckError will check the error message and display if
// found one.
func CheckError(err error) {
	if err != nil {
		fmt.Println("Error: ", err)
	}
}

// CheckErrorStr will check the error message and display if
// found one.
func CheckErrorStr(err string) {
	if len(err) > 0 {
		fmt.Println("Error: ", err)
	}
}
