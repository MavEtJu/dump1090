"use strict";

function EdgeObject(lat, lon, alt) {
	this.lat = lat;
	this.lon = lon;
	this.alt = alt;
}

EdgeObject.prototype.draw = function() {
	var position = [this.lon, this.lat];
	var projHere = ol.proj.fromLonLat(position);
	var color = this.getEdgeColor();

	var circleStyle = function(distance) {
		return new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: color,
				width: 10
			}),
		});
	};

	var circle = make_geodesic_circle(position, 800, 360);
	circle.transform('EPSG:4326', 'EPSG:3857');
	var feature = new ol.Feature(circle);
	feature.setStyle(circleStyle(distance));
	EdgesFeatures.push(feature);
}

EdgeObject.prototype.getEdgeColor = function() {
        var h, s, l;

        var colorArr = this.getAltitudeColor();

        h = colorArr[0];
        s = colorArr[1];
        l = colorArr[2];

        if (h < 0) {
                h = (h % 360) + 360;
        } else if (h >= 360) {
                h = h % 360;
        }

        if (s < 5) s = 5;
        else if (s > 95) s = 95;

        if (l < 5) l = 5;
        else if (l > 95) l = 95;

        return 'hsl(' + (h/5).toFixed(0)*5 + ',' + (s/5).toFixed(0)*5 + '%,' + (l/5).toFixed(0)*5 + '%)'
}

EdgeObject.prototype.getAltitudeColor = function() {
        var h, s, l;

        if (this.alt === "ground") {
                h = ColorByAlt.ground.h;
                s = ColorByAlt.ground.s;
                l = ColorByAlt.ground.l;
        } else {
                s = ColorByAlt.air.s;
                l = ColorByAlt.air.l;

                // find the pair of points the current altitude lies between,
                // and interpolate the hue between those points
                var hpoints = ColorByAlt.air.h;
                h = hpoints[0].val;
                for (var i = hpoints.length-1; i >= 0; --i) {
                        if (this.alt > hpoints[i].alt) {
                                if (i == hpoints.length-1) {
                                        h = hpoints[i].val;
                                } else {
                                        h = hpoints[i].val + (hpoints[i+1].val - hpoints[i].val) * (this.alt - hpoints[i].alt) / (hpoints[i+1].alt - hpoints[i].alt)
                                }
                                break;
                        }
                }
        }

         if (h < 0) {
                h = (h % 360) + 360;
        } else if (h >= 360) {
                h = h % 360;
        }

        if (s < 5) s = 5;
        else if (s > 95) s = 95;

        if (l < 5) l = 5;
        else if (l > 95) l = 95;

        return [h, s, l];
}
