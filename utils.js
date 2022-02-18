  var devices = {}
  var bleScan = {}
  
  var statusElm = $('#_status')[0]
  statusElm.innerText = "page loaded"

  function onStart() {
    console.log("Starting...")
    statusElm.innerText = "on Started() ..."
    let posElm = $('#_pos')[0]

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(logPosition)
    } else {
      console.log("Geo Location not enabled.")
      posElm.innerText = "Geo Location is not enabled"
    }

    statusElm.innerText = "checking BLE availability..."
    navigator.bluetooth.getAvailability().then(startBleScan)
  }

  function onStop() {
    if (bleScan){
      bleScan.stop()
    }
  }

  function logPosition(position) {
    console.log("Lat: " + position.coords.latitude)
    console.log("Lon: " + position.coords.longitude)
    console.log("Pos Obj: " + position)
    let posElm = $('#_pos')[0]
    posElm.innerText = `Lat: ${position.coords.latitude} , Lon: ${position.coords.longitude}`
  }

  function async startBleScan(isAvailable) {
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

  function onAdvertisment(event) {
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
  
  
