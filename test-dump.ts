import { readPresentation } from './src/lib/index.ts';

const pres = await readPresentation('./samples/19bd69e620a22c88_ANGjdJ97_All Is Well.pro');
console.log(JSON.stringify(pres, null, 2));
