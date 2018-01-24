/* eslint-disable complexity */

const { readFileSync } = require('fs');
const path = require('path');
const { modifyNodes } = require('reshape-plugin-util');
const when = require('when');

module.exports = function reshapeComponent (options = {}) {
	return function componentPlugin (tree, context) {
		return modifyNodes(tree, (node) => node.name === 'component', function (node) {
			if (!(node.attrs && node.attrs.src)) {
				throw new context.PluginError({
					message: 'component tag has no "src" attribute',
					plugin: 'reshape-component',
					location: node.location,
				});
			}

			// otherwise, replace the tag with the partial's contents
			const root = options.root || (context.filename && path.dirname(context.filename)) || '';
			let contentPath = node.attrs.src[0].content;

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
				if (attributeName !== 'src') {
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
						customTags[customTag.name] = customTag.content[0].content;
					}
				});

				customTagPromise = modifyNodes(componentAst,
					(componentNode) => componentNode.name in customTags,
					function (customTagNode) {
						return {
							type: 'text',
							content: customTags[customTagNode.name],
							location: customTagNode.location,
						};
					}
				);
			}

			if (!customTagPromise) {
				customTagPromise = when.resolve();
			}

			// add dependency if applicable
			if (context.dependencies) {
				context.dependencies.push({
					file: componentPath,
					parent: context.filename,
				});
			}

			// Resolves nested components and then return new nodes
			return customTagPromise.then(componentPlugin(componentAst, context));
		});
	};
};
