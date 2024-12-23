import { AddLicense, GetCopyToExamples, GetFilename, GetInfo, GetOutFile, GetPathJS, LogTime, SetInfo } from './BuildData.mjs';

import boxen from 'boxen';
import chalkTemplate from 'chalk-template';
import { filesize } from 'filesize';
import fs from 'fs';
import { gzipSizeSync } from 'gzip-size';
import { minify } from 'terser';
import path from 'path';

export const OnProdEndPlugin = {
    name: 'on-prod-end',
    setup (build)
    {
        build.onEnd(async (buildResults) => {

            const filename = GetFilename();

            if (buildResults.errors.length > 0)
            {
                console.log(boxen(`Guru Error!`, {
                    padding: 1,
                    margin: 1,
                    borderColor: 'redBright',
                    borderStyle: 'bold'
                }));

                console.log(buildResults.errors);
                process.exit(1);
            }
            else
            {
                LogTime(chalkTemplate`{whiteBright ${filename}}`);
            }

            const pathJS = GetOutFile();

            const buffer = fs.readFileSync(pathJS);
            const source = fs.readFileSync(pathJS, { encoding: 'utf8', flag: 'r' });
            const codeMin = await minify(source);

            const unminSize = filesize(Buffer.byteLength(buffer));
            const minSize = filesize(Buffer.byteLength(codeMin.code));
            const gzSize = filesize(gzipSizeSync(codeMin.code));

            SetInfo(chalkTemplate`\n{yellowBright.bold Bundle:} ${unminSize}`);
            SetInfo(chalkTemplate`\n{yellowBright.bold Minified:} ${minSize}`);
            SetInfo(chalkTemplate`\n{yellowBright.bold GZipped:} ${gzSize}`);

            console.log(boxen(GetInfo(), {
                padding: 1,
                margin: 1,
                borderColor: 'cyanBright',
                borderStyle: 'bold'
            }));

            await AddLicense(pathJS);

            if (GetCopyToExamples())
            {
                fs.copyFileSync(pathJS, `examples${path.sep}lib${path.sep}${filename}`);
            }

        });
    }
};
