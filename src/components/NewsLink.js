import React, { Component } from 'react';
import styled from 'styled-components';
const moment = require('moment');

const StyledNewsLink = styled.a`
  padding: 10px;
  display: block;

  &:hover,
  &:focus {
    transform: translate(1px, 1px);
  }

  & img {
    display: block;
    margin-right: 5px;
    height: 30px;
  }

  & h4 {
    font-weight: 300;
    font-size: 1rem;
  }
`;

const StyledHeaderContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const StyledDate = styled.p`
  justify-content: flex-start !important;
  font-size: 0.7rem !important;
  opacity: 0.9;
  margin-bottom: 10px;
`;

class NewsLink extends Component {
  render() {
    const { post } = this.props;

    return (
      <StyledNewsLink href={post.url}>
        <StyledHeaderContainer>
          <img src={`//${post.source.toLowerCase()}.com/favicon.ico`} alt="" />
          <h4>{post.title}</h4>
        </StyledHeaderContainer>
        <StyledDate>{moment(post.data).format('YYYY-MM-DD hh:mm')}</StyledDate>
        <p>{post.summary}</p>
      </StyledNewsLink>
    );
  }
}

export default NewsLink;
