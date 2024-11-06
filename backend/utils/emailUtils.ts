import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

async function readHTMLFile(filePath: string) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

export async function compileHTMLFile(fileName: string, data: any) {
    try {
        const htmlFilePath = path.join(__dirname, '../templates', fileName)
        const template = await readHTMLFile(htmlFilePath);
        const compiledTemplate = handlebars.compile(template);

        return compiledTemplate(data);
    } catch (error) {
        throw new Error(`Error compiling HTML file: ${error}`);
    }
};