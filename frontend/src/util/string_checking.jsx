function isOnlyLetters(str) {
  return /^[a-zA-Z]+$/.test(str)
}

function isOnlyNumbers(str) {
  return /^[0-9]+$/.test(str)
}

function isAlphabetical(str) {
  return /^[a-zA-Z ]+$/.test(str)
}

export class StringChecker {
  constructor() {
    if (this.constructor == StringChecker) {
      throw new Error("Abstract class StringChecker cannot be instantiated.")
    }
  }

  check(str, res) {
    throw new Error("StringChecker method 'check' must be implemented.")
  }
}

export class StringCheckMulti extends StringChecker {
  constructor() {
    super()
    this.string_checks = []
  }

  addCheck(check) {
    this.string_checks.push(check)
  }

  check(str, res) {
    this.string_checks.forEach((string_check) => {
      string_check.check(str, res)
    })
  }
}

export class StringCheckMaxLength extends StringChecker {
  constructor(max) {
    super()
    this.max = max
  }

  check(str, res) {
    if (str.length > this.max) {
      res.success = false
      res.message += `Must be less than ${this.max} characters long.\n`
    }
  }
}

export class StringCheckMinLength extends StringChecker {
  constructor(min) {
    super()
    this.min = min
  }

  check(str, res) {
    if (str.length < this.min) {
      res.success = false
      res.message += `Must be at least ${this.min} characters long.\n`
    }
  }
}

export class StringCheckRestrictSpecialChars extends StringChecker {
  constructor(special_chars) {
    super()
    this.special_chars = special_chars
  }

  check(str, res) {
    for (let i = 0; i < str.length; i++) {
      if (!isOnlyLetters(str[i]) && !isOnlyNumbers(str[i]) && !this.special_chars.includes(str[i])) {
        res.success = false
        res.message += `The only special characters allowed are '${this.special_chars}'\n`
        break
      }
    }
  }
}

export class StringContainsSpecialChar extends StringChecker {
  constructor(special_chars) {
    super()
    this.special_chars = special_chars
  }

  check(str, res) {
    for (let i = 0; i < str.length; i++) {
      if (this.special_chars.includes(str[i]))
        return
    }
    res.success = false
    res.message += `Must contain a special character from '${this.special_chars}'\n`
  }
}

export class StringContainsLowercase extends StringChecker {
  check(str, res) {
    if (str === str.toUpperCase()) {
      res.success = false
      res.message += "Must contain a lowercase letter.\n"
    }
  }
}

export class StringContainsInteger extends StringChecker {
  check(str, res) {
    for (let i = 0; i < str.length; i++) {
      if (/^[0-9]+$/.test(str[i]))
        return
    }
    res.success = false
    res.message += "Must contain a number.\n"
  }
}

export class StringContainsUppercase extends StringChecker {
  check(str, res) {
    if (str === str.toLowerCase()) {
      res.success = false
      res.message += "Must contain an uppercase letter.\n"
    }
  }
}

export class StringContainsLetter extends StringChecker {
  check(str, res) {
    if (str === str.toLowerCase() && str === str.toUpperCase()) {
      res.success = false
      res.message += "Must contain a letter.\n"
    }
  }
}

export class StringIsAlphabetical extends StringChecker {
  check(str, res) {
    if (/^[a-zA-Z ]+$/.test(str))
      return
    res.success = false
    res.message += "Only alphabetical characters and spaces are allowed.\n"
  }
}

export class PasswordChecker extends StringCheckMulti {
  constructor(min_length, special_chars) {
    super()
    super.addCheck(new StringCheckMinLength(min_length))
    super.addCheck(new StringContainsLowercase())
    super.addCheck(new StringContainsUppercase())
    super.addCheck(new StringContainsInteger())
    super.addCheck(new StringContainsSpecialChar(special_chars))
    this.instance = null
  }
  
  check(str, res) {
    super.check(str, res)
  }


}

export class UsernameChecker extends StringCheckMulti {
  constructor(min_length, max_length, special_chars) {
    super()
    super.addCheck(new StringCheckMinLength(min_length))
    super.addCheck(new StringCheckMaxLength(max_length))
    super.addCheck(new StringCheckRestrictSpecialChars(special_chars))
    super.addCheck(new StringContainsLetter())
  }
  
  check(str, res) {
    super.check(str, res)
  }
}

export class NameChecker extends StringCheckMulti {
  constructor(max_length) {
    super()
    super.addCheck(new StringCheckMaxLength(max_length))
    super.addCheck(new StringIsAlphabetical())
  }

  check(str, res) {
    super.check(str, res)
  }
}


export const usernameCheckerInstance =  new UsernameChecker(4, 20, `-_.`)
export const nameCheckerInstance =  new NameChecker(50)
export const passwordCheckerInstance = new PasswordChecker(7, `~!@#$%^&*()-_=+[{]}\|;:'",<.>/?`)

export default {}
