import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ClickOutside extends Component {
  static propTypes = {
    onClickOutside: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.isTouch = false;
  }

  handleContainerRef = ref => {
    this.containerRef = ref;
  };

  componentDidMount() {
    document.addEventListener('touchend', this.handle, true);
    document.addEventListener('click', this.handle, true);
  }

  componentWillUnmount() {
    document.removeEventListener('touchend', this.handle, true);
    document.removeEventListener('click', this.handle, true);
  }

  handle = event => {
    if (event.type === 'touchend') this.isTouch = true;
    if (event.type === 'click' && this.isTouch) return;
    const { onClickOutside } = this.props;
    const el = this.containerRef;
    if (!el.contains(event.target)) onClickOutside(event);
  };

  render() {
    const { children, onClickOutside, ...props } = this.props;
    return (
      <div {...props} ref={this.handleContainerRef}>
        {children}
      </div>
    );
  }
}
