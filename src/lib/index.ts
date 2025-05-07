// place files you want to import through the `$lib` alias in this folder.

import pako from "pako";

import type { Sample } from "./gcsim-to-multiopt/gcsim_types";

export async function readJSON(file: File): Promise<Sample> {
    const text = await file.text();
    return JSON.parse(text) as Sample;
}

export async function readGZ(file: File): Promise<Sample> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const decompressed = pako.inflate(uint8Array, { to: 'string' });
    return JSON.parse(decompressed) as Sample;
}