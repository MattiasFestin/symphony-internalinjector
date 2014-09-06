'use strict';

var fnannotate = require('symphony-fnannotate'),
	fninvoke = require('symphony-fninvoke');

module.exports = function internalInjector(config, providerCache, path) {
	return function (cache, factory) {
		var getService = function getService (serviceName, locals) {
			if (cache.hasOwnProperty(serviceName) && serviceName !== '$locals') {
				if (cache[serviceName] === config.INSTANTIATING) {
					throw new Error('Circular dependency found: ' + path.join(' <- '));
				}
				return cache[serviceName];
			} else if (serviceName !== '$locals') {
				path.unshift(serviceName);
				cache[serviceName] = config.INSTANTIATING;
				cache[serviceName] = factory(serviceName, locals);
				return cache[serviceName];
			} else {
				return locals;
			}
		};

		var invoker = fninvoke(getService);

		var instantiate = function instantiate (Type, locals) {
			var Constructor = function () {},
				instance,
				returnedValue;

			// Check if Type is annotated and use just the given function at n-1 as parameter
			// e.g. someModule.factory('greeter', ['$window', function(renamed$window) {}]);
			Constructor.prototype = (Array.isArray(Type) ? Type[Type.length - 1] : Type).prototype;
			instance = new Constructor();
			return invoker(Type, instance, locals);
		};

		return {
			invoke: invoker,
			instantiate: instantiate,
			get: getService,
			annotate: fnannotate,
			has: function (name) {
				return (
					providerCache.hasOwnProperty(name + config.providerSuffix) ||
					cache.hasOwnProperty(name)
				);
			}
		};
	};
};
