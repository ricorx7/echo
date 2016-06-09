package main

import (
	//"fmt"
	//"github.com/lxn/win"
	"github.com/go-ole/go-ole"
	"github.com/go-ole/go-ole/oleutil"
	"github.com/ricorx7/go-serial"
	//"github.com/tarm/goserial"
	//"github.com/johnlauer/goserial"
	"log"
	"os"
	"strings"

	//"encoding/binary"
	"strconv"
	"sync"
	//"syscall"
	"regexp"
)

var (
	serialListWindowsWg sync.WaitGroup
)

func getMetaList() ([]OsSerialPort, os.SyscallError) {
	// use a queue to do this to avoid conflicts
	// we've been getting crashes when this getList is requested
	// too many times too fast. i think it's something to do with
	// the unsafe syscalls overwriting memory

	// this will only block if waitgroupctr > 0. so first time
	// in shouldn't block
	serialListWindowsWg.Wait()

	serialListWindowsWg.Add(1)
	arr, sysCallErr := getListViaWmiPnpEntity()
	serialListWindowsWg.Done()
	//arr = make([]OsSerialPort, 0)

	// see if array has any data, if not fallback to the traditional
	// com port list model
	/*
		if len(arr) == 0 {
			// assume it failed
			arr, sysCallErr = getListViaOpen()
		}
	*/

	// see if array has any data, if not fallback to looking at
	// the registry list
	/*
		arr = make([]OsSerialPort, 0)
		if len(arr) == 0 {
			// assume it failed
			arr, sysCallErr = getListViaRegistry()
		}
	*/

	return arr, sysCallErr
}

func getListSynchronously() {

}

