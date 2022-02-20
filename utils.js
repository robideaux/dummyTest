  var devices = {}
  var bleScan = {}
  var bleAvailable = false
  
  var statusElm = $('#_status')[0]
  var blElm = $("#_devices")[0]
  var posElm = $('#_pos')[0]
  var startBtn = $("#_start")[0]
  var stopBtn = $("#_stop")[0]
  var listBtn = $("#_listDevices")[0]
  startBtn.disabled = false
  stopBtn.disabled = true
  listBtn.disabled = true
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

  startBtn.addEventListener('click', onStart)
  stopBtn.addEventListener('click', onStop)
  listBtn.addEventListener('click', onList)
  
  function onStart() {
    console.log("Starting...")
    statusElm.innerText = "on Started() ..."
    blElm.innerText = ""
    startScanning()    
    startPositioning()
    
    startBtn.disabled = true
    stopBtn.disabled = false
  }

  function startPositioning() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(logPosition)
    } else {
      console.log("Geo Location not enabled.")
      posElm.innerText = "Geo Location is not enabled"
    }
  }

  function startScanning(){
    bleScan = null
    if (bleAvailable) {
      navigator.bluetooth.requestLEScan({acceptAllAdvertisements:true}).then(scan => {bleScan = scan})
      // bleScan = await navigator.bluetooth.requestLEScan({acceptAllAdvertisements:true})
    }
  }

  function onStop() {
    if (bleScan){
      bleScan.stop()
      bleScan = null
    }
    startBtn.disabled = false
    stopBtn.disabled = true
    listBtn.disabled = true
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

  function onList() {
    listDevices()
  }

  function onAdvertisement(event) {
  	devices[event.device.id] = {
      name: event.device.name,
      rssi: event.rssi,
      tx: event.txPower,
      evt: event
    }
    listBtn.disabled = false
  }

  function listDevices() {
    blElm.innerText = ""
    for (const [id, device] of Object.entries(devices)) {
        console.log("Device: " + id)
        console.log(device)
        blElm.innerText = blElm + id + "<p>"
    }
  }
  
  
