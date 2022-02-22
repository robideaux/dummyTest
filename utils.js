  var devices = {}
  var bleScan = {}
  var bleAvailable = false
  var posWatcher = null
  var positionLog = {}
  var timerStop = null
  var timerUpdate = null

  var statusElm = $('#_status')[0]
  var progressElm = $('#_progress')[0]
  var progressWidth = 200
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
      //navigator.bluetooth.onadvertisementreceived = onAdvertisement
    } else {
      blElm.innerText = "Bluetooth is NOT available."
      console.log("Bluetooth is NOT available.")
    }
  })

  startBtn.addEventListener('click', onStart)
  stopBtn.addEventListener('click', onStop)
  listBtn.addEventListener('click', onList)

  var map = L.map('_map').setView([30.0, -91.0], 13);
  // replace "toner" here with "terrain" or "watercolor"
  var layer = new L.StamenTileLayer("watercolor");
  map.addLayer(layer);  

  function onStart() {
    console.log("Starting...")
    statusElm.innerText = "Starting 20sec scan..."
    progressWidth = 200
    $(progressElm).width(progressWidth)
    blElm.innerText = ""
    startPositioning()
    startScanning()    
   
    startBtn.disabled = true
    stopBtn.disabled = false
    timerUpdate = setInterval(onRefresh, 500)
    timerStop = setInterval(onStop, 20 * 1000)
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
      console.log("calling requestLEScan()")
      try{
        navigator.bluetooth.requestLEScan({acceptAllAdvertisements:true})
          .then(scan => {
            console.log("Scan started.")
            bleScan = scan
           console.log("Scan object = " + bleScan)
          }, er => {
            console.log("rejected. " + er)
          })
          .catch(err => {
            console.log("Inner Error: " + err)
            statusElm.innerText = "Inner Error:" + err
          })
      }
      catch (error) {
          console.log("Outer Error: " + error)
          statusElm.innerText = "Outer Error:" + error
      }
      finally {
        console.log("scan initiated.")
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
    //listBtn.disabled = true

    clearInterval(timerUpdate)
    clearInterval(timerStop)

    progressWidth = 0
    $(progressElm).width(progressWidth)
    
    posElm.innerHTML += "<br>Recorded " + Object.entries(positionLog).length + " positions."
  }

  function logPosition(position) {
    var timestamp = Date.now() 
    positionLog[timestamp] = position.coords
    console.log("Lat: " + position.coords.latitude)
    console.log("Lon: " + position.coords.longitude)
    console.log("Pos Obj: " + position)
    var posString = `Lat: ${position.coords.latitude} , Lon: ${position.coords.longitude} +/-${position.coords.accuracy}m`
    if (position.coords.speed && position.coords.heading) {
      posString = `${posString} (${position.coords.speed}m/s @ ${position.coords.heading}°)`
    }
    posElm.innerText = posString
  }

  function onList() {
    listDevices()
  }

  function onAdvertisement(event) {
    try {
      devices[event.device.id] = {
        name: event.device.name,
        rssi: event.rssi,
        tx: event.txPower,
        evt: event
      }
    }
    catch (error) {
      console.log("Error recordning scan event.")
      console.log(error)
    }
    listBtn.disabled = false
  }

  function onRefresh() {
    progressWidth -= 5
    $(progressElm).width(progressWidth)
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
