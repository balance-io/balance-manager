import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import caret from '../assets/caret.svg';
import { fonts, colors, shadows, responsive } from '../styles';

const StyledWrapper = styled.div`
  width: 100%;
  z-index: 2;
  position: relative;
  -webkit-box-shadow: ${shadows.medium};
  box-shadow: ${shadows.medium};
`;

const StyledCaret = styled.img`
  position: absolute;
  right: 7px;
  top: calc(50% - 7px);
  width: 14px;
  height: 14px;
  mask: url(${caret}) center no-repeat;
  mask-size: 90%;
  background-color: rgba(${colors.white}, 0.8);
`;

const StyledIcon = styled.div`
  height: 15px;
  width: 15px;
  mask: ${({ icon }) => (icon ? `url(${icon}) center no-repeat` : 'none')};
  mask-size: 60%;
  background-color: rgba(${colors.white}, 0.8);
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
  border: 1px solid rgba(${colors.white}, 0.1);
  border-radius: ${({ show }) => (show ? '6px 6px 0 0' : '6px')};
  & ${StyledCaret} {
    opacity: ${({ noOptions }) => (noOptions ? 0 : 1)};
  }
`;

const StyledDropdown = styled(StyledRow)`
  position: absolute;
  background: rgb(${colors.white});
  color: rgb(${colors.grey});
  border-radius: 0 0 6px 6px;
  border: 1px solid rgba(${colors.white});
  width: 100%;
  top: 100%;
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  pointer-events: ${({ show }) => (show ? 'auto' : 'none')};
  -webkit-box-shadow: ${shadows.medium};
  box-shadow: ${shadows.medium};
  & > div {
    border-top: 1px solid rgba(${colors.lightGrey}, 0.7);
  }
  & ${StyledIcon} {
    background-color: rgb(${colors.grey});
  }
`;

class Dropdown extends Component {
  state = {
    selected: this.props.options[Object.keys(this.props.options)[0]].value,
    showDropdown: false
  };
  onChangeSelected = selected => {
    this.setState({ showDropdown: false, selected });
    this.props.onChange(selected);
  };
  toggleDropdown = () => this.setState({ showDropdown: !this.state.showDropdown });
  render() {
    const { options, ...props } = this.props;
    return (
      <StyledWrapper {...props}>
        <StyledSelected
          show={this.state.showDropdown}
          noOptions={Object.keys(options).length < 2}
          onClick={this.toggleDropdown}
        >
          <div>
            <StyledIcon icon={options[this.state.selected].icon} />
            <p>{options[this.state.selected].value}</p>
          </div>
          <StyledCaret />
        </StyledSelected>
        <StyledDropdown show={this.state.showDropdown}>
          {Object.keys(options)
            .filter(key => key !== this.state.selected)
            .map(key => (
              <div
                key={options[key].value}
                onClick={() => this.onChangeSelected(options[key].value)}
              >
                <StyledIcon icon={options[key].icon} />
                <p>{options[key].value}</p>
              </div>
            ))}
        </StyledDropdown>
      </StyledWrapper>
    );
  }
}

Dropdown.propTypes = {
  options: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default Dropdown;
