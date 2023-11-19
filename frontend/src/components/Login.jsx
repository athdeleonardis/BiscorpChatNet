import React from "react"
import TextEntry from "./TextEntry"

function Login() {
  const textEntryRefs = {
    username: React.createRef(),
    password: React.createRef()
  }

  function checkFormat() {
    let success = true

    console.log(textEntryRefs)

    success = textEntryRefs.username.current.checkFormat() && success
    success = textEntryRefs.password.current.checkFormat() && success

    return success
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (checkFormat()) {
      console.log({
        username: textEntryRefs.username.current.state.value,
        password: textEntryRefs.password.current.state.value
      })
      textEntryRefs.username.current.reset()
      textEntryRefs.password.current.reset()
    }
  }

  return (
    <div id="Login">
      <h1>Login</h1>
      <form id="Login" onSubmit={handleSubmit}>
        <TextEntry ref={textEntryRefs.username} title="Username:" type="text" must_be_filled />
        <TextEntry ref={textEntryRefs.password} title="Password:" type="password" mustBeFilled />
        <input type="submit" value="Login" />
      </form>
    </div>
  )
}

export default Login
