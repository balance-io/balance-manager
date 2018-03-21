import React from 'react';
import styled from 'styled-components';
import assetIcons from '../cryptocurrency-icons';

const StyledPreload = styled.div`
  position: absolute;
  opacity: 0;
  visibility: hidden;
  transform: translate3d(-10000px, -10000px, 0);
  pointer-events: none;
  z-index: -1;
`;

const IconPreload = () => (
  <StyledPreload>
    {Object.keys(assetIcons).map(key => <img key={key} src={assetIcons[key]} alt={key} />)}
  </StyledPreload>
);

export default IconPreload;
