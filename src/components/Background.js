import React from 'react';
import styled from 'styled-components';
import trianglesBlue from '../assets/triangles-blue.png';

const StyledBackgroundFixed = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: -99999;
`;

const StyledBackgroundRelative = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const StyledBackgroundBlue = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 2;
  width: 150px;
  transform: rotate(180deg);
  & img {
    width: 100%;
  }
`;

const Background = () => (
  <StyledBackgroundFixed>
    <StyledBackgroundRelative>
      <StyledBackgroundBlue>
        <img src={trianglesBlue} alt="background blue" />
      </StyledBackgroundBlue>
    </StyledBackgroundRelative>
  </StyledBackgroundFixed>
);

export default Background;
