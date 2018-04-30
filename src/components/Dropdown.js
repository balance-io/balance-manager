import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import caret from '../assets/caret.svg';
import circle from '../assets/circle.svg';
import { fonts, colors, shadows, responsive, transitions } from '../styles';

const StyledWrapper = styled.div`
  width: 100%;
  z-index: 2;
  position: relative;
  box-shadow: none;
`;

const StyledCaret = styled.img`
  position: absolute;
  cursor: pointer;
  right: 7px;
  top: calc(50% - 7px);
  width: 14px;
  height: 14px;
  mask: url(${caret}) center no-repeat;
  mask-size: 90%;
  background-color: ${({ dark }) => (dark ? `rgb(${colors.dark})` : `rgba(${colors.white}, 0.8)`)};
`;

const StyledIcon = styled.div`
  height: 15px;
  width: 15px;
  mask: url(${circle}) center no-repeat;
  mask-size: 60%;
  display: ${({ iconColor }) => (iconColor ? 'block' : 'none')};
  background-color: ${({ iconColor }) => (iconColor ? `rgb(${colors[iconColor]})` : 'transparent')};
`;

const StyledRow = styled.div`
  min-width: 70px;
  border-radius: 6px;
  position: relative;
  color: rgb(${colors.dark});
  font-size: ${fonts.size.small};
  font-weight: ${fonts.weight.medium};
  text-align: center;
  outline: none;
  & > div {
    cursor: ${({ noOptions }) => (noOptions ? 'auto' : 'pointer')};
    padding: ${({ noOptions }) => (noOptions ? `8px` : `8px 26px 8px 8px`)};
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
  background: transparent;
  color: ${({ dark }) => (dark ? `rgb(${colors.dark})` : `rgba(${colors.white}, 0.8)`)};
  border-radius: 6px;
  & ${StyledCaret} {
    opacity: ${({ noOptions }) => (noOptions ? 0 : 1)};
  }
`;

const StyledDropdown = styled(StyledRow)`
  position: absolute;
  background: rgb(${colors.white});
  color: rgb(${colors.darkGrey});
  border-radius: 6px;
  width: 100%;
  top: 100%;
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  pointer-events: ${({ show }) => (show ? 'auto' : 'none')};
  -webkit-box-shadow: ${shadows.medium};
  box-shadow: ${shadows.medium};

  max-height: 280px;
  overflow: scroll;

  & > div {
    transition: ${transitions.base};
    border-top: 1px solid rgba(${colors.lightGrey}, 0.7);

    padding: 6px;
    width: auto;
    text-align: center;
    align-items: center;
    justify-content: center;

    &:hover {
      opacity: 0.6;
    }
  }
  & ${StyledIcon} {
    background-color: ${({ icon }) => (icon ? `rgb(${colors.darkGrey})` : 'none')};
  }
`;

class Dropdown extends Component {
  state = {
    showDropdown: false
  };
  onChangeSelected = selected => {
    this.setState({ showDropdown: false });
    if (this.props.onChange) {
      console.log('onChangeSelected', selected);
      console.log('this.props.onChange', this.props.onChange);
      this.props.onChange(selected);
    }
  };
  toggleDropdown = () => {
    if (this.props.onChange) {
      this.setState({ showDropdown: !this.state.showDropdown });
    }
  };
  render() {
    const { options, dark, iconColor, selected, displayKey, onChange, ...props } = this.props;
    const _selected = selected || options[Object.keys(options)[0]][displayKey];
    if (!options[_selected]) return null;
    return (
      <StyledWrapper {...props}>
        <StyledSelected
          dark={dark}
          show={this.state.showDropdown}
          noOptions={!onChange || Object.keys(options).length < 2}
          onClick={this.toggleDropdown}
        >
          <div>
            <StyledIcon iconColor={options[_selected].color || iconColor} />
            <p>{options[_selected][displayKey]}</p>
          </div>
          <StyledCaret dark={dark} />
        </StyledSelected>
        <StyledDropdown
          show={this.state.showDropdown}
          noOptions={!onChange || Object.keys(options).length < 2}
        >
          {onChange &&
            Object.keys(options)
              .filter(key => key !== _selected)
              .map(key => (
                <div key={options[key][displayKey]} onClick={() => this.onChangeSelected(key)}>
                  {/* <StyledIcon iconColor={iconColor} icon={options[key].icon} /> */}
                  <p>{options[key][displayKey]}</p>
                </div>
              ))}
        </StyledDropdown>
      </StyledWrapper>
    );
  }
}

Dropdown.propTypes = {
  options: PropTypes.object.isRequired,
  displayKey: PropTypes.string.isRequired,
  dark: PropTypes.bool,
  selected: PropTypes.string,
  onChange: PropTypes.func,
  iconColor: PropTypes.string
};

Dropdown.defaultProps = {
  dark: false,
  selected: null,
  onChange: null,
  iconColor: ''
};

export default Dropdown;
