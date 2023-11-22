import React, { useState } from 'react'
import securitySHA256 from '../util/security';
import loadingIcon from '../assets/loading-icon.png'
import { usernameCheckerInstance,nameCheckerInstance, passwordCheckerInstance } from '../util/string_checking';
import ErrorMessages from './ErrorMessages';

function CreateProfile() {
  // Form entries
  const [inputs, setInputs] = useState({ username: "", name: "", password: "" })
  const [isPrivate, setIsPrivate] = useState(false)
  // Form entry errors
  const [showErrors, setShowErrors] = useState({ username: false, name: false, password: false })
  const [errors, setErrors] = useState({ username: "", name: "", password: "" })
  // Prevent submission of form multiple times
  const [waitForSubmit, setWaitForSubmit] = useState(false);

  const stringCheckers = {
    username: usernameCheckerInstance,
    name: nameCheckerInstance,
    password: passwordCheckerInstance
  }
  const mustBeFilled = {
    username: true,
    name: false,
    password: true
  }

  async function checkUsernameExists(username) {
    return fetch('http://127.0.0.1:3000/profile-exists/' + username)
      .then(res => res.json())
      .then(data => { return data; })
      .then(data => {
        if (data.exists)
          addError("username", "Username already exists.\n")
        return data.exists
      })
      .catch(err => {
        console.log(err)
        addError("username", "Unable to check if username already exists.\n")
        return true
      })
  }

  function addError(valueName, error) {
    setErrors(values => ({...values, [valueName]: values[valueName]+ error}))
    setShowErrors(values => ({...values, [valueName]: true}))
  }

  function resetErrors() {
    setErrors({ username: "", name: "", password: "" })
    setShowErrors({ username: false, name: false, password: false })
  }

  function checkInputOnSubmit(valueName) {
    if (showErrors[valueName])
      return false
    const value = inputs[valueName]
    if (mustBeFilled[valueName] && value === "") {
      addError(valueName, "Field must not be empty.\n")
      return false
    }
    return true
  }

  function checkAllInputsOnSubmit() {
    let success = true

    success = checkInputOnSubmit(inputs.username) && success
    success = checkInputOnSubmit(inputs.name) && success
    success = checkInputOnSubmit(inputs.password) && success

    return success
  }

  function checkInputOnChange(value, valueName) {
    resetErrors()
    if (value === "")
      return
    let result = { success: true, message: "" }
    stringCheckers[valueName].check(value, result)
    if (!result.success)
      addError(valueName, result.message)
    return result.success
  }

  function handleChange(event) {
    const valueName = event.target.name
    const value = event.target.value
    
    setInputs(values => ({...values, [valueName]: value}))
    checkInputOnChange(value, valueName)
  }

  function handleCheckbox(event) {
    setIsPrivate(!isPrivate)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (waitForSubmit)
      return;
    setWaitForSubmit(true);

    if (!checkAllInputsOnSubmit()) {
      setWaitForSubmit(false)
      return
    }

    checkUsernameExists(inputs.username)
    .then((username_exists) => {
      if (!username_exists) {
        // Input is a-ok!
        securitySHA256(inputs.password)
        .then(password_hash => {
          const name = inputs.name === "" ? "." : inputs.name
          fetch(`http://127.0.0.1:3000/create-profile/${inputs.username}&${name}&${password_hash}&${isPrivate}`)
          .then(() => { setInputs({ username: "", name: "", password: "" }); setIsPrivate(false); setWaitForSubmit(false); })
          .catch((err) => { console.log(err); setWaitForSubmit(false); })
        })
      }
      else
        setWaitForSubmit(false)
    })

  }

  return (
    <div id="CreateProfile">
      <h1>Create Profile</h1>
      <form onSubmit={handleSubmit}>
        <label>Username:
          <input type="text" name="username" value={inputs.username || ""} onChange={handleChange} />
          <ErrorMessages text={errors.username} />
        </label>
        <label>Name:
          <input type="text" name="name" value={inputs.name || ""} onChange={handleChange} />
          <ErrorMessages text={errors.name} />
        </label>
        <label>Password:
          <input type="password" name="password" value={inputs.password || ""} onChange={handleChange} />
          <ErrorMessages text={errors.password} />
        </label>
        <label>Private:
          <input type="checkbox" name="is_private" checked={isPrivate} onChange={handleCheckbox} />
        </label>
        <input type="submit" value="Create" />
        {waitForSubmit
          ? (<img className="LoadingIcon" src={loadingIcon} />)
          : (<></>)
        }
      </form>
    </div>
  )
}

export default CreateProfile