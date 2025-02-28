// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import fs from 'fs';
import { version } from '../package.json';

const config = `{
	sdkVersion: '${version}',
};
`;
fs.writeFileSync('./src/config.ts', `export default ${config}`);
console.log(`Version ${version} written to .env file.`);
