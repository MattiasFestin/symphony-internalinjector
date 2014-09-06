'use strict';

var should = require('should'),
	config = {
		INSTANTIATING: Object.create(null),
		providerSuffix: 'Provider'
	};

var internalInjector = require('../coverage/src/main');

describe('#internalinjector', function () {
	it('should return an wrapper function', function () {
		var path = [],
			providerCache = {},
			ii = internalInjector(config, providerCache, path);
		internalInjector.should.be.a.function;
		ii.should.be.a.function;
	});
	describe('inner function', function () {
		it('should return an object', function () {
			var path = [],
				providerCache = {},
				ii = internalInjector(config, providerCache, path),
				cache = {};

			var o = ii(cache, function (serviceName) {});

			o.should.be.an.object;
			o.invoke.should.be.an.function;
			o.instantiate.should.be.an.function;
			o.get.should.be.an.function;
			o.annotate.should.be.an.function;
			o.has.should.be.an.function;
		});

		describe('#get', function () {
			it('should throw an error if a value in cache is INSTANTIATING', function () {
				var path = [],
					providerCache = {},
					ii = internalInjector(config, providerCache, path),
					cache = {a: config.INSTANTIATING};

				var o = ii(cache, function (serviceName) {
					throw new Error('Should not be in here');
				});

				(function () {
					o.get('a');
				}).should.throw('Circular dependency found: ' + path.join(' <- '));
			});

			it('should get local vars in cache', function () {
				var path = [],
					providerCache = {},
					ii = internalInjector(config, providerCache, path),
					cache = {};

				var o = ii(cache, function (serviceName) {
					throw new Error('Should not be in here');
				});

				o.get('$locals', {a: 123}).should.eql({a: 123});
			});

			it('should retriveValue from cache', function () {
				var path = [],
					providerCache = {},
					ii = internalInjector(config, providerCache, path),
					cache = {a: Math.random()};

				var o = ii(cache, function (serviceName) {
					throw new Error('Should not be in here');
				});

				// providerCache['b' + config.providerSuffix] = 55;
				o.get('a').should.be.equal(cache.a);
				// o.get('b').should.be.equal(55);
			});

			it('should instantiate values that are not in cache', function () {
				var path = [],
					providerCache = {},
					ii = internalInjector(config, providerCache, path),
					cache = {};

				var o = ii(cache, function (serviceName) {
					serviceName.should.be.equal('a');
					return Math.random();
				});

				o.get('a').should.be.equal(cache.a);

				//Should retrive from cache from second fetch
				cache.a = Math.random();
				o.get('a').should.be.equal(cache.a);
			});
		});

		describe('#instantiate', function () {
			it('should inject function with values from cache', function () {
				var path = [],
					providerCache = {},
					ii = internalInjector(config, providerCache, path),
					cache = {a: Math.random()};

				var o = ii(cache, function (serviceName) {
					console.log(serviceName);
					throw new Error('Should not be in here');
				});

				o.instantiate(function (a) {
					a.should.be.equal(cache.a);
				});
			});

			it('should go into factory function if dependency is not found', function (done) {
				var path = [],
					providerCache = {},
					ii = internalInjector(config, providerCache, path),
					cache = {a: Math.random()};

				var o = ii(cache, function (serviceName) {
					serviceName.should.be.eql('b');
					done();
				});

				o.instantiate(function (b) {
					return {};
				});
			});

			it('should inject array notation function with values from cache', function () {
				var path = [],
					providerCache = {},
					ii = internalInjector(config, providerCache, path),
					cache = {a: Math.random()};

				var o = ii(cache, function (serviceName) {
					throw new Error('Should not be in here');
				});

				o.instantiate(['a', function (x) {
					x.should.be.equal(cache.a);
				}]);
			});
		});

		describe('#has', function () {
			it('should return boolean if key is in cache or in providerCache', function () {
				var path = [],
					providerCache = {},
					ii = internalInjector(config, providerCache, path),
					cache = {a: Math.random()};

				var o = ii(cache, function (serviceName) {
					throw new Error('Should not be in here');
				});

				providerCache['c' + config.providerSuffix] = 55;
				o.has('a').should.be.equal(true);
				o.has('b').should.be.equal(false);
				o.has('c').should.be.equal(true);
			});
		});
	});
});