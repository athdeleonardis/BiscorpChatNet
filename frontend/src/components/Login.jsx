import React, { useState } from "react"
import ErrorMessages from "./ErrorMessages"
import securitySHA256 from "../util/security"

function Login() {
  const [inputs, setInputs] = useState({ username: "", password: "" })
  const [errors, setErrors] = useState({ above: "", username: "", password: "" })
  const [showErrors, setShowErrors] = useState({ above: false, username: false, password: false })
  const [waitForSubmit, setWaitForSubmit] = useState(false)

  function checkFormat() {
    // return false if any errors
    if (showErrors.above || showErrors.username || showErrors.password)
      return false

    // return false if any fields empty
    let success = true

    if (inputs.username === "") {
      addError("username", "Field must not be empty.\n")
      success = false
    }
    if (inputs.password === "") {
      addError("password", "Field must not be empty.\n")
      success = false
    }
    
    return success
  }


  async function checkMatches() {
    return fetch(`http://127.0.0.1:3000/profile-matches/${inputs.username}`)
    .then(res => res.json())
    .then(data => {
      if (!data.exists) {
        addError("above", "Username or password do not match.\n")
        return false
      }
      return checkPasswordMatches(data.password)
    })
    .catch(err => {
      console.log(err)
      addError("above", "Could not check username and password.\n")
      return false
    })
  }

  async function checkPasswordMatches(passHash) {
    let ourPassHash = await securitySHA256(inputs.password)
    let matches = passHash === ourPassHash
    if (!matches)
      addError("above", "Username or password do not match.\n")
    return matches
  }

  function addError(valueName, error) {
    setErrors(values => ({...values, [valueName]: values[valueName] + error}))
    setShowErrors(values => ({...values, [valueName]: true}))
  }

  function resetErrors() {
    setErrors({ above: "", username: "", password: "" })
    setShowErrors({ above: false, username: false, password: false })
  }

  function resetInputs() {
    setInputs({ username: "", password: "" })
  }

  function handleChange(event) {
    const value = event.target.value
    const valueName = event.target.name

    setInputs(values => ({...values, [valueName]: value}))
    resetErrors()
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (waitForSubmit)
      return
    setWaitForSubmit(true)

    // Check errors and empty fields
    if (!checkFormat()) {
      setWaitForSubmit(false)
      return
    }

    // Check database if username and password match
    checkMatches()
    .then(success => {
      if (success) {
        console.log("Successfully matched username and password")
        console.log({
          username: inputs.username,
          password: inputs.password
        })
        resetInputs()
      }
      setWaitForSubmit(false)
    })
    .catch(err => {
      console.log(err)
      addError("above", "Could not check if username and password match.\n")
      setWaitForSubmit(false)
    })
  }

  return (
    <div id="Login">
      <h1>Login</h1>
      <form id="Login" onSubmit={handleSubmit}>
        <ErrorMessages text={errors.above} />
        <label>Username:
          <input type="text" name="username" value={inputs.username} onChange={handleChange} />
          <ErrorMessages text={errors.username} />
        </label>
        <label>Password:
          <input type="password" name="password" value={inputs.password} onChange={handleChange} />
          <ErrorMessages text={errors.password} />
        </label>
        <input type="submit" value="Login" />
      </form>
    </div>
  )
}

export default Login
