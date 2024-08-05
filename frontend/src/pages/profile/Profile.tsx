import { Await, Link, useLoaderData, useNavigate } from "react-router-dom";
import Chat from "../../components/chat/Chat";
import List from "../../components/list/List";
import "./profile.scss";
import { Button } from "../../components/button";
import { Suspense } from "react";

const Profile = () => {
  const promiseData = useLoaderData() as any;

  const navigate = useNavigate();
  const UpdateProfileHandler = () => {
    navigate("/update-profile");
  };

  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            <button onClick={UpdateProfileHandler}>Update Profile</button>
          </div>
          <div className="info">
            <span>
              Avatar:
              <img
                src="https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt=""
              />
            </span>
            <span>
              Username: <b>John Doe</b>
            </span>
            <span>
              E-mail: <b>john@gmail.com</b>
            </span>
          </div>
          <div className="title">
            <h1>My List</h1>
            <Button>
              <Link to={"/new-post"}>Create New Post</Link>
            </Button>
          </div>
          <Suspense fallback={<p>loading posts</p>}>
            <Await
              resolve={promiseData.postResponse}
              errorElement={<p>error loading posts... try again</p>}
            >
              {(resolvedPostResponse) => {
                console.log("resolvedPostResponse:", resolvedPostResponse);
                return (
                  <List items={resolvedPostResponse?.data?.data?.myPosts} />
                );
              }}
            </Await>
          </Suspense>
          <div className="title">
            <h1>Saved List</h1>
          </div>
          <Suspense fallback={<p>loading posts</p>}>
            <Await
              resolve={promiseData.postResponse}
              errorElement={<p>error loading posts... try again</p>}
            >
              {(resolvedPostResponse) => {
                console.log("resolvedPostResponse:", resolvedPostResponse);
                const savedPosts =
                  resolvedPostResponse?.data?.data?.savedPosts.map(
                    (item: any) => item?.post
                  );
                return <List items={savedPosts} />;
              }}
            </Await>
          </Suspense>
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default Profile;
