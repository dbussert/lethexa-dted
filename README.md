Installation
------------

        npm install
        grunt

(Tests will fail after a fresh checkout, because tile e008/n53.dt0 must be
 added to 'examples'-folder.) 

Usage of Terrain
----------------

const path = require('path');
const dted = require(path.join(__dirname, 'index.js'));

const fetcher = new dted.FileSystemTileFetcher('./dted');
const terrain = new dted.Terrain(fetcher);


async function run(lat, lon) {
	const tile = await terrain.fetchTileAt(lat, lon)
	console.log(`Altitude: ${tile.getAltitudeAt(lat, lon)} m ${(tile.getAltitudeAt(lat, lon) * 3.2808).toFixed(2)} ft`);

	const alt = await terrain.getAltitudeAt(lat, lon)
	console.log(`Altitude: ${alt} m ${(alt * 3.2808).toFixed(2)} ft`);
}

run(45.689300, -118.848903)



Usage of Tile
-------------

	var dted = require('lethexa-dted');

	var buffer = ...dted-data...
	var tile = dted.Tile( buffer );
	
	// Iterate all altitude-values and their position
	tile.forEachPosition( function(lat, lon, alt) {
		console.log('Position: ', lat, lon, alt);
	});

	// Find the next altitude-value
	var alt = tile.getAltitudeAt(lat, lon);