func getListViaWmiPnpEntity() ([]OsSerialPort, os.SyscallError) {

	//log.Println("Doing getListViaWmiPnpEntity()")

	// this method panics a lot and i'm not sure why, just catch
	// the panic and return empty list
	defer func() {
		if e := recover(); e != nil {
			// e is the interface{} typed-value we passed to panic()
			log.Println("Got panic: ", e) // Prints "Whoops: boom!"
		}
	}()

	var err os.SyscallError

	//var friendlyName string

	// init COM, oh yeah
	ole.CoInitialize(0)
	defer ole.CoUninitialize()

	unknown, _ := oleutil.CreateObject("WbemScripting.SWbemLocator")
	defer unknown.Release()

	wmi, _ := unknown.QueryInterface(ole.IID_IDispatch)
	defer wmi.Release()

	// service is a SWbemServices
	serviceRaw, _ := oleutil.CallMethod(wmi, "ConnectServer")
	service := serviceRaw.ToIDispatch()
	defer service.Release()

	// result is a SWBemObjectSet
	//pname := syscall.StringToUTF16("SELECT * FROM Win32_PnPEntity where Name like '%" + "COM35" + "%'")
	pname := "SELECT * FROM Win32_PnPEntity WHERE ConfigManagerErrorCode = 0 and Name like '%(COM%'"
	//pname := "SELECT * FROM Win32_PnPEntity WHERE ConfigManagerErrorCode = 0"
	resultRaw, err2 := oleutil.CallMethod(service, "ExecQuery", pname)
	//log.Println("Got result from oleutil.CallMethod")
	if err2 != nil {
		// we got back an error or empty list
		log.Printf("Got an error back from oleutil.CallMethod. err:%v", err2)
		return nil, err
	}

	result := resultRaw.ToIDispatch()
	defer result.Release()

	countVar, _ := oleutil.GetProperty(result, "Count")
	count := int(countVar.Val)

	list := make([]OsSerialPort, count)

	for i := 0; i < count; i++ {

		// items we're looping thru look like below and
		// thus we can query for any of these names
		/*
					__GENUS                     : 2
			__CLASS                     : Win32_PnPEntity
			__SUPERCLASS                : CIM_LogicalDevice
			__DYNASTY                   : CIM_ManagedSystemElement
			__RELPATH                   : Win32_PnPEntity.DeviceID="USB\\VID_1D50&PID_606D&MI_02\\6&2F09EA14&0&0002"
			__PROPERTY_COUNT            : 24
			__DERIVATION                : {CIM_LogicalDevice, CIM_LogicalElement, CIM_ManagedSystemElement}
			__SERVER                    : JOHN-ATIV
			__NAMESPACE                 : root\cimv2
			__PATH                      : \\JOHN-ATIV\root\cimv2:Win32_PnPEntity.DeviceID="USB\\VID_1D50&PID_606D&MI_02\\6&2F09EA14
			                              &0&0002"
			Availability                :
			Caption                     : TinyG v2 (Data Channel) (COM12)
			ClassGuid                   : {4d36e978-e325-11ce-bfc1-08002be10318}
			CompatibleID                : {USB\Class_02&SubClass_02&Prot_01, USB\Class_02&SubClass_02, USB\Class_02}
			ConfigManagerErrorCode      : 0
			ConfigManagerUserConfig     : False
			CreationClassName           : Win32_PnPEntity
			Description                 : TinyG v2 (Data Channel)
			DeviceID                    : USB\VID_1D50&PID_606D&MI_02\6&2F09EA14&0&0002
			ErrorCleared                :
			ErrorDescription            :
			HardwareID                  : {USB\VID_1D50&PID_606D&REV_0097&MI_02, USB\VID_1D50&PID_606D&MI_02}
			InstallDate                 :
			LastErrorCode               :
			Manufacturer                : Synthetos (www.synthetos.com)
			Name                        : TinyG v2 (Data Channel) (COM12)
			PNPDeviceID                 : USB\VID_1D50&PID_606D&MI_02\6&2F09EA14&0&0002
			PowerManagementCapabilities :
			PowerManagementSupported    :
			Service                     : usbser
			Status                      : OK
			StatusInfo                  :
			SystemCreationClassName     : Win32_ComputerSystem
			SystemName                  : JOHN-ATIV
			PSComputerName              : JOHN-ATIV
		*/

		// item is a SWbemObject, but really a Win32_Process
		itemRaw, _ := oleutil.CallMethod(result, "ItemIndex", i)
		item := itemRaw.ToIDispatch()
		defer item.Release()

		asString, _ := oleutil.GetProperty(item, "Name")

		//log.Println(asString.ToString())

		// get the com port
		//if false {
		s := strings.Split(asString.ToString(), "(COM")[1]
		s = "COM" + s
		s = strings.Split(s, ")")[0]
		list[i].Name = s
		list[i].FriendlyName = asString.ToString()
		//}

		// get the deviceid so we can figure out related ports
		// it will look similar to
		// USB\VID_1D50&PID_606D&MI_00\6&2F09EA14&0&0000
		deviceIDStr, _ := oleutil.GetProperty(item, "DeviceID")
		devIDItems := strings.Split(deviceIDStr.ToString(), "&")
		log.Printf("DeviceId elements:%v", devIDItems)
		if len(devIDItems) > 3 {
			list[i].SerialNumber = devIDItems[3]
			//list[i].IdProduct = strings.Replace(devIdItems[1], "PID_", "", 1)
			//list[i].IdVendor = strings.Replace(devIdItems[0], "USB\\VID_", "", 1)
		} else {
			list[i].SerialNumber = deviceIDStr.ToString()
		}

		pidMatch := regexp.MustCompile("PID_(....)").FindAllStringSubmatch(deviceIDStr.ToString(), -1)
		if len(pidMatch) > 0 {
			if len(pidMatch[0]) > 1 {
				list[i].IDProduct = pidMatch[0][1]
			}
		}
		vidMatch := regexp.MustCompile("VID_(....)").FindAllStringSubmatch(deviceIDStr.ToString(), -1)
		if len(vidMatch) > 0 {
			if len(vidMatch[0]) > 1 {
				list[i].IDVendor = vidMatch[0][1]
			}
		}

		manufStr, _ := oleutil.GetProperty(item, "Manufacturer")
		list[i].Manufacturer = manufStr.ToString()
		descStr, _ := oleutil.GetProperty(item, "Description")
		list[i].Product = descStr.ToString()
		//classStr, _ := oleutil.GetProperty(item, "CreationClassName")
		//list[i].DeviceClass = classStr.ToString()

	}

	for index, element := range list {

		log.Printf("index:%v, name:%v, friendly:%v ", index, element.Name, element.FriendlyName)
		log.Printf("pid:%v, vid:%v", element.IDProduct, element.IDVendor)

		for index2, element2 := range list {
			if index == index2 {
				continue
			}
			if element.SerialNumber == element2.SerialNumber {
				log.Printf("Found related element1:%v, element2:%v", element, element2)
				list[index].RelatedNames = append(list[index].RelatedNames, element2.Name)
			}
		}

	}

	return list, err
}

func getListViaOpen() ([]OsSerialPort, os.SyscallError) {

	log.Println("Doing getListViaOpen(). Will try to open COM1 to COM99.")
	var err os.SyscallError
	list := make([]OsSerialPort, 100)
	var igood int
	for i := 0; i < 100; i++ {
		prtname := "COM" + strconv.Itoa(i)
		//conf := &serial.Config{Name: prtname, Baud: 1200}
		mode := &serial.Mode{
			BaudRate: 1200,
			Vmin:     0,
			Vtimeout: 10,
		}
		sp, err := serial.OpenPort(prtname, mode)
		//log.Println("Just tried to open port", prtname)
		if err == nil {
			//log.Println("Able to open port", prtname)
			list[igood].Name = prtname
			sp.Close()
			list[igood].FriendlyName = prtname
			//list[igood].FriendlyName = getFriendlyName(prtname)
			igood++
		}
	}
	for index, element := range list[:igood] {
		log.Println("index ", index, " element ", element.Name+
			" friendly ", element.FriendlyName)
	}
	return list[:igood], err
}

