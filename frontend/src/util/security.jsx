const intToHex = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: 'a',
  11: 'b',
  12: 'c',
  13: 'd',
  14: 'e',
  15: 'f'
}

function uint8ToHex(uint8) {
  let char1 = intToHex[(uint8 & 0xf0) >> 4]
  let char2 = intToHex[uint8 & 0x0f]
  return char1 + char2
}

async function securitySHA256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashText = hashArray.map(uint8ToHex).join('')
  return hashText
}

export default securitySHA256