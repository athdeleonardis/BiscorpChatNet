import React from "react"
import ErrorMessages from "./ErrorMessages"

class TextEntry extends React.Component {
  state = {
    value: "",
    showErrors: false,
    errorMessages: ""
  }

  constructor(props) {
    super(props)
  }

  reset() {
    this.setState({
      value: "",
      showErrors: false,
      errorMessages: ""
    })
  }

  checkFormat() {
    if (this.state.showErrors)
      return false
    if (this.props.mustBeFilled && this.state.value === "") {
      this.addError("Field must not be empty.\n")
      return false
    }
    return true
  }

  addError(error) {
    this.setState({
      value: this.state.value,
      showErrors: true,
      errorMessages: this.state.errorMessages + error
    })
  }

  handleChange(event) {
    const value = event.target.value
    let showErrors = false
    let errorMessages = ""
    if (value !== "" && this.props.stringChecker) {
      let result = { success: true, message: "" }
      this.props.stringChecker.check(value, result)
      showErrors = !result.success
      errorMessages = result.message
    }
    this.setState({ value: value, showErrors: showErrors, errorMessages: errorMessages })
  }

  render() {
    return (
      <label>{this.props.title}
        <input type={this.props.type} name={this.props.valueName} value={this.state.value} onChange={event => this.handleChange(event)}/>
        {this.state.showErrors
          ? <ErrorMessages text={this.state.errorMessages} />
          : <></>
        }
      </label>
    )
  }
}

export default TextEntry