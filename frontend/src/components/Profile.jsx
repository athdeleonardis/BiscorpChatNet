import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

function ProfileData({data}) {
  return (
    <div id="ProfileData">
      <h1>{data.username}</h1>
      <h3>{data.name}</h3>
      <ul>
        <li>Posts: {data.post_count}</li>
        <li>Followers: {data.follow_count}</li>
        <li>Date created: {data.date_created.substring(0,10)} </li>
      </ul>
    </div>
  )
}

function Profile() {
  const { username } = useParams()
  const [checkingProfileExists, setCheckProfileExists] = useState(true)
  const [noConnection, setNoConnection] = useState(false)
  const [profileExists, setProfileExists] = useState(false)
  const [profileData, setProfileData] = useState({})
  
  useEffect(() => {
    fetch(`http://127.0.0.1:3000/profile-show/${username}`)
    .then(res => res.json())
    .then(data => {
      if (data.exists)
        setProfileData(data)
      setProfileExists(data.exists)
      setCheckProfileExists(false);
    })
    .catch(err => { console.log(err); setNoConnection(true); setCheckProfileExists(false)})
  })

  return (
    <div id="Profile">
      {checkingProfileExists
        ? <p>Looking for profile...</p>
        : <>
        {noConnection
          ? <p>No connection...</p>
          : <>
          {profileExists
            ? <ProfileData data={profileData} />
            : <p>Profile does not exist!</p>
          }
          </>
        }
        </>
      }
      
    </div>
  )
}

export default Profile