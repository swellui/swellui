const swell = require('swell-js');

interface SwellConfig {
    storeId: string;
    publicKey: string;
}

export async function Swell({ storeId, publicKey }: SwellConfig) {
    await swell.init(storeId, publicKey, {
        useCamelCase: true
    });
    return swell;
}
