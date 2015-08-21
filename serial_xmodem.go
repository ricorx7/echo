package main

// Another CRC16 option is https://github.com/stellar/go-stellar-base/blob/master/crc16/main.go

import (
	"log"

	"github.com/npat-efault/gohacks/crc16"
)

func xModemDownload(dir string, filename string, isHighSpeed bool) {

	// Calculate crc
	bs := make([]byte, 4)
	var u = crc16.Checksum(crc16.XModem, bs)
	log.Print(u)

	var tbl = crc16.MakeTable(crc16.XModem.Poly)
	var ul = crc16.Update(crc16.XModem.IniVal, tbl, bs)
	log.Print(ul)
}
