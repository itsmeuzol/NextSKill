import React, { useState, useEffect } from "react";
import loginImage from "../../assets/images/shape.png";
import { Alert } from "../../component";
import { BsFillArrowLeftCircleFill } from "react-icons/bs";
import {
  UnderlineInput,
  SingleSelectInput,
} from "../../component/formcomponents";
import { useAppContext } from "../../context/appContext";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../context/ChatProvider";

const initialState = {
  name: "",
  username: "",
  email: "",
  profilePicture: null,
  password: "",
  cpassword: "",
  isMember: true,
  location: "",
  usertype: null,
};

const LoginPage = () => {
  const [values, setValues] = useState(initialState);
  const { setupUser, isLoading, showAlert, user } = useAppContext();
  const { setUser } = ChatState();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUser(user);
      setTimeout(() => {
        navigate("/user/feeds");
      }, 3000);
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const {
      name,
      email,
      password,
      isMember,
      profilePicture,
      location,
      username,
      usertype,
      cpassword,
    } = values;

    const currentUser = {
      name,
      email,
      password,
      location,
      profilePicture,
      username,
      usertype,
      cpassword,
    };

    if (isMember) {
      setupUser({
        currentUser,
        endPoint: "login",
        alertText: "Login Successful: Redirection...",
      });
    } else {
      setupUser({
        currentUser,
        endPoint: "register",
        alertText: "User Created!: Redirection...",
      });
    }
  };

  const setUser1 = (usertype) => {
    setValues({ ...values, usertype });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 to-purple-900 p-6">
      <div className="bg-white rounded-lg shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8">
          <BsFillArrowLeftCircleFill
            className="text-purple-600 text-2xl cursor-pointer hover:text-purple-700 transition-colors mb-4"
            onClick={() => navigate(-1)}
          />
          <form onSubmit={onSubmit} className="space-y-6">
            {showAlert && <Alert />}
            <h1 className="text-3xl font-bold text-purple-900">
              {values.isMember ? "Login" : "Register"}
            </h1>

            {!values.isMember && (
              <>
                <UnderlineInput
                  handleChange={handleChange}
                  placeholder="Enter Fullname"
                  type="text"
                  name="name"
                  placeholderColor="placeholder-black"
                />
                <UnderlineInput
                  handleChange={handleChange}
                  placeholder="Enter Username"
                  type="text"
                  name="username"
                  placeholderColor="placeholder-gray-400"
                />
              </>
            )}

            <UnderlineInput
              handleChange={handleChange}
              placeholder={
                !values.isMember ? "Enter Email" : "Enter Email or Username"
              }
              type={!values.isMember ? "email" : "text"}
              name="email"
              placeholderColor="placeholder-gray-400"
            />

            {!values.isMember && <SingleSelectInput setUser={setUser1} />}

            <UnderlineInput
              handleChange={handleChange}
              placeholder="Enter Password"
              type="password"
              name="password"
              placeholderColor="placeholder-gray-400"
            />

            {!values.isMember && (
              <UnderlineInput
                handleChange={handleChange}
                placeholder="Verify Password"
                type="password"
                name="cpassword"
                placeholderColor="placeholder-gray-400"
              />
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {isLoading ? "Loading..." : "Submit"}
            </button>

            <p className="text-center text-gray-600">
              {values.isMember ? (
                <>
                  Don't have an account?{" "}
                  <span
                    className="text-purple-600 cursor-pointer hover:underline"
                    onClick={() => setValues({ ...values, isMember: false })}
                  >
                    Register
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span
                    className="text-purple-600 cursor-pointer hover:underline"
                    onClick={() => setValues({ ...values, isMember: true })}
                  >
                    Login
                  </span>
                </>
              )}
            </p>

            {values.isMember && (
              <p
                className="text-center text-purple-600 cursor-pointer hover:underline"
                onClick={() => navigate("/resetpassword")}
              >
                Forgot password?
              </p>
            )}
          </form>
        </div>

        {/* Right Side - Image (Hidden on Mobile) */}
        <div className="hidden md:flex w-full md:w-1/2 bg-purple-100 flex-col items-center justify-center p-8">
          <img src={loginImage} alt="Login" className="w-64 h-64 mb-6" />
          <h4 className="text-2xl font-bold text-purple-900 text-center">
            {values.isMember ? "Login To" : "Create Your"} Next Skill
          </h4>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
