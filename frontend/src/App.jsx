import React, { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [profiles, setProfiles] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:3000/profiles')
    .then(res => res.json())
    .then(data => setProfiles(data))
    .catch(err => console.log(err));
  }, [])
  return (
    <div id="root" style={{padding: "100px"}}>
      <table>
        <thead>
          <th>ID</th>
          <th>Username</th>
          <th>Name</th>
          <th>Post Count</th>
          <th>Follow Count</th>
          <th>Date Created</th>
        </thead>
        <tbody>
          {profiles.map((val, index) => (
            <tr key={index}>
              <td>{val.id}</td>
              <td>{val.username}</td>
              <td>{val.name}</td>
              <td>{val.post_count}</td>
              <td>{val.follow_count}</td>
              <td>{val.date_created.substring(0,10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
