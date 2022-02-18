  var devices = {}
  var bleScan = {}
  var bleAvailable = false
  
  var statusElm = $('#_status')[0]
  var blElm = $("#_devices")[0]
  var posElm = $('#_pos')[0]
  statusElm.innerText = "page loaded"

  statusElm.innerText = "checking BLE availability..."
  navigator.bluetooth.getAvailability().then(available => {
    bleAvailable = available
    if (bleAvailable == true){
      blElm.innerText = "Bluetooth IS available."
      console.log("Bluetooth IS available.")
      navigator.bluetooth.addEventListener('advertisementreceived', onAdvertisement)
    } else {
      blElm.innerText = "Bluetooth is NOT available."
      console.log("Bluetooth is NOT available.")
    }
  })

  async function onStart() {
    console.log("Starting...")
    statusElm.innerText = "on Started() ..."
    await startScanning()    
    startPositioning()
  }

  function startPositioning() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(logPosition)
    } else {
      console.log("Geo Location not enabled.")
      posElm.innerText = "Geo Location is not enabled"
    }
  }

  async function startScanning(){
    bleScan = null
    if (bleAvailable) {
      bleScan = await navigator.bluetooth.requestLEScan({acceptAllAdvertisements:true})
    } else {
      bleScan = null
    }
  }

  function onStop() {
    if (bleScan){
      bleScan.stop()
      bleScan = null
    }
  }

  function logPosition(position) {
    console.log("Lat: " + position.coords.latitude)
    console.log("Lon: " + position.coords.longitude)
    console.log("Pos Obj: " + position)
    posElm.innerText = `Lat: ${position.coords.latitude} , Lon: ${position.coords.longitude}`
  }

  /*
  async function startBleScan(isAvailable) {
    let blElm = $("#_devices")[0]
    console.trace("blElm: " + blElm)
    console.log("available: " + isAvailable)

    if (isAvailable == true){
      blElm.innerText = "Bluetooth IS available."
      console.log("Bluetooth IS available.")
      navigator.bluetooth.addEventListener('advertisementreceived', onAdvertisement)
      bleScan = await navigator.bluetooth.requestLEScan({acceptAllAdvertisements:true})
    } else {
      blElm.innerText = "Bluetooth is not available."
      console.log("Bluetooth is not available.")
    }
  }
  */

  function onAdvertisement(event) {
  	devices[event.device.id] = {
      name: event.device.name,
      rssi: event.rssi,
      tx: event.txPower,
      evt: event
    }
  }

  function listDevices() {
    for (const [id, device] of Object.entries(devices)) {
        console.log("Device: " + id)
        console.log(device)
    }
  }
  
  
