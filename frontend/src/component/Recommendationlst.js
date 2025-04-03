import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Recommendation from "./Recommendation";
import { useAppContext } from "../context/appContext";

const Recommendationlst = () => {
  const { token } = useAppContext();
  const loadRef = useRef(true);
  const [lst, setLst] = useState([]);
  const [loading, setLoading] = useState(true);

  const getcomments = async () => {
    try {
      const response = await axios.get(`/api/v1/profile/userrandom`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("API Response:", response.data); // Log the full response
      if (Array.isArray(response.data.user)) {
        setLst(response.data.user); // Ensure `user` is an array
      } else {
        console.error("Response 'user' is not an array.");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false); // Stop loading on error as well
    }
  };

  useEffect(() => {
    if (loadRef.current === true) {
      getcomments().catch((error) => {
        console.error("Error during getcomments:", error);
      });
    }
    return () => {
      loadRef.current = false;
    };
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!lst || lst.length === 0) {
    return <div>No recommendations available.</div>; // Show this if the list is empty or undefined
  }

  return (
    <div className="users">
      {lst.map((item) => {
        return <Recommendation item={item} key={item._id} />;
      })}
    </div>
  );
};

export default Recommendationlst;
