import React, { useState } from 'react'
import securitySHA256 from '../util/security';
import loadingIcon from '../assets/loading-icon.png'
import { NameChecker, PasswordChecker, UsernameChecker } from '../util/string_checking';

const passwordChecker = new PasswordChecker(7, `~!@#$%^&*()-_=+[{]}\|;:'",<.>/?`)
const usernameChecker = new UsernameChecker(4, 20, `-_.`)
const nameChecker = new NameChecker(50)

function ErrorMessages({text}) {
  return (
    <ul className="ErrorMessages">
      {text.trim().split("\n").map((line, index) => (
        <li key={index}>{line}</li>
      ))}
    </ul>
  )
}

function CreateProfile() {
  // Form entries
  const [inputs, setInputs] = useState({ username: "", name: "", password: "" })
  const [isPrivate, setIsPrivate] = useState(false)
  // Booleans for whether to show errors
  const [usernameShowError, setUsernameShowError] = useState(false)
  const [nameShowError, setNameShowError] = useState(false)
  const [passwordShowError, setPasswordShowError] = useState(false)
  const [errors, setErrors] = useState({ username: "", name: "", password: "" })
  // Prevent submission of form multiple times
  const [waitForSubmit, setWaitForSubmit] = useState(false);

  async function checkUsernameExists(username) {
    return fetch('http://127.0.0.1:3000/profile-exists/' + username)
      .then(res => res.json())
      .then(data => { return data; })
      .then(data => {
        if (data.exists) {
          errors.username = "Username already exists.\n"
          setUsernameShowError(true)
        }
        return data.exists
      })
      .catch(err => {
        console.log(err)
        errors.username = "No connection.\n"
        setUsernameShowError(true)
        return true
      })
  }

  function checkInput(value, valueName, stringChecker, setShowError) {
    if (value === "") {
      errors[valueName] = ""
      setShowError(false)
      return
    }
    let result = { success: true, message: "" }
    stringChecker.check(value, result)
    if (!result.success) {
      errors[valueName] = result.message
      setShowError(true)
      return
    }
    errors[valueName] = ""
    setShowError(false)
  }

  function handleChange(event) {
    const valueName = event.target.name
    const value = event.target.value
    console.log(typeof(value))
    console.log(value)
    
    setInputs(values => ({...values, [valueName]: value}))

    switch (valueName) {
      case "username":
        checkInput(value, valueName, usernameChecker, setUsernameShowError)
        break;
      case "name":
        checkInput(value, valueName, nameChecker, setNameShowError)
        break;
      case "password":
        checkInput(value, valueName, passwordChecker, setPasswordShowError)
        break;
      default:
        break;
    }
  }

  function handleCheckbox(event) {
    setIsPrivate(!isPrivate)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (waitForSubmit)
      return;
    setWaitForSubmit(true);

    if (usernameShowError || inputs.username === "") {
      setWaitForSubmit(false)
      return;
    }
    if (nameShowError || inputs.name === "") {
      setWaitForSubmit(false)
      return;
    }
    if (passwordShowError || inputs.password === "") {
      setWaitForSubmit(false)
      return;
    }

    checkUsernameExists(inputs.username)
    .then((username_exists) => {
      if (!username_exists) {
        // Input is a-ok!
        securitySHA256(inputs.password)
        .then(password_hash => {
          fetch(`http://127.0.0.1:3000/create-profile/${inputs.username}&${inputs.name}&${password_hash}&${isPrivate}`)
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
          {usernameShowError ? (<ErrorMessages text={errors.username} />) : (<></>)}
        </label>
        <label>Name:
          <input type="text" name="name" value={inputs.name || ""} onChange={handleChange} />
          {nameShowError ? (<ErrorMessages text={errors.name} />) : (<></>)}
        </label>
        <label>Password:
          <input type="password" name="password" value={inputs.password || ""} onChange={handleChange} />
          {passwordShowError ? (<ErrorMessages text={errors.password} />) : (<></>)}
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