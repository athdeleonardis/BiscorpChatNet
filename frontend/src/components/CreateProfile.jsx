import React, { useState } from 'react'
import { securityCheckPassword, securitySHA256 } from '../util/security';
import loadingIcon from '../assets/loading-icon.png'

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
  const [inputs, setInputs] = useState({ username: "", name: "", password: "", is_private: false })
  const [errors, setErrors] = useState({ username: "", name: "", password: "" })
  const [waitingForUsernameQuery, setWaitingForUsernameQuery] = useState(false)
  const [usernameShowError, setUsernameShowError] = useState(false)
  const [nameShowError, setNameShowError] = useState(false)
  const [passwordShowError, setPasswordShowError] = useState(false)
  const [waitForSubmit, setWaitForSubmit] = useState(false);


  function checkUsernameExists(username) {
    setWaitingForUsernameQuery(true)
    fetch('http://127.0.0.1:3000/profile-exists/' + username)
      .then(res => res.json())
      .then(data => { console.log(data.exists); return data; })
      .then(data => {
        if (data.exists) {
          setErrors(values => ({...values, username: values.username + "Username already exists.\n"}))
          setUsernameShowError(true)
        }
        setWaitingForUsernameQuery(false)
      })
      .catch(err => {
        console.log(err)
        setErrors(values => ({...values, username: values.username + "No connection.\n"}))
        setUsernameShowError(true)
      })
  }

  function checkPassword(password) {
    let result = {}
    securityCheckPassword(password, result)
    if (!result.success) {
      errors.password = result.message
      setPasswordShowError(true);
    }
  }

  function handleChange(event) {
    const name = event.target.name
    const value = event.target.value
    
    setInputs(values => ({...values, [name]: value}))
    console.log(value)

    switch (name) {
      case "username":
        setUsernameShowError(false)
        errors.username = ""
        if (value === "")
          break
        checkUsernameExists(value)
        break;
      case "name":
        setNameShowError(false)
        errors.name = ""
        break;
      case "password":
        setPasswordShowError(false)
        errors.password = ""
        checkPassword(value)
        break;
      default:
        break;
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    console.log(inputs)
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
    if (usernameShowError) {
      setWaitForSubmit(false)
      return
    }

    console.log("Input is okay")
    // Input is a-ok!
    securitySHA256(inputs.password)
    .then(password_hash => {
      fetch(`http://127.0.0.1:3000/create-profile/${inputs.username}&${inputs.name}&${password_hash}&${inputs.is_private}`)
      .then(() => { setInputs({ username: "", name: "", password: "", is_private: false }); setWaitForSubmit(false); })
      .catch((err) => { console.log(err); setWaitForSubmit(false) })
    })
  }

  return (
    <div id="CreateProfile">
      <h1>Create Profile</h1>
      <form onSubmit={handleSubmit}>
        <label>Username:
          <input type="text" name="username" value={inputs.username || ""} onChange={handleChange} />
          {usernameShowError ? (<p className="InputError">Error: {errors.username}</p>) : (<></>)}
        </label>
        <label>Name:
          <input type="text" name="name" value={inputs.name || ""} onChange={handleChange} />
          {nameShowError ? (<div className="InputErrors"><p className="InputError">{errors.name}</p></div>) : (<></>)}
        </label>
        <label>Password:
          <input type="text" name="password" value={inputs.password || ""} onChange={handleChange} />
          {passwordShowError ? (<ErrorMessages text={errors.password} />) : (<></>)}
        </label>
        <label>Private:
          <input type="checkbox" name="is_private" value={inputs.is_private} onChange={handleChange} />
        </label>
        <input type="submit" />
        {waitForSubmit
          ? (<img className="LoadingIcon" src={loadingIcon} />)
          : (<></>)
        }
      </form>
    </div>
  )
}

export default CreateProfile