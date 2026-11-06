import * as fs from 'fs';
import * as zlib from 'zlib';
import type { Sample } from '../../src/lib/gcsim-to-multiopt/gcsim_types';

export function readJSONFromDisk(filePath: string): Sample {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as Sample;
}

export function readGZFromDisk(filePath: string): Sample {
    const data = fs.readFileSync(filePath);
    const unzip = zlib.inflateSync(data);
    return JSON.parse(unzip.toString('utf-8')) as Sample;
}
