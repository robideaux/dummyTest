  var devices = {}
  var bleScan = {}
  var bleAvailable = false
  var posWatcher = null
  var positionLog = {}
  var timerStop = null
  var timerUpdate = null

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
    statusElm.innerText = "Starting 10sec scan..."
    blElm.innerText = ""
    startPositioning()
    startScanning()    
   
    startBtn.disabled = true
    stopBtn.disabled = false
    timerUpdate = setInterval(onRefresh, 0.5 * 1000)
    timerStop = setInterval(onStop, 10 * 1000)
  }

  function startPositioning() {
    positionLog = {}
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
          console.log("Outer Error: " + error)
          statusElm.innerText = "Outer Error:" + error
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

    clearInterval(timerUpdate)
    clearInterval(timerStop)
    
    posElm.innerHTML += "<br>Recorded " + Object.entries(positionLog).length + " positions."
  }

  function logPosition(position) {
    var timestmap = Date.now() 
    positionLog[timestamp] = position.coords
    console.log("Lat: " + position.coords.latitude)
    console.log("Lon: " + position.coords.longitude)
    console.log("Pos Obj: " + position)
    var posString = `Lat: ${position.coords.latitude} , Lon: ${position.coords.longitude} +/-${position.coords.accuracy}m (${position.coords.speed}m/s @ ${position.coords.heading}°)`
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

  function onRefresh() {
    listDevices()
  }

  function listDevices() {
    blElm.innerHTML = ""
    for (const [id, device] of Object.entries(devices)) {
        // console.log("Device: " + id)
        // console.log(device)
        blElm.innerHTML = blElm.innerHTML + "<br>" + id + " [" + device.rssi + "] (" + device.name + ")"
    }
  }
