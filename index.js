function xorBuffers(a, b) {
    return a.map((val, i) => val ^ b[i])
}

const charScores = {
    a: 8.167, b: 1.492, c: 2.782, d: 4.253, e: 12.702, f: 2.228, g: 2.015,
    h: 6.094, i: 6.966, j: 0.153, k: 0.772, l: 4.025, m: 2.406, n: 6.749,
    o: 7.507, p: 1.929, q: 0.095, r: 5.987, s: 6.327, t: 9.056, u: 2.758,
    v: 0.978, w: 2.360, x: 0.150, y: 1.974, z: 0.07,
    '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0,
    ' ': 0, '.': 0, ',': 0, '!': 0, '?': 0, "'": 0, '"': 0, ':': 0, ';': 0, '-': 0, '\n': 0,
}

function scoreEnglishChar(charCode) {
    score = charScores[String.fromCharCode(charCode).toLowerCase()]
    return score == null ? -20 : score**(1e-2)
}

function scoreEnglishBuffer(buf) {
    return Array.from(buf).reduce((scoreAcc, curChar) => scoreAcc + scoreEnglishChar(curChar), 0)
}

function decryptSingleByteXORKey(cipherhex, retStuff=false) {
    const ciphertext = Buffer.from(cipherhex, 'hex')
    let bestCandidate = ciphertext
    let bestScore = scoreEnglishBuffer(ciphertext)
    let bestKey = 0
    for (let k = 1; k < 256; k++) {
        let key = Buffer.alloc(ciphertext.length, k)
        let candidate = xorBuffers(ciphertext, key)
        let score = scoreEnglishBuffer(candidate)
        if(score > bestScore) {
            bestScore = score
            bestCandidate = candidate
            bestKey = k
        }
    }
    if(retStuff)
        return [bestCandidate.toString(), bestScore, bestKey]
    return bestCandidate.toString()
}

function hammingDistance(a, b) {
    return Array.from(xorBuffers(Buffer.from(a), Buffer.from(b))).reduce((bitCount, byte) => {
        for (let i = 0; i < 8; i++)
            if(byte & (1<<i)) bitCount++
        return bitCount
    }, 0)
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
        if(Array.from(Buffer.from(str)).every((charCode) => scoreEnglishChar(charCode) >= 0))
            return true
        console.log(Array.from(Buffer.from(str)).filter((charCode) => scoreEnglishChar(charCode) < 0))
        return false
    },

    encryptRepeatingKeyXOR(message, key) {
        return xorBuffers(Buffer.from(message), Buffer.alloc(message.length, key)).toString('hex')
    },

    hammingDistance,

    decryptRepeatingKeyXOR(ciphertext) {
        let keySizeGuesses = []
        for (let ks = 2; ks < 41; ks++) {
            let avgScore = 0
            for (let i = 0; i < 4; i++) {
                avgScore += hammingDistance(ciphertext.slice(i*ks, (i+1)*ks), ciphertext.slice((i+1)*ks, (i+2)*ks))
            }
            avgScore /= ks * 4

            keySizeGuesses.push([ks, avgScore])
        }
        keySizeGuesses.sort(([kS1, score1], [kS2, score2]) => score1 - score2)
        // console.log('key size guesses', keySizeGuesses)

        let bestMessage = null, bestScore = -Infinity
        for (ksi = 0; ksi < 4; ksi++) {
            let keySizeGuess = keySizeGuesses[ksi][0]

            cipherblocks = []
            for (let i = 0; i < keySizeGuess; i++) {
                cipherblocks.push(ciphertext.filter((c, j) => j % keySizeGuess === i).toString('hex'))
            }

            // console.log(ciphertext.toString('hex'))
            // console.log('---------------------------------------------')
            //
            // console.log(cipherblocks)
            // console.log('---------------------------------------------')

            decBlocks = cipherblocks.map((ct) => decryptSingleByteXORKey(ct, true))

            // console.log(decBlocks)

            let msg = Array.from(decBlocks[0][0]).reduce((msg, _, i) =>  msg + decBlocks.map((b) => b[0][i]).join(''), '')
            let score = decBlocks.reduce((acc, b) => acc + b[1], 0)
            let key = decBlocks.reduce((acc, b) => acc + String.fromCharCode(b[2]), '')

            // console.log(msg)
            // console.log('score:', score)
            // console.log('key:', key)

            if(score > bestScore) {
                bestScore = score
                bestMessage = msg
            }
        }

        return bestMessage
    },
}
