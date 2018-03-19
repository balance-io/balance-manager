import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { fonts, colors, responsive } from '../styles';

const StyledWrapper = styled.div`
  width: 100%;
  z-index: 2;
  position: relative;
`;

const StyledIcon = styled.div`
  height: 15px;
  width: 15px;
  mask: ${({ icon }) => (icon ? `url(${icon}) center no-repeat` : 'none')};
  mask-size: 60%;
  background-color: ${({ iconColor }) => `rgb(${colors[iconColor]})`};
`;

const StyledRow = styled.div`
  border-radius: 6px;
  position: relative;
  color: rgba(${colors.white}, 0.8);
  font-size: ${fonts.size.small};
  font-weight: ${fonts.weight.medium};
  text-align: center;
  outline: none;
  & > div {
    padding: 8px;
    background-size: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  & p {
    margin: 0 4px;
  }
  @media screen and (${responsive.xs.max}) {
    & p {
      font-size: ${fonts.size.tiny};
    }
  }
`;

const StyledSelected = styled(StyledRow)`
  outline: none;
  border-radius: 6px;
`;

const Dropdown = ({ options, iconColor, selected, onChange, ...props }) => {
  const _selected = selected || options[Object.keys(options)[0]].value;
  if (!options[_selected]) return null;
  return (
    <StyledWrapper {...props}>
      <StyledSelected>
        <div>
          <StyledIcon iconColor={iconColor} icon={options[_selected].icon} />
          <p>{options[_selected].value}</p>
        </div>
      </StyledSelected>
    </StyledWrapper>
  );
};

Dropdown.propTypes = {
  options: PropTypes.object.isRequired,
  selected: PropTypes.string,
  iconColor: PropTypes.string
};

Dropdown.defaultProps = {
  selected: null,
  iconColor: 'white'
};

export default Dropdown;
