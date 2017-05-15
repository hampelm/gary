var map;
(function(){
    var hardestHit;
    var councilCounts;
    var lastClicked;
    var councolFeature;

    map = L.map('map').fitBounds([[41.51,-87.4381],[41.66,-87.2198]]);
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/derekeder.hehblhbj/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    }).addTo(map);

    map.on('zoomend', function(e){
        if (typeof hardestHit !== 'undefined'){
            if (map.getZoom() >= 14 ){
                map.removeLayer(councilCounts)
                map.addLayer(hardestHit)
            } else {
                map.addLayer(councilCounts)
                map.removeLayer(hardestHit)
            }
            var districtOutlineWeight = map.getZoom() * .4 - 3.8
            councilCounts.setStyle({'weight': districtOutlineWeight})
        }
    });

    $.when($.getJSON('../data/hardest_hit_17.geojson'),
        $.getJSON('../data/council_counts_update.geojson')).then(
        function(hardest_hit, council_counts) {
            hardest_hit = hardest_hit[0];
            council_counts = council_counts[0];

            // console.log("Got", hardest_hit, council_counts);
            // Update the counts (if needed -- slow)
            // for (var i = 0; i < council_counts.features.length; i++) {
            //     var district = council_counts.features[i];
            //     district.properties.COUNT = 0;
            //     for (var j = 0; j < hardest_hit.features.length; j++) {
            //         var parcel = hardest_hit.features[j];
            //         var intersect = turf.intersect(district, parcel);
            //         // console.log('xxx', intersect);
            //         if (intersect) {
            //             district.properties.COUNT++;
            //         }
            //     }
            // }

            councilCounts = L.geoJson(council_counts, {
                style: styleCouncils,
                onEachFeature: function(feature, layer){
                    layer.on('click', function(e){
                        map.setZoomAround(e.latlng, 15);
                    });

                    var label_text = '<h3>' + feature.properties['COUNCIL_NU'] + '</h3>';
                    label_text += '<p><strong>Hardest Hit properties: </strong>' + feature.properties['COUNT'] + '</p>';
                    layer.bindLabel(label_text);
                    layer.on({
                        mouseover: highlightFeature,
                        mouseout: resetHighlight
                    });
                }
            }).addTo(map);

            //define hardestHit parcels but dont add to map
            hardestHit = L.geoJson(hardest_hit, {
                style: styleParcels,
                onEachFeature: parcelClick
            })
        }
    );

    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
    }

    function resetHighlight(e) {
        councilCounts.resetStyle(e.target);
    }

    function styleCouncils(feature){
        var style = {
            "color": "#333",
            "opacity": 0.7,
            "weight": 1,
            "fillOpacity": 0.5,
        }
        if (feature.properties['COUNT'] < 50){
            style['fillColor'] = "#BDD7E7"
        }
        if (feature.properties['COUNT'] >= 50 && feature.properties['COUNT'] <= 80){
            style['fillColor'] = "#6BAED6";
        }
        if (feature.properties['COUNT'] > 80){
            style['fillColor'] = "#08519C";
        }
        return style;
    }
    function styleParcels(feature){
      // Style based upon ??
        var style = {
          "color": "#bd0026",
          "weight": 1,
          "fillOpacity": 0.7,
          "fillColor": "#f03b20"
        }
        return style;
    }
    function parcelClick(feature, layer){
        layer.on('click', function(e){
            if(lastClicked){
                lastClicked.setStyle({'fillColor':"#f03b20"});
            }
            e.target.setStyle({'fillColor':"#ffffb2"});

            $('#info').html(parcelInfo(feature.properties));
            $('#info').show();
            $('#map').css('width', '75%');

            $('#map-top').html('<strong><a href="#" class="map-back">Back to all districts</a></strong>');
            $('.map-back').on('click', function(e) {
                e.preventDefault();
                map.fitBounds([[41.51,-87.4381],[41.66,-87.2198]]);
                $('#info').hide();
                $('#map').css('width', '100%');
                $('#map-top').html('<strong><div>Select a district and property for details</div></strong>');
            }.bind(map));

            map.setView(e.target.getBounds().getCenter(), 17);
            lastClicked = e.target;
        });
    }

    function formatDate(d) {
        // Given in the format  YYYY/MM/DD
        // We want MM/DD/YYYY
        var date = new Date(d);
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        return month + '/' + day + '/' + year;
    }

    function parcelInfo(properties){
        var blob = '<div><h3>' + properties['FULL_ADDR'] + '</h3>';
        blob += '<p><strong>PIN: </strong>' + properties['PIN'] + '</p>';
        blob += '<p><strong>Bid Status: </strong>' + properties['BID_STATUS'].toLowerCase().replace('iii', 'III').replace('ii', 'II').replace('hhf', 'HHF') + '</p>';
        blob += '<p><strong>Deeded Owner: </strong>' + properties['DEEDED_OWN'].toLowerCase() + '</p>';

        if (properties.NTP_START !== null) {
            blob += '<p><strong>Scheduled Demolition: </strong>' + formatDate(properties.NTP_START) + '</p>';
        }
        if (properties.DEMO_COMPL !== null) {
            blob += '<p><strong>Scheduled Demolition Complete: </strong>' + formatDate(properties.DEMO_COMPL) + '</p>';
        }
        // blob += '<p><strong>Back Taxes: </strong>' + accounting.formatMoney(properties['BACK_TAXES']) + '</p>';
        // blob += '<p><strong>Proposed End Use: </strong>' + properties['END_USE'] + '</p>';
        // blob += '<p><strong>Demolition Estimate: </strong>' + accounting.formatMoney(properties['CITY_ESTIM']) + '</p>';
        blob += '<p><strong>Neighborhood: </strong>' + properties['NEIGHBORHO'].toLowerCase() + '</p>';
        blob += '<p><strong>Council District: </strong>' + properties['COUNCIL_DI'].toLowerCase() + '</p>';
        blob += '<p><a href="#" class="map-back">Back to all districts</a></p>';
        blob += '</div>';
        return blob
    }
})()
