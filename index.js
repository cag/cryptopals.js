module.exports = {
    hexToBase64(hexStr) {
        return Buffer.from(hexStr, 'hex').toString('base64')
    }
}
