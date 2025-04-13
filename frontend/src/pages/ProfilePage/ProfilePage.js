import React, { useRef, useEffect } from "react";
import { LeftContainer, RightContainer } from "./components";
import Wrapper from "./wrappers/ProfilePage";
import { useAppContext } from "../../context/appContext";
import { useParams } from "react-router-dom";

const ProfilePage = () => {
  const profileload = useRef(true);
  const {
    userProfile,
    profileUser,
    profilePost,
    isLoading,
    followers,
    followings,
  } = useAppContext();
  const { id: userId } = useParams();

  useEffect(() => {
    if (profileload.current === true) {
      userProfile(userId);
    }

    return () => (profileload.current = false);
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <Wrapper className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 p-4">
        <LeftContainer profileUser={profileUser} />
      </div>
      <div className="w-full md:w-2/3 p-4">
        <RightContainer profileUser={profileUser} profilePost={profilePost} />
      </div>
    </Wrapper>
  );
};

export default ProfilePage;
