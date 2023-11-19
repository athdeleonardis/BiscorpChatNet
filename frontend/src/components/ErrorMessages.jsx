function ErrorMessages({text}) {
  return (
    <ul className="ErrorMessages">
      {text.trim().split("\n").map((line, index) => (
        <li key={index}>{line}</li>
      ))}
    </ul>
  )
}

export default ErrorMessages