const assert = require('assert')
const fs = require('fs')
const C = require('..')

describe('Crypto Challenge Set 1', () => {
    it('Convert hex to base64', () => {
        assert.equal(C.hexToBase64('49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d'), 'SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t')
    })
    it('Fixed XOR', () => {
        assert.equal(C.xorHexes('1c0111001f010100061a024b53535009181c', '686974207468652062756c6c277320657965'), '746865206b696420646f6e277420706c6179')
    })
    it('Single-byte XOR cipher', () => {
        let message = C.decryptSingleByteXORKey('1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736')
        assert(C.isMessage(message))
        console.log(message)
    })
    it('Detect single-character XOR', () => {
        cipherhexes = fs.readFileSync(`${__dirname}/4.txt`).toString().split('\n')
        let message = C.detectSingleByteXor(cipherhexes)
        assert(C.isMessage(message))
        console.log(message)
    })
    it('Implement repeating-key XOR', () => {
        assert.equal(C.encryptRepeatingKeyXOR("Burning 'em, if you ain't quick and nimble\nI go crazy when I hear a cymbal", 'ICE'), '0b3637272a2b2e63622c2e69692a23693a2a3c6324202d623d63343c2a26226324272765272a282b2f20430a652e2c652a3124333a653e2b2027630c692b20283165286326302e27282f')
    })
    it('hamming distance', () => {
        assert.equal(C.hammingDistance('this is a test', 'wokka wokka!!!'), 37)
    })
    it('Break repeating-key XOR', () => {
        let ciphertext = Buffer.from(fs.readFileSync(`${__dirname}/6.txt`).toString(), 'base64')
        let message = C.decryptRepeatingKeyXOR(ciphertext)
        console.log(message)
        assert(C.isMessage(message))
    })
    it('AES in ECB mode', () => {
        assert.fail('not done yet')
    })
    it('Detect AES in ECB mode', () => {
        assert.fail('not done yet')
    })
})
