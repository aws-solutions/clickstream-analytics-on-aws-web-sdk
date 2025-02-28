// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const config = require('./webpack.config.js');

const entry = { 'clickstream-web': './lib-esm/index.js' };
module.exports = Object.assign(config, { entry, mode: 'development' });
