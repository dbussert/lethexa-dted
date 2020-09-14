/* global __dirname */

var assert = require("assert");
var dted = require('../index.js');
var path = require('path');

var createFileSystemTileFetcher = function () {
	return new dted.FileSystemTileFetcher(path.join(__dirname, '..', 'examples'));
};

var roundDigits = function (x, digits) {
	var multiplier = Math.pow(10.0, digits);
	return Math.round(x * multiplier) / multiplier;
};

describe('dtedtile', function () {
	describe('#getLonIndexOf()', function () {
		it('should return a valid lon-index', async function (done) {
			const tileFetcher = createFileSystemTileFetcher();
			const tile = await tileFetcher.fetchTile('e008/n53')
			const actual = tile.getLonIndexOf(8.5);
			const expected = 30;

			assert.equal(expected, actual);

			done();
		});
	});

	describe('#getLatIndexOf()', function () {
		it('should return a valid lat-index', async function (done) {
			const tileFetcher = createFileSystemTileFetcher();

			const tile = await tileFetcher.fetchTile('e008/n53')
			const actual = tile.getLatIndexOf(53.5);
			const expected = 60;

			assert.equal(expected, actual);

			done();
		});
	});

	describe('#getAltitudeAtIndex()', function () {
		it('should return valid altitude at the given lat/lon-index', async function (done) {
			const tileFetcher = createFileSystemTileFetcher();
			const tile = await tileFetcher.fetchTile('e008/n53')
			const idxLat = tile.getLatIndexOf(53.5);
			const idxLon = tile.getLonIndexOf(8.125);
			const actual = tile.getAltitudeAtIndex(idxLat, idxLon);
			const expected = 0;

			assert.equal(expected, actual);

			done();
		});
	});

	describe('#getLatitudeCount()', function () {
		it('should return the number of latitude values', async function (done) {
			const tileFetcher = createFileSystemTileFetcher();
			const tile = await tileFetcher.fetchTile('e008/n53')
			const actual = tile.getLatitudeCount();
			const expected = 121;

			assert.equal(expected, actual);

			done();
		});
	});

	describe('#getLongitudeCount()', function () {
		it('should return the number of longitude values', async function (done) {
			const tileFetcher = createFileSystemTileFetcher();
			const tile = await tileFetcher.fetchTile('e008/n53')
			const actual = tile.getLongitudeCount();
			const expected = 61;

			assert.equal(expected, actual);

			done();
		});
	});

	describe('#getCellData()', function () {
		it('should return the coords of the other corner', async function (done) {
			const tileFetcher = createFileSystemTileFetcher();
			const tile = await tileFetcher.fetchTile('e008/n53')
			const cell = tile.getCellData();
			const actualLat = cell.latOfCorner;
			const actualLon = cell.lonOfCorner;
			const expectedLat = 54;
			const expectedLon = 9;

			assert.equal(actualLat, expectedLat);
			assert.equal(actualLon, expectedLon);

			done();
		});
	});
});

describe('dtedterrain', function () {
	describe('#makeTileName()', function () {
		it('should return valid tilename, when providing lat/lon-values', function () {
			const terrain = new dted.Terrain();
			const tileName = terrain.makeTileName(53.5, 8.125);

			assert.equal(tileName, 'e008/n53');
		});
	});

	describe('#makeTileName()', function () {
		it('should return valid tilename, when providing lat/lon-values', function () {
			const terrain = new dted.Terrain();
			const tileName = terrain.makeTileName(-53.5, 8.125);

			assert.equal(tileName, 'e008/s54');
		});
	});

	describe('#makeTileName()', function () {
		it('should return valid tilename, when providing lat/lon-values', function () {
			const terrain = new dted.Terrain();
			const tileName = terrain.makeTileName(-53.5, -8.125);

			assert.equal(tileName, 'w009/s54');
		});
	});

	describe('#makeTileName()', function () {
		it('should return valid tilename, when providing lat/lon-values', function () {
			const terrain = new dted.Terrain();
			const tileName = terrain.makeTileName(53.5, -8.125);

			assert.equal(tileName, 'w009/n53');
		});
	});

	describe('#fetchTileAt()', function () {
		it('should return undefined, when providing lat/lon-values for not existing tile', async function () {
			const terrain = new dted.Terrain(createFileSystemTileFetcher());
			const tile = await terrain.fetchTileAt(52.5, 8.125)
			assert.equal(tile, null);
		});
	});

	describe('#fetchTileAt()', function () {
		it('should return valid tile, when providing lat/lon-values for existing tile', async function (done) {
			const terrain = new dted.Terrain(createFileSystemTileFetcher());
			const tile = await terrain.fetchTileAt(53.5, 8.125)
			if (!tile) {
				throw new Error('Tile not found')
			}
			done();
		});
	});

	describe('#getAltitudeAt()', function () {
		it('should return valid altitude at the given lat/lon-position', async function (done) {
			const terrain = new dted.Terrain(createFileSystemTileFetcher());
			const altitude = await terrain.getAltitudeAt(53.5, 8.5)

			assert.equal(altitude, 1);

			done();
		});
	});

	describe('getInterpolatedAltitudeAt() in tile', function () {
		it('should return an interpolated altitude at the given lat/lon-position', async function () {// No done here, otherwise it does not work
			const terrain = new dted.Terrain(createFileSystemTileFetcher());
			const altitude = await terrain.getInterpolatedAltitudeAt(53.50415, 8.55833)
			assert.equal(roundDigits(altitude, 2), 1.5);
		});
	});

	describe('getInterpolatedAltitudeAt() at not existing tile', function () {
		it('should return an interpolated altitude at the given lat/lon-position', async function () {// No done here, otherwise it does not work
			const terrain = new dted.Terrain(createFileSystemTileFetcher());
			const altitude = await terrain.getInterpolatedAltitudeAt(13.0, 13.0)
			assert.equal(roundDigits(altitude, 2), 0);
		});
	});
	describe('getInterpolatedAltitudeAt() at edge of tile', function () {
		it('should return an interpolated altitude at the given lat/lon-position', async function () {// No done here, otherwise it does not work
			const terrain = new dted.Terrain(createFileSystemTileFetcher());
			const altitude = await terrain.getInterpolatedAltitudeAt(53.0, 8.0)
			assert.equal(roundDigits(altitude, 2), 7);
		});
	});
});
