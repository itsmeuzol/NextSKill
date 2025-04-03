import React from "react";
import Wrapper from "../wrappers/Logo";

const Logo = () => {
  return (
    <Wrapper>
      <div className="logo-container">
        <div className="logo">
          <span className="circle-border">N S</span>
        </div>
        <span className="logo-name">Next Skill</span>
      </div>
    </Wrapper>
  );
};

export default Logo;
