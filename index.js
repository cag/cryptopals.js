module.exports = {
    hexToBase64(hexStr) {
        return Buffer.from(hexStr, 'hex').toString('base64')
    },

    xorHexes(a, b) {
        const bBuf = Buffer.from(b, 'hex')
        return Buffer.from(a, 'hex').map((val, i) => val ^ bBuf[i]).toString('hex')
    },
}
