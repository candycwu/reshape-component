/* eslint-disable complexity */

const { readFileSync } = require('fs');
const path = require('path');
const { modifyNodes } = require('reshape-plugin-util');

const defaultComponentPath = 'components/$type/$type.html';
const pathSubsitutionRegExp = /\$type/g;
const skippedAttributes = { src: 1, type: 1 };

module.exports = function reshapeComponent (options = {}) {
	return function componentPlugin (tree, context) {
		return modifyNodes(tree, (node) => node.name === 'component', function (node) {
			if (!(node.attrs && (node.attrs.type || node.attrs.src))) {
				throw new context.PluginError({
					message: 'component tag has no "type" or "src" attribute',
					plugin: 'reshape-component',
					location: node.location,
				});
			}

			const root = options.root || (context.filename && path.dirname(context.filename)) || '';
			let contentPath;

			if (node.attrs.src) {
				contentPath = node.attrs.src[0].content;
			}
			else {
				contentPath = options.componentPath || defaultComponentPath;
				contentPath = contentPath.replace(pathSubsitutionRegExp, node.attrs.type[0].content);
			}

			if (options.alias) {
				contentPath = options.alias[contentPath] || contentPath;
			}
			const componentPath = path.join(root, contentPath);
			const src = readFileSync(componentPath, 'utf8');

			const parser = (options.parserRules || []).reduce(function (m, r) {
				if (r.test.exec(contentPath)) {
					m = r.parser;
				}

				return m;
			}, context.parser);

			const componentAst = parser(src, { filename: componentPath }, { filename: componentPath });
			for (let attributeName in node.attrs) {
				if (!(attributeName in skippedAttributes)) {
					componentAst[0].attrs = componentAst[0].attrs || {};

					if (componentAst[0].attrs[attributeName] && attributeName === 'class') {
						componentAst[0].attrs[attributeName][0].content += ' ' + node.attrs[attributeName][0].content;
					}
					else {
						componentAst[0].attrs[attributeName] = node.attrs[attributeName];
					}
				}
			}

			let customTagPromise;

			if (node.content) {
				const customTags = {};

				node.content.forEach(function (customTag) {
					if (customTag.name && customTag.content) {
						customTags[customTag.name] = customTag.content;
					}
				});

				customTagPromise = modifyNodes(componentAst,
					(componentNode) => componentNode.name in customTags,
					function (customTagNode) {
						return customTags[customTagNode.name];
					}
				);
			}

			// add dependency if applicable
			if (context.dependencies) {
				context.dependencies.push({
					file: componentPath,
					parent: context.filename,
				});
			}

			// Resolve nested components and then return new nodes
			if (customTagPromise) {
				return customTagPromise.then(componentPlugin(componentAst, context));
			}
			else {
				return componentPlugin(componentAst, context);
			}
		});
	};
};
