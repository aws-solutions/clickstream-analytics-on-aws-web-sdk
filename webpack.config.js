// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const TerserPlugin = require('terser-webpack-plugin');
module.exports = {
	entry: { 'clickstream-web.min': './lib-esm/index.js' },
	mode: 'production',
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		library: {
			type: 'umd',
		},
		umdNamedDefine: true,
		globalObject: 'this',
	},
	devtool: 'source-map',
	resolve: {
		extensions: ['.js', '.json'],
	},
	module: {
		rules: [
			{
				test: /\.js?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
					},
				},
			},
		],
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				extractComments: false,
			}),
		],
	},
};
