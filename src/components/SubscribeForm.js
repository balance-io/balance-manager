import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import jsonp from 'jsonp';
import lang from '../languages';
import Button from './Button';
import { fonts, colors, responsive, transitions } from '../styles';

const SFormWrapper = styled.div`
  position: relative;
  float: right;
  margin: 29px 29px 0 0;
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
`;

const SMessage = styled.p`
  position: absolute;
  text-align: center;
  margin-top: 10px;
  font-size: ${fonts.size.h6};
`;

const SSuccess = styled.p`
  position: absolute;
  top: -60px;
  right: -20px;
  padding: 11px 15px 0 15px;
  height: 44px;
  background: #d9dce3;
  color: #fff !important;
  border-radius: 8px;
  font-size: ${fonts.size.medium} !important;
  font-weight: ${fonts.weight.semibold} !important;
  transition: ${transitions.base};
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

const SForm = styled.form`
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
    box-shadow: 0 5px 10px 0 rgba(59, 59, 92, 0.08), 0 0 1px 0 rgba(50, 50, 93, 0.02),
      0 3px 6px 0 rgba(0, 0, 0, 0.06);
    transition: ${transitions.short};
    opacity: ${({ success }) => (success ? '0' : '1')};
    pointer-events: ${({ success }) => (success ? 'none' : 'auto')};
    visibility: ${({ success }) => (success ? 'hidden' : 'visible')};
    @media screen and (${responsive.sm.max}) {
      width: 100%;
    }
  }
  & input::placeholder {
    color: rgba(161, 162, 169, 0.6);
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
            <StyledSubmit
              disabled={!this.state.input}
              color="blue"
              hoverColor="blueHover"
              activeColor="blueActive"
              type="submit"
            >
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
