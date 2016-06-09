package main

import (
	"bufio"
	"log"
	"os"
	"time"
)

// serialPortIO is the  Serial Port struct.
// The portIO and serialPort
// are the same object but use
// different interfaces.
type recorderSerialPort struct {
	writer    *bufio.Writer // Serial port connection to manage the
	write     chan []byte   // Write the data to the file.
	isClosing bool          // Set flag to close the file on next loop if still running
	file      *os.File      // File path and info
	fileSize  int           // Current file size
}

// run the Recorder process
// This will monitor recorders
// and create recorders for serial ports for connections
// and disconnects.
func (recorder *recorderSerialPort) run() {
	log.Print("Serial Recorder running")
	for {
		select {

		// Data received to record
		case m := <-recorder.write:
			//log.Print("Got a recorder write")
			if recorder.isClosing {
				return
			}

			// Check if a new file should be created
			// 18mb max size
			if recorder.fileSize+len(m) >= 1048576*18 {
				loadNewFile(recorder)
			}

			// Record the data
			//log.Print("Record serial data")
			n, err := recorder.writer.Write(m)
			if err != nil {
				log.Printf("Error writing serial data to file: %s", err.Error())
			}
			recorder.fileSize += n
			//log.Printf("Recorded %d bytes to the file", n)
		}
	}
}

// startRecording will find the serialPortIO
// start the recording process.
func startRecording(portName string) {
	//see if we have this port open
	spio, isFound := findPortByName(portName)

	if isFound {
		log.Print("Start Recording")
		startSerialPortRecording(spio)
	}
}

// stopRecording will find the serialPortIO
// stop recording.
func stopRecording(portName string) {
	//see if we have this port open
	spio, isFound := findPortByName(portName)

	if isFound {
		log.Print("Stop Recording")
		stopSerialPortRecording(spio)
	}
}

// startSerialPortRecording will start recording.
// It will create the file and buferio.  It will set
// the recorder to the serialPortIO.  It will then set
// the flag to start recording.
func startSerialPortRecording(spio *serialPortIO) {
	// // Create a new file name
	// t := time.Now()
	// filePath := *record + "Raw_" + t.Format("20060102150405") + ".ens"
	//
	// log.Printf("Creating file: %s", filePath)
	//
	// // Create the file
	// file, err := os.Create(filePath)
	file, err := createFile()
	if err != nil {
		log.Print("Error creating file. " + err.Error())
		return
	}

	// Create bufio
	bufWriter := bufio.NewWriter(file)

	log.Print("bufio writer created")

	// Create recorder
	spio.recorder = &recorderSerialPort{
		file:      file,              // File to write to
		writer:    bufWriter,         // bufio to write data to file
		write:     make(chan []byte), // Write data to recorder
		isClosing: false,             // Set flag
		fileSize:  0,                 // Initialize the file size
	}
	log.Print("recorder set to SPIO")

	spio.isRecording = true

	log.Print("Serial Port recorder started")
	go spio.recorder.run()
}

// stopSerialPortRecording will stop the serial port
// from recording.  It will close the file and set the
// flag to stop recording.
func stopSerialPortRecording(spio *serialPortIO) {
	log.Print("Stop recording serial port")
	spio.isRecording = false
	log.Print("Stop recording serial port closing")
	spio.recorder.isClosing = true

	// Flush and close the file
	log.Print("Stop recording serial port close file")
	spio.recorder.writer.Flush()
	spio.recorder.file.Close()

	// Close the channel
	log.Print("Stop recording serial port stop channel")
	close(spio.recorder.write)

	log.Print("End Stop recording")
}

// loadNewFile will create a new file.  This is used
// when the file max size has been exceeded and a new
// file needs to be created.
func loadNewFile(recorder *recorderSerialPort) {
	// // Create a new file name
	// t := time.Now()
	// filePath := *record + "Raw_" + t.Format("20060102150405") + ".ens"
	//
	// log.Printf("Creating file: %s", filePath)
	//
	// // Create the file
	// file, err := os.Create(filePath)
	file, err := createFile()
	if err != nil {
		log.Print("Error creating file. " + err.Error())
		return
	}

	// Initialize the file size
	recorder.fileSize = 0

	// Create bufio
	recorder.writer = bufio.NewWriter(file)
}

// Create the file.  This will create the folder for the current date.
// It will then create the file in the folder.
func createFile() (*os.File, error) {

	// Create a new file name
	t := time.Now()
	folderPath := *record + t.Format("20060102") + string(os.PathSeparator)
	filePath := folderPath + "Raw_" + t.Format("20060102150405") + ".ens"

	log.Printf("Creating folder: %s\n", folderPath)
	log.Printf("Creating file: %s\n", filePath)

	// Check if the folder has been created already
	var _, errFolder = os.Stat(folderPath)
	if os.IsNotExist(errFolder) {
		os.Mkdir(folderPath, 0711)
	}

	// detect if file exists
	var _, err = os.Stat(filePath)

	// create file if not exists
	if os.IsNotExist(err) {
		var file, err1 = os.Create(filePath)
		checkError(err)
		//defer file.Close()

		return file, err1
	}

	return nil, err
}
