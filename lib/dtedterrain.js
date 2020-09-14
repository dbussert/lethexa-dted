/*
The MIT License (MIT)

Copyright (c) 2015 Tim Leerhoff <tleerhof@web.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/* global module, __dirname, process */
var dted = require('./dtedtile');
var path = require('path');

/**
 * A class for fetching DTED-tiles from the filesystem
 * @class FileSystemTileFetcher
 * @constructor
 * @param basePath The basepath of the DTED-files.
 */
module.exports.FileSystemTileFetcher = function (basePath) {
	'use strict';
	const fs = require('fs').promises;
	var self = this;

	this.fetchTile = function (name) {
		return self.fetchTileWithSuffix(name, 2).catch(function () {
			return self.fetchTileWithSuffix(name, 1);
		}).catch(function () {
			console.log('open file', name);
			return self.fetchTileWithSuffix(name, 0);
		}).catch(function () {
			return null
		});
	};

	this.fetchTileWithSuffix = function (name, suffix) {
		const filename = path.join(basePath, name + '.dt' + suffix);
		return fs.readFile(filename).then((data) => {
			var tile = new dted.Tile(data);
			return tile;
		});
	};
};

/**
 * DTED-Terrain class for transparent fetching of DTED-tiles
 * @class Terrain
 * @constructor
 * @param tilefetcher The object which is fetching the tiles.
 */
module.exports.Terrain = function (tilefetcher) {
	'use strict';
	var tileCache = {};
	var self = this;

	var makeLonTileName = function (lon) {
		var lonValue = Math.abs(Math.floor(lon));
		var nameOfTile = lonValue;
		if (lonValue < 100) {
			nameOfTile = '0' + nameOfTile;
		}
		if (lonValue < 10) {
			nameOfTile = '0' + nameOfTile;
		}
		return lon > 0.0 ? 'e' + nameOfTile : 'w' + nameOfTile;
	};

	var makeLatTileName = function (lat) {
		var latValue = Math.abs(Math.floor(lat));
		var nameOfTile = latValue;
		if (latValue < 10) {
			nameOfTile = '0' + nameOfTile;
		}
		return lat > 0.0 ? 'n' + nameOfTile : 's' + nameOfTile;
	};

	/**
	 * Creates a tilename from lat/lon-coordinates
	 * @method makeTileName
	 * @param lat {number} The latitude-value in decimal-degrees
	 * @param lon {Number} The longitude-value in decimal-degrees
	 * @return {String} The name in format: e008/n53
	 */
	this.makeTileName = function (lat, lon) {
		return makeLonTileName(lon) + '/' + makeLatTileName(lat);
	};

	var cacheTile = function (nameOfTile, tile) {
		tileCache[nameOfTile] = tile;
	};

	var getTile = function (nameOfTile) {
		return tileCache[nameOfTile];
	};

	/**
	 * Fetches a tile from cache or datasource  and calls the callback-function with it.
	 * @method fetchTileAt
	 * @param lat {number} The latitude-value in decimal-degrees
	 * @param lon {number} The longitude-value in decimal-degrees
	 * @param callback {function(err, tile)} The tile for lat/lon is loaded and given to the callback
	 * @return a promise.
	 * @example
        var dted = require('dted');
	var terrain = new dted.Terrain( new dted.FileSystemTileFetcher('dted0/') );

	terrain.fetchTileAt( 53.5, 8.125, function(err, tile) {
		if(err)
			throw err;
		console.log(tile);
	});
	 */
	this.fetchTileAt = function (lat, lon) {
		const nameOfTile = self.makeTileName(lat, lon);
		const existingTile = getTile(nameOfTile);
		if (existingTile) {
			return Promise.resolve(existingTile)
		}

		return tilefetcher.fetchTile(nameOfTile).then(function (tile) {
			cacheTile(nameOfTile, tile);
			return tile
		})
	};

	/**
	 * Reads the altitude at the given position in the tile nearest to a datapoint.
	 * @method getAltitudeAt
	 * @param lat {number} The latitude-value in decimal-degrees
	 * @param lon {number} The longitude-value in decimal-degrees
	 * @param callback {function(err, alt)} The tile for lat/lon is loaded and given to the callback
	 * @return a promise.
	 * @example
	var dted = require('dted');
	var terrain = new dted.Terrain( new dted.FileSystemTileFetcher('dted0/') );

	terrain.getAltitudeAt( 53.5, 8.125, function(err, alt) {
		if(err)
			throw err;
		console.log(alt);
	});

	// or with promise...

	terrain.getAltitudeAt( 53.5, 8.125).then(functiofetchTileAtn(alt) {
	      console.log(alt);
	}, function(err) {
	      console.error(err);
	});
	 */

	this.getAltitudeAt = function (lat, lon) {
		return self.fetchTileAt(lat, lon).then(function (tile) {
			const altitude = tile.getAltitudeAt(lat, lon);
			return altitude
		})
	};

	var interpolateAltitude = function (alt1, alt2, factor) {
		return alt1 + factor * (alt2 - alt1);
	};

	/**
	 * Generated an interpolated altitude at the given position.
	 * @method getInterpolatedAltitudeAt
	 * @param lat {number} The latitude-value in decimal-degrees
	 * @param lon {number} The longitude-value in decimal-degrees
	 * @return a promise.
	 * @example
	var dted = require('dted');
	var terrain = new dted.Terrain( new dted.FileSystemTileFetcher('dted0/') );

	terrain.getInterpolatedAltitudeAt( 53.5, 8.125).then(function(alt) {
	      console.log(alt);
	}, function(err) {
	      console.error(err);
	});
	 */
	this.getInterpolatedAltitudeAt = function (lat, lon) {
		return self.fetchTileAt(lat, lon).then(function (tile) {
			var tileData = tile.getCellData();

			var latDiff = lat - tileData.latOfOrigin;
			var lonDiff = lon - tileData.lonOfOrigin;
			var latRel = latDiff / tileData.latDelta;
			var lonRel = lonDiff / tileData.lonDelta;
			var latIndex = Math.floor(latRel);
			var lonIndex = Math.floor(lonRel);
			var latRelFrac = latRel - latIndex;
			var lonRelFrac = lonRel - lonIndex;

			var alt00 = tile.getAltitudeAtIndex(latIndex, lonIndex);
			var alt01 = tile.getAltitudeAtIndex(latIndex, lonIndex + 1);
			var alt10 = tile.getAltitudeAtIndex(latIndex + 1, lonIndex);
			var alt11 = tile.getAltitudeAtIndex(latIndex + 1, lonIndex + 1);
			var latalt1 = interpolateAltitude(alt00, alt01, lonRelFrac);
			var latalt2 = interpolateAltitude(alt10, alt11, lonRelFrac);

			var altitude = interpolateAltitude(latalt1, latalt2, latRelFrac);
			return altitude;
		}).catch(() => {
			return 0.0;
		});
	};
};
