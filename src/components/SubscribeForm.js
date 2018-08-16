import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import jsonp from 'jsonp';
import Button from './Button';
import { isValidEmail, lang } from 'balance-common';
import { fonts, colors, transitions } from '../styles';

const SForm = styled.form`
  position: relative;
  float: right;
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  & input {
    outline: none;
    margin: 0;
    font-size: ${fonts.size.medium} !important;
    font-weight: ${fonts.weight.medium};
    padding: 11px 14px 14px 14px;
    width: 268px;
    border-radius: 8px;
    background: rgb(${colors.white});
    color: rgb(${colors.ledger});
    border: none;
    border-style: none;
    box-shadow: 0 5px 10px 0 rgba(59, 59, 92, 0.08),
      0 0 1px 0 rgba(50, 50, 93, 0.02), 0 3px 6px 0 rgba(0, 0, 0, 0.06);
  }
  & input::placeholder {
    color: rgba(161, 162, 169, 0.6);
  }
`;

const StyledSubmit = styled(Button)`
  position: absolute;
  right: 0;
  padding: 0 15px 2px 15px;
  height: 44px;
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  &:disabled {
    opacity: 1;
    background-color: rgba(185, 189, 198, 0.8) !important;
  }
`;

const SMessage = styled.p`
  position: absolute;
  text-align: center;
  padding: 0;
  margin: 5px 0 !important;
  font-size: ${fonts.size.h6};
  transition: ${transitions.base};
  opacity: ${({ show }) => (show ? 0.8 : 0)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  pointer-events: ${({ show }) => (show ? 'auto' : 'none')};
`;

let messageTimeout = null;

class SubscribeForm extends Component {
  state = {
    status: null,
    message: null,
    input: '',
  };
  onChange = ({ target }) => {
    this.setState({ input: target.value });
  };
  onStatusChange = (state, callback) => {
    clearTimeout(messageTimeout);
    this.setState(state);
    if (state.status !== 'sending') {
      messageTimeout = setTimeout(
        () =>
          this.setState({
            status: '',
            message: '',
          }),
        3000,
      );
    }
    if (callback) callback();
  };
  onSubmit = e => {
    const options = this.props.options;
    e.preventDefault();
    if (!isValidEmail(this.state.input)) {
      this.onStatusChange({
        status: 'error',
        message: 'Email is invalid',
      });
      return;
    }
    const url = `//${options.server}.list-manage.com/subscribe/post-json?u=${
      options.userId
    }&id=${options.listId}&ORIGIN=${options.origin}&EMAIL=${encodeURIComponent(
      this.state.input,
    )}`;
    this.onStatusChange(
      {
        status: 'sending',
        message: '',
      },
      () =>
        jsonp(url, { param: 'c' }, (err, data) => {
          let error = null;
          let result = null;
          if (err) {
            this.onStatusChange({
              status: 'error',
            });
          } else if (data.result !== 'success') {
            if (data.msg.includes('already subscribed')) {
              error = { message: 'EMAIL_ALREADY_SUBCRIBED' };
              this.onStatusChange({
                status: 'error',
                message: `Sorry, you've already signed up with this email`,
              });
            } else if (data.msg.includes('too many recent signup requests')) {
              error = { message: 'TOO_MANY_SIGNUP_REQUESTS' };
              this.onStatusChange({
                status: 'error',
                message: `Too many signup requests, please try again later`,
              });
            } else {
              error = { message: 'UNKNOWN_ERROR' };
              this.onStatusChange({
                status: 'error',
              });
            }
          } else {
            result = { email: this.state.input };
            this.onStatusChange({
              status: 'success',
            });
          }
          if (this.props.options.callback)
            this.props.options.callback(error, result);
        }),
    );
  };
  renderMessage = () => {
    if (!this.state.message) {
      switch (this.state.status) {
        case 'error':
          return lang.t('subscribe_form.generic_error');
        case 'success':
          return lang.t('subscribe_form.successful');
        case 'sending':
          return lang.t('subscribe_form.sending');
        default:
          return '';
      }
    }
    return this.state.message;
  };
  render() {
    return (
      <SForm
        {...this.props}
        noValidate
        success={this.state.status === 'success'}
        onSubmit={this.onSubmit}
      >
        <input
          required
          spellCheck={false}
          type="email"
          placeholder={lang.t('input.email_placeholder')}
          value={this.state.input}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onChange={this.onChange}
        />
        <StyledSubmit
          disabled={!isValidEmail(this.state.input)}
          color="blue"
          hoverColor="blueHover"
          activeColor="blueActive"
          type="submit"
        >
          {lang.t('button.notify_me')}
        </StyledSubmit>
        <SMessage
          color={this.state.status === 'error' ? colors.red : colors.white}
          show={this.state.status}
        >
          {this.renderMessage()}
        </SMessage>
      </SForm>
    );
  }
}

SubscribeForm.propTypes = {
  options: PropTypes.objectOf(PropTypes.string),
};

SubscribeForm.defaultProps = {
  options: {
    server: 'money.us11',
    userId: 'a3f87e208a9f9896949b4f336',
    listId: '3985713da6',
    origin: '',
  },
};

export default SubscribeForm;
