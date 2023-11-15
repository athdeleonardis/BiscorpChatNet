const PASSWORD_MIN_CHARS = 7
const SPECIAL_CHARS = "!@#$%^&*,.:;_"
const NUMBER_CHARS = "0123456789"

function stringContains(str, chars) {
  for (let char of str) {
    if (chars.includes(""+char))
      return true;
  }
  return false;
}

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

function securityCheckPassword(password, result) {
  result.success = true;
  result.message = ""
  if (password === "")
    return

  if (password.length < PASSWORD_MIN_CHARS) {
    result.success = false;
    result.message += `Must be at least ${PASSWORD_MIN_CHARS} characters long.\n`
  }
  if (password === password.toLowerCase()) {
    result.success = false;
    result.message += "Must contain an uppercase letter.\n"
  }
  if (password === password.toUpperCase()) {  
    result.success = false;
    result.message += "Must contain a lowercase letter.\n"
  }
  if (!stringContains(password, SPECIAL_CHARS)) {
    result.success = false;
    result.message += `Must contain at least one of the following special characters: ${SPECIAL_CHARS}\n`
  }
  if (!stringContains(password, NUMBER_CHARS)) {
    result.success = false;
    result.message += `Must contain at least one number.\n`
  }
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

export default securityCheckPassword;
export { securityCheckPassword, securitySHA256};