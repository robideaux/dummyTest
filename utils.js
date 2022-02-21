  var devices = {}
  var bleScan = {}
  var bleAvailable = false
  var posWatcher = null
  
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
      //navigator.bluetooth.addEventListener('advertisementreceived', onAdvertisement)
      navigator.bluetooth.onadvertisementreceived = onAdvertisement
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
    posWatcher = null
    if (navigator.geolocation) {
      //navigator.geolocation.getCurrentPosition(logPosition)
      posWatcher = navigator.geolocation.watchPosition(logPosition)
    } else {
      console.log("Geo Location not enabled.")
      posElm.innerText = "Geo Location is not enabled"
    }
  }

  function startScanning(){
    bleScan = null
    if (bleAvailable) {
      try{
        navigator.bluetooth.requestLEScan({acceptAllAdvertisements:true}).then(scan => {bleScan = scan}).catch(err => {
          console.log("Inner Error: " + err)
          statusElm.innerText = "Inner Error:" + err
        })
      } catch (error) {
          console.log("Outer Error: " + err)
          statusElm.innerText = "Outer Error:" + err
      }
      // bleScan = await navigator.bluetooth.requestLEScan({acceptAllAdvertisements:true})
    }
  }

  function onStop() {
    if (bleScan){
      bleScan.stop()
      bleScan = null
    }
    if (posWatcher) {
      navigator.geolocation.clearWatch(posWatcher)
      posWatcher = null
    }
    startBtn.disabled = false
    stopBtn.disabled = true
    listBtn.disabled = true
  }

  function logPosition(position) {
    console.log("Lat: " + position.coords.latitude)
    console.log("Lon: " + position.coords.longitude)
    console.log("Pos Obj: " + position)
    var posString = `Lat: ${position.coords.latitude} , Lon: ${position.coords.longitude} +/-${position.coords.accuracy}m (${position.coords.speed}m/s)`
    posElm.innerText = posString
  }

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
        blElm.innerText += id + "[" + device.rssi + "]<p>"
    }
  }
  
  
