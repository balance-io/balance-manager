import React from 'react';
import styled from 'styled-components';

const StyledBackgroundFixed = styled.div`
  position: fixed;
  top: 0;
  left: 0;
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
  position: fixed;
  bottom: 0;
  left: 0;
  width: 150px;
  height: 225px;
  & img {
    width: 100%;
  }
`;

const Background = () => (
  <StyledBackgroundFixed>
    <StyledBackgroundRelative>
      <StyledBackgroundBlue />
    </StyledBackgroundRelative>
  </StyledBackgroundFixed>
);

export default Background;
