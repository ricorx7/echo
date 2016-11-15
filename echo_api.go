package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

// Connect the serial port with the given baud rate and port.
func echoConnectSerialHandler(w http.ResponseWriter, r *http.Request) {
	// Get the value of the "id" parameters.
	//id := bone.GetValue(r, "id")

	switch r.Method {
	case "GET":
		{
			// Get the port name
			portname := ""
			if len(r.URL.Query().Get("port")) > 0 {
				portname = r.URL.Query().Get("port")
			} else {
				err := "Serial port could not be found."
				CheckErrorStr(err)
			}

			// Get the baud rate
			baud := 115200
			if len(r.URL.Query().Get("baud")) > 0 {
				baud1, err := strconv.Atoi(r.URL.Query().Get("baud"))
				if err != nil {
					baud = baud1
				}

				CheckError(err)
			} else {
				err := "Buad rate could not be found."
				CheckErrorStr(err)
			}

			// Open the serial port
			config := openSerialPort(portname, baud)
			jsonConfig, err := json.Marshal(config)
			CheckError(err)
			msg := SpPortMessage{portname, string(jsonConfig), 0}

			fmt.Printf("Open Serial port: %v\n", config)

			// Set data type and OK status
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusOK)

			if err := json.NewEncoder(w).Encode(msg); err != nil {
				panic(err)
			}
		}
	case "POST":
		{

		}
	default:
		{

		}

	}
}

// Disconnect the serial port with the given baud rate and port.
func echoDisconnectSerialHandler(w http.ResponseWriter, r *http.Request) {
	// Get the value of the "id" parameters.
	//id := bone.GetValue(r, "id")

	switch r.Method {
	case "GET":
		{
			// Get the port name
			portname := ""
			if len(r.URL.Query().Get("port")) > 0 {
				portname = r.URL.Query().Get("port")
			} else {
				err := "Serial port could not be found."
				CheckErrorStr(err)
			}

			// Close the serial port
			closeSerialPort(portname)

			msg := SpPortMessage{portname, "Disconnected", 0}

			fmt.Printf("Close Serial port\n")

			// Set data type and OK status
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusOK)

			if err := json.NewEncoder(w).Encode(msg); err != nil {
				panic(err)
			}
		}
	case "POST":
		{

		}
	default:
		{

		}

	}
}

// Get the serial Port list.
func echoListSerialHandler(w http.ResponseWriter, r *http.Request) {
	// Get the value of the "id" parameters.
	//id := bone.GetValue(r, "id")

	switch r.Method {
	case "GET":
		{
			// Get the serial port list
			spl := serialPortList()

			fmt.Printf("Get Serial port list\n")

			// Set data type and OK status
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusOK)

			if err := json.NewEncoder(w).Encode(spl); err != nil {
				panic(err)
			}
		}
	case "POST":
		{

		}
	default:
		{

		}

	}
}

// Get the list of all the files to record.
func echoListFilesHandler(w http.ResponseWriter, r *http.Request) {
	// Get the value of the "id" parameters.
	//id := bone.GetValue(r, "id")

	switch r.Method {
	case "GET":
		{
			// Get the serial port list
			files := getFileList()

			fmt.Println("Get file list: ", files)

			// Set data type and OK status
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusOK)

			if err := json.NewEncoder(w).Encode(files); err != nil {
				fmt.Println(err)
				panic(err)
			}
		}
	case "POST":
		{

		}
	default:
		{

		}

	}
}
