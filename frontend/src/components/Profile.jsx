import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

function Post({data}) {
  return (
    <div className="Post">
      <p>{data.text}</p>
      {data.like_count != 0
        ? <p>Likes: {data.like_count}</p>
        : <></>
      }
      <p>Posted on: {data.date_created.substring(0,10)}</p>
    </div>
  )
}

function PostFeed({data}) {
  const [retrievingPosts, setRetrievingPosts] = useState(true)
  const [noConnection, setNoConnection] = useState(false)
  const [noPosts, setNoPosts] = useState(false)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!retrievingPosts)
      return
    if (data.is_private) {
      setRetrievingPosts(false)
      return
    }
    setRetrievingPosts(true)
    fetch(`http://127.0.0.1:3000/postfeed/${data.id}`)
    .then(res => res.json())
    .then(data => {
      setRetrievingPosts(false)
      if (data.length == 0) {
        setNoPosts(true)
      }
      setPosts(data)
    })
    .catch(err => { console.log(err); setNoConnection(true); setRetrievingPosts(false) })
  })

  return (
    <div id="PostFeed">
      {data.is_private
        ? <p>Profile is private.</p>
        : <>
        {retrievingPosts
          ? <p>Retrieving posts...</p>
          : <>
          {noConnection
            ? <p>No connection...</p>
            : <>
            {noPosts
              ? <p>No posts.</p>
              : <ul>
                {posts.map((post, index) => (
                  <li key={index}>
                    <Post data={post} />
                  </li>
                ))}
              </ul>
            }
            </>
          }
          </>
        }
        </>
      }
    </div>
  )
}

function ProfileData({data}) {
  return (
    <div id="ProfileData">
      <h1>{data.username}</h1>
      <h3>{data.name}</h3>
      <ul className="details">
        <li>Posts: {data.post_count}</li>
        <li>Followers: {data.follower_count}</li>
        <li>Following: {data.following_count}</li>
        <li>Date created: {data.date_created.substring(0,10)}</li>
      </ul>
      <PostFeed data={data}/>
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