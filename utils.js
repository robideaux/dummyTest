  var devices = {}
  var bleScan = {}
  var bleAvailable = false
  var posWatcher = null
  var positionLog = {}
  var timerStop = null
  var timerUpdate = null
  var circle = null

  var statusElm = $('#_status')[0]
  var progressElm = $('#_progress')[0]
  var progressWidth = 200
  var blElm = $("#_devices")[0]
  var posElm = $('#_pos')[0]
  var responseElm = $('#_response')[0]
  var startBtn = $("#_start")[0]
  var stopBtn = $("#_stop")[0]
  var listBtn = $("#_listDevices")[0]
  startBtn.disabled = false
  stopBtn.disabled = true
  listBtn.disabled = false
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

  var map = L.map('_map').setView([30.0, -91.0], 13)
  // replace "toner" here with "terrain" or "watercolor"
  var layer = new L.StamenTileLayer("terrain")
  map.addLayer(layer)

  function onStart() {
    console.log("Starting...")
    statusElm.innerText = "Starting 20sec scan..."
    responseElm.innerText = ""
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
    devices = {}
    if (bleAvailable) {
      try{
        navigator.bluetooth.requestLEScan({acceptAllAdvertisements:true})
          .then(scan => {
            console.log("Scan started.")
            bleScan = scan
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
    console.log("Stopped scanning")
    statusElm.innerText = "Done"
    
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

    clearInterval(timerUpdate)
    clearInterval(timerStop)

    progressWidth = 0
    $(progressElm).width(progressWidth)
    
    posElm.innerHTML += "<br>Recorded " + Object.entries(positionLog).length + " positions."
    displayResponse()
  }

  function logPosition(position) {
    var timestamp = Date.now() 
    positionLog[timestamp] = position.coords
    var posString = `Lat: ${position.coords.latitude} , Lon: ${position.coords.longitude} +/-${position.coords.accuracy}m`
    if (position.coords.speed && position.coords.heading) {
      posString = `${posString} (${position.coords.speed}m/s @ ${position.coords.heading}°)`
    }
    posElm.innerText = posString
    
    var location = L.latLng(position.coords.latitude, position.coords.longitude)
    map.setView(location)
    if (!circle) {
      circle = L.circle(location, {
        color: 'blue',
        fillColor: '#f03',
        fillOpacity: 0.4,
        radius: position.coords.accuracy
      }).addTo(map)
    } else {
      circle.setLatLng(location)
      circle.setRadius(position.coords.accuracy)
    }
  }

  function displayResponse() {
    var package = {
      positions: {},
      devices: {}
    }
    for (const [time, pos] of Object.entries(positionLog)) {
      package.positions[time] = {
        lat: pos.latitude,
        lon: pos.longitude,
        accuracy: pos.accuracy,
        speed: pos.speed,
        heading: pos.heading
      }
    }
    for (const [id, device] of Object.entries(devices)) {
      if (device.name && device.name.length > 0 ) {
        package.devices[id] = device
      }
    }

    responseElm.innerHTML = "<pre>" + JSON.stringify(package, null, 2) + "</pre>"
    console.log(package)
  }

  function onAdvertisement(event) {
    try {
      var id = event.device.id
      if (!devices.hasOwnProperty(id)) {
        devices[id] = {
          name: event.device.name,
          recordings: []
        }
      }
      recordings = devices[id].recordings
      
      var record = {
        timestamp: Date.now(),
        rssi: event.rssi,
      }
      recordings.push(record)
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
    onList()
  }

  function onList() {
    blElm.innerHTML = ""
    for (const [id, device] of Object.entries(devices)) {
      // console.log("Device: " + id)
      // console.log(device)
      var rssi = null
      var length = device.recordings.length
      if (length > 0)
      {
        rssi = device.recordings[length - 1]
      }
      blElm.innerHTML = blElm.innerHTML + "<br>" + id + " [" + rssi + "] (name: " + device.name + ")"
    }
  }
