import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import jsonp from 'jsonp';
import lang from '../languages';
import Button from './Button';
import arrowLeft from '../assets/arrow-left.svg';
import { fonts, colors, responsive, shadows, transitions } from '../styles';

const SFormWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 320px;
  border-radius: 8px;
  box-shadow: ${({ success }) => (success ? `none` : `${shadows.medium}`)};
`;

const SMessage = styled.p`
  position: absolute;
  text-align: center;
  margin-top: 10px;
  font-size: ${fonts.size.h6};
`;

const SSuccess = styled.p`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${fonts.weight.medium};
  transition: ${transitions.base};
`;

const StyledSubmit = styled(Button)`
  position: absolute;
  margin: 0;
  top: calc(50% - 15px);
  right: 8px;
}`;

const SForm = styled.form`
  & input {
    outline: none;
    margin: 0;
    font-size: ${fonts.size.large};
    padding: 12px;
    width: 100%;
    border-radius: 4px;
    background: rgb(${colors.white});
    color: rgb(${colors.dark});
    border: none;
    border-style: none;
    transition: ${transitions.short};
    opacity: ${({ success }) => (success ? '0' : '1')};
    pointer-events: ${({ success }) => (success ? 'none' : 'auto')};
    visibility: ${({ success }) => (success ? 'hidden' : 'visible')};
    @media screen and (${responsive.sm.max}) {
      width: 100%;
    }
  }
  & input::placeholder {
    color: rgba(${colors.dark}, 0.5);
  }
  & ${SSuccess} {
    opacity: ${({ success }) => (success ? '1' : '0')};
    pointer-events: ${({ success }) => (success ? 'auto' : 'none')};
    visibility: ${({ success }) => (success ? 'visible' : 'hidden')};
  }
`;

class SubscribeForm extends Component {
  state = {
    status: null,
    message: null,
    input: ''
  };
  onSubmit = e => {
    const options = this.props.options;
    e.preventDefault();
    if (!this.state.input || this.state.input.length < 5 || this.state.input.indexOf('@') === -1) {
      this.setState({
        status: 'error'
      });
      return;
    }
    const url = `//${options.server}.list-manage.com/subscribe/post-json?u=${options.userId}&id=${
      options.listId
    }&ORIGIN=${options.origin}&EMAIL=${encodeURIComponent(this.state.input)}`;
    this.setState(
      {
        status: 'sending',
        message: null
      },
      () =>
        jsonp(url, { param: 'c' }, (err, data) => {
          let error = null;
          let result = null;
          if (err) {
            this.setState({
              status: 'error'
            });
          } else if (data.result !== 'success') {
            if (data.msg.includes('already subscribed')) {
              error = { message: 'EMAIL_ALREADY_SUBSCRIBED' };
              this.setState({
                status: 'error',
                message: lang.t('subscribe_form.email_already_subscribed')
              });
            } else if (data.msg.includes('too many recent signup requests')) {
              error = { message: 'TOO_MANY_SIGNUP_REQUESTS' };
              this.setState({
                status: 'error',
                message: lang.t('subscribe_form.email_already_subscribed')
              });
            } else {
              error = { message: 'UNKNOWN_ERROR' };
              this.setState({
                status: 'error'
              });
            }
          } else {
            result = { email: this.state.input };
            this.setState({
              status: 'success'
            });
          }
          this.props.callback(error, result);
        })
    );
  };
  getEmailClient = () => this.state.input.match(/@(\w|.)+/gi)[0].replace('@', '');
  render() {
    return (
      <SFormWrapper success={this.state.status === 'success'}>
        <SForm
          success={this.state.status === 'success'}
          onSubmit={this.onSubmit}
          method="POST"
          noValidate
        >
          {this.state.status === 'success' && (
            <SSuccess>
              <a href={`https://${this.getEmailClient()}`} target="_blank">
                {lang.t('subscribe_form.successful')}
              </a>
            </SSuccess>
          )}
          <input
            value={this.state.input}
            onChange={e => this.setState({ status: null, input: e.target.value })}
            type="email"
            required
            placeholder={lang.t('input.email_placeholder')}
          />
          {this.state.status !== 'success' && (
            <StyledSubmit color="blue" icon={arrowLeft} type="submit">
              {lang.t('button.notify_me')}
            </StyledSubmit>
          )}
          {this.state.status === 'sending' && (
            <SMessage color={colors.white}>{lang.t('subscribe_form.sending')}</SMessage>
          )}
          {this.state.status === 'error' && (
            <SMessage color={colors.red}>
              {this.state.message ? this.state.message : lang.t('subscribe_form.generic_error')}
            </SMessage>
          )}
        </SForm>
      </SFormWrapper>
    );
  }
}

SubscribeForm.propTypes = {
  options: PropTypes.objectOf(PropTypes.string),
  callback: PropTypes.func
};

SubscribeForm.defaultProps = {
  options: {
    server: 'money.us11',
    userId: 'a3f87e208a9f9896949b4f336',
    listId: '3985713da6',
    origin: ''
  },
  callback: () => {}
};

export default SubscribeForm;
