import React, { useEffect, useState } from "react";

function TempDisplayProfiles() {
  const [profiles, setProfiles] = useState([])

  useEffect(() => {
    fetch('http://127.0.0.1:3000/profiles')
    .then(res => res.json())
    .then(data => setProfiles(data))
    .catch(err => console.log(err))
  })
  return (
    <table>
      <thead>
        <tr>
        <th>ID</th>
          <th>Username</th>
          <th>Name</th>
          <th>Post Count</th>
          <th>Like Count</th>
          <th>Date Created</th>
        </tr>
      </thead>
      <tbody>
        {profiles.map((val, index) => (
          <tr key={index}>
            <td>{val.id}</td>
            <td>{val.username}</td>
            <td>{val.name}</td>
            <td>{val.post_count}</td>
            <td>{val.like_count}</td>
            <td>{val.date_created.substring(0,10)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default TempDisplayProfiles