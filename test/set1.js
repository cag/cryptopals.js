const assert = require('assert')
const C = require('..')

describe('Crypto Challenge Set 1', () => {
    it('Convert hex to base64', () => {
        assert.equal(C.hexToBase64('49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d'), 'SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t')
    })
    it('Fixed XOR', () => {
        assert.equal(C.xorHexes('1c0111001f010100061a024b53535009181c', '686974207468652062756c6c277320657965'), '746865206b696420646f6e277420706c6179'))
    })
    it('Single-byte XOR cipher', () => {
        assert(C.isMessage(C.findBestSingleByteXORKey('1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736')))
    })
    it('Detect single-character XOR', () => {
        assert.fail('not done yet')
    })
    it('Implement repeating-key XOR', () => {
        assert.fail('not done yet')
    })
    it('Break repeating-key XOR', () => {
        assert.fail('not done yet')
    })
    it('AES in ECB mode', () => {
        assert.fail('not done yet')
    })
    it('Detect AES in ECB mode', () => {
        assert.fail('not done yet')
    })
})
