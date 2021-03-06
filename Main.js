window.onload = init();

let isCenter = false;
let activateDeactivateLocation = false;
let activateDeactivateTrack = false;
let geolocation = null;
let positionFeature = null;
let layer = null;
let arrayRute = new Array();
let feature = null;
let arrayFeatures = new Array();
let idFeature = 0;
//let listLocation = new Array();

let layerTrack = new ol.layer.Vector({
  map: map,
  source: new ol.source.Vector({
    features: [],
    type: "FeatureCollection",
  }),
});

function init() {
  //constructors
  let view = new ol.View({
    center: [-665167.6272659146, 4493012.258874561],
    zoom: 8,
    maxZoom: 20,
    minZoom: 8,
  });

  map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
      }),
    ],
    target: "map",
    view: view,
  });

  el("locate").addEventListener("click", function () {
    actDeacLocation();
  });

  el("track").addEventListener("click", function () {
    actDeacTrack();
  });

  el("center").addEventListener("click", function () {
    centerView(map.getView());
  });
}

function actDeacLocation() {
  if (!activateDeactivateLocation) {
    activateDeactivateLocation = true;

    isCenter = true;

    el("locate").style.backgroundColor = "#71a7d3";

    locateMe(map);
  } else {
    activateDeactivateLocation = false;
    isCenter = false;

    if (activateDeactivateTrack) {
      actDeacTrack();
    }

    el("locate").style.backgroundColor = "#7A7A73";

    deactivate(map);
  }
}

function actDeacTrack() {
  if (!activateDeactivateTrack) {
    activateDeactivateTrack = true;
    el("track").style.backgroundColor = "#71a7d3";

    trackMe();

    if (!activateDeactivateLocation) {
      actDeacLocation();
    }
  } else {
    activateDeactivateTrack = false;
    el("track").style.backgroundColor = "#7A7A73";
  }
}

function trackMe() {
  arrayRute = new Array();

  feature = new ol.Feature({
    type: "Feature",
    properties: {},
  });

  feature.setId(idFeature);
  idFeature++;

  arrayFeatures.push(feature);

  layerTrack.getSource().addFeatures(arrayFeatures);
}

function locateMe(map) {
  let lastPosition = null;
  //listLocation.push('locating');
  let located = false;
  let view = map.getView();

  if (geolocation == null) {
    geolocation = new ol.Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: view.getProjection(),
    });
  }

  geolocation.setTracking(true);



  //eventos "on"
  // update the HTML page when the position changes.
  /*geolocation.on("change", function () {
    el("accuracy").innerText = geolocation.getAccuracy() + " [m]";
    el("altitude").innerText = geolocation.getAltitude() + " [m]";
    el("altitudeAccuracy").innerText =
      geolocation.getAltitudeAccuracy() + " [m]";
    el("heading").innerText = geolocation.getHeading() + " [rad]";
    el("speed").innerText = geolocation.getSpeed() + " [m/s]";
  });*/

  // handle geolocation error.
  /* geolocation.on("error", function (error) {
    var info = document.getElementById("info");
    info.innerHTML = error.message;
    info.style.display = "";
  });*/

  positionFeature = new ol.Feature();
  positionFeature.setStyle(
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
          color: "#3399CC",
        }),
        stroke: new ol.style.Stroke({
          color: "#fff",
          width: 2,
        }),
      }),
    })
  );



  geolocation.on("change:position", function () {
    let coordinates = geolocation.getPosition();
    positionFeature.setGeometry(
      coordinates ? new ol.geom.Point(coordinates) : null
    );


    /*if (listLocation.indexOf('locating') == 0) {
      flyTo(coordinates, 18);//solo una vez
    }*/
    if (!located) {
      flyTo(coordinates, 18);//solo una vez
    }

    if (isCenter && located) {
      let zoom = view.getZoom();

      if (zoom < 18) {
        zoom = 18;
      }

      view.setCenter(geolocation.getPosition());
      view.setZoom(zoom);
    }

    /*listLocation.splice(listLocation.indexOf('locating'), 1);
    listLocation.push('located');*/

    located=true;

    if (activateDeactivateTrack) {
      let sameLocation = true;
      if (lastPosition != null) {
        for (let index = 0; index < lastPosition.length; index++) {
          if (geolocation.getPosition()[index] != lastPosition[index]) {
            sameLocation = false;
          }
        }
      }

      if (!sameLocation || lastPosition == null) {
        let pointList = [coordinates[0], coordinates[1]];

        arrayRute.push(pointList);

        geom = new ol.geom.LineString(arrayRute);
        feature.setGeometry(geom);

        lastPosition = geolocation.getPosition();
      }
    }
  });

  layer = new ol.layer.Vector({
    map: map,
    source: new ol.source.Vector({
      features: [positionFeature],
    }),
  });

  map.on("moveend", function () {
    checkCenter(map.getView());
  });
}

function centerView(view) {
  if (geolocation.getPosition() != null) {
    let zoom = view.getZoom();

    if (zoom < 18) {
      zoom = 18;
    }

    isCenter = true;
    flyTo(geolocation.getPosition(), zoom);
    el("center").setAttribute("disabled", "true");
  }
}

function checkCenter(view) {
  if (geolocation != null) {
    let center = view.getCenter();
    let zoom = view.getZoom();

    if (activateDeactivateLocation) {
      let position = geolocation.getPosition();

      //track est?? activado
      if (position != null) {
        let samePoint = true;

        for (let index = 0; index < position.length; index++) {
          if (center[index] != position[index]) {
            samePoint = false;
          }
        }

        if (samePoint && zoom >= 18) {
          //est?? centrado
          el("center").setAttribute("disabled", "true");
          el("center").style.backgroundColor = '#71a7d3';
          isCenter = true;
        } else {
          //no est?? centrado
          el("center").removeAttribute("disabled");
          el("center").style.backgroundColor = '#7A7A73';
          isCenter = false;
        }
      }
    } else {
      //track no est?? activado
      el("center").setAttribute("disabled", "true");
      el("center").style.backgroundColor = '#71a7d3';
      isCenter = true;
    }
  }
}

function deactivate(map) {
  el("center").style.backgroundColor = '#d5ddde';
  el("center").setAttribute("disabled", "true");
  removePositions(map);
  //listLocation = [];
  geolocation = null;
}

function removePositions(map) {
  if (positionFeature != null) {
    layer.getSource().removeFeature(positionFeature);
  }
  if (geolocation != null) {
    geolocation.setTracking(false);
  }
}

function el(id) {
  return document.getElementById(id);
}

function flyTo(coords, zoom) {
  var view = map.getView();
  var duration = 2000;
  view.animate({
    center: coords,
    duration: duration / 2,
    zoom: zoom
  });
}
