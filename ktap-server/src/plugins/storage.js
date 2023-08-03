'use strict';
import fs from 'fs';
import fp from 'fastify-plugin';
import { v4 as uuid } from 'uuid';

// XXX maybe we can try a cloud storage like qiniu, s3, etc.
class LocalStorage {
    constructor({ base, urlPrefix }) {
        this.base = base || './public/uploads';
        this.urlPrefix = urlPrefix || '/public/uploads';
    }
    async store(filename, buffer) {
        const date = new Date();
        let localFilename = uuid().replace(/-/g, '');
        const extIndex = filename?.lastIndexOf('.') || -1;
        if (extIndex !== -1) localFilename = localFilename + filename.substring(extIndex);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dir = `${this.base}/${year}/${month}/${day}`;

        if (!fs.existsSync(dir)) await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.writeFile(`${dir}/${localFilename}`, buffer);

        return `${this.urlPrefix}/${year}/${month}/${day}/${localFilename}`;
    }
    async delete(filename) {
        const path = filename.substring(this.urlPrefix.length);
        const dir = `${this.base}${path}`;
        await fs.promises.unlink(dir);
    }
}

const storagePlugin = async (fastify, opts, next) => {
    const storage = new LocalStorage(opts);
    fastify.decorate('storage', storage);
    next();
};

export default fp(storagePlugin);
