function xorBuffers(a, b) {
    return a.map((val, i) => val ^ b[i])
}

const charScores = {
    a: 8.167, b: 1.492, c: 2.782, d: 4.253, e: 12.702, f: 2.228, g: 2.015,
    h: 6.094, i: 6.966, j: 0.153, k: 0.772, l: 4.025, m: 2.406, n: 6.749,
    o: 7.507, p: 1.929, q: 0.095, r: 5.987, s: 6.327, t: 9.056, u: 2.758,
    v: 0.978, w: 2.360, x: 0.150, y: 1.974, z: 0.07,
    ' ': 0, '.': 0, '!': 0, '?': 0, "'": 0, '"': 0, ':': 0, ';': 0, '\n': 0,
}

function scoreEnglishChar(charCode) {
    score = charScores[String.fromCharCode(charCode).toLowerCase()]
    return score == null ? -10 : score**(1e-2)
}

function scoreEnglishBuffer(buf) {
    return Array.from(buf).reduce((scoreAcc, curChar) => scoreAcc + scoreEnglishChar(curChar), 0)
}

function decryptSingleByteXORKey(cipherhex, retScore=false) {
    const ciphertext = Buffer.from(cipherhex, 'hex')
    let bestCandidate = ciphertext
    let bestScore = scoreEnglishBuffer(ciphertext)
    for (let k = 1; k < 256; k++) {
        let key = Buffer.alloc(ciphertext.length, k)
        let candidate = xorBuffers(ciphertext, key)
        let score = scoreEnglishBuffer(candidate)
        if(score > bestScore) {
            bestScore = score
            bestCandidate = candidate
        }
    }
    if(retScore)
        return [bestCandidate.toString(), bestScore]
    return bestCandidate.toString()
}

module.exports = {
    hexToBase64(hexStr) {
        return Buffer.from(hexStr, 'hex').toString('base64')
    },

    xorHexes(a, b) {
        return xorBuffers(Buffer.from(a, 'hex'), Buffer.from(b, 'hex')).toString('hex')
    },

    decryptSingleByteXORKey,

    detectSingleByteXor(cipherhexes) {
        cipherhexes = cipherhexes.filter((hex) => hex.length > 0)
        if(cipherhexes.length === 0) return null

        const firstEntryDecAndScore = decryptSingleByteXORKey(cipherhexes[0], true)
        return cipherhexes.reduce(([bestEntryDec, bestEntryScore], curHex) => {
            const [curEntryDec, curEntryScore] = decryptSingleByteXORKey(curHex, true)
            if(curEntryScore > bestEntryScore) {
                return [curEntryDec, curEntryScore]
            }
            return [bestEntryDec, bestEntryScore]
        }, firstEntryDecAndScore)[0]
    },

    isMessage(str) {
        return Array.from(Buffer.from(str)).every((charCode) => scoreEnglishChar(charCode) >= 0)
    }
}