/*
func getListViaRegistry() ([]OsSerialPort, os.SyscallError) {

	log.Println("Doing getListViaRegistry()")
	var err os.SyscallError
	var root win.HKEY
	rootpath, _ := syscall.UTF16PtrFromString("HARDWARE\\DEVICEMAP\\SERIALCOMM")
	log.Println(win.RegOpenKeyEx(win.HKEY_LOCAL_MACHINE, rootpath, 0, win.KEY_READ, &root))

	var name_length uint32 = 72
	var key_type uint32
	var lpDataLength uint32 = 72
	var zero_uint uint32 = 0
	name := make([]uint16, 72)
	lpData := make([]byte, 72)

	var retcode int32
	retcode = 0
	for retcode == 0 {
		retcode = win.RegEnumValue(root, zero_uint, &name[0], &name_length, nil, &key_type, &lpData[0], &lpDataLength)
		log.Println("Retcode:", retcode)
		log.Println("syscall name: "+syscall.UTF16ToString(name[:name_length-2])+"---- name_length:", name_length)
		log.Println("syscall lpdata:"+string(lpData[:lpDataLength-2])+"--- lpDataLength:", lpDataLength)
		//log.Println()
		zero_uint++
	}
	win.RegCloseKey(root)
	win.RegOpenKeyEx(win.HKEY_LOCAL_MACHINE, rootpath, 0, win.KEY_READ, &root)

	list := make([]OsSerialPort, zero_uint)
	var i uint32 = 0
	for i = 0; i < zero_uint; i++ {
		win.RegEnumValue(root, i-1, &name[0], &name_length, nil, &key_type, &lpData[0], &lpDataLength)
		//name := string(lpData[:lpDataLength])
		//name = name[:strings.Index(name, '\0')]
		//nameb := []byte(strings.TrimSpace(string(lpData[:lpDataLength])))
		//list[i].Name = string(nameb)
		//list[i].Name = string(name[:strings.Index(name, "\0")])
		//list[i].Name = fmt.Sprintf("%s", string(lpData[:lpDataLength-1]))
		pname := make([]uint16, (lpDataLength-2)/2)
		pname = convertByteArrayToUint16Array(lpData[:lpDataLength-2], lpDataLength-2)
		list[i].Name = syscall.UTF16ToString(pname)
		log.Println("The length of the name is:", len(list[i].Name))
		log.Println("list[i].Name=" + list[i].Name + "---")
		//list[i].FriendlyName = getFriendlyName(list[i].Name)
		list[i].FriendlyName = getFriendlyName("COM34")
	}
	win.RegCloseKey(root)
	return list, err
}
*/

func convertByteArrayToUint16Array(b []byte, mylen uint32) []uint16 {

	log.Println("converting. len:", mylen)
	var i uint32
	ret := make([]uint16, mylen/2)
	for i = 0; i < mylen; i += 2 {
		//ret[i/2] = binary.LittleEndian.Uint16(b[i : i+1])
		ret[i/2] = uint16(b[i]) | uint16(b[i+1])<<8
	}
	return ret
}

func getFriendlyName(portname string) string {

	// this method panics a lot and i'm not sure why, just catch
	// the panic and return empty list
	defer func() {
		if e := recover(); e != nil {
			// e is the interface{} typed-value we passed to panic()
			log.Println("Got panic: ", e) // Prints "Whoops: boom!"
		}
	}()

	var friendlyName string

	// init COM, oh yeah
	ole.CoInitialize(0)
	defer ole.CoUninitialize()

	unknown, _ := oleutil.CreateObject("WbemScripting.SWbemLocator")
	defer unknown.Release()

	wmi, _ := unknown.QueryInterface(ole.IID_IDispatch)
	defer wmi.Release()

	// service is a SWbemServices
	serviceRaw, _ := oleutil.CallMethod(wmi, "ConnectServer")
	service := serviceRaw.ToIDispatch()
	defer service.Release()

	// result is a SWBemObjectSet
	//pname := syscall.StringToUTF16("SELECT * FROM Win32_PnPEntity where Name like '%" + "COM35" + "%'")
	pname := "SELECT * FROM Win32_PnPEntity where Name like '%" + portname + "%'"
	resultRaw, _ := oleutil.CallMethod(service, "ExecQuery", pname)
	result := resultRaw.ToIDispatch()
	defer result.Release()

	countVar, _ := oleutil.GetProperty(result, "Count")
	count := int(countVar.Val)

	for i := 0; i < count; i++ {
		// item is a SWbemObject, but really a Win32_Process
		itemRaw, _ := oleutil.CallMethod(result, "ItemIndex", i)
		item := itemRaw.ToIDispatch()
		defer item.Release()

		asString, _ := oleutil.GetProperty(item, "Name")

		println(asString.ToString())
		friendlyName = asString.ToString()
	}

	return friendlyName
}
