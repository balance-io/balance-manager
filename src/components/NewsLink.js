import React, { Component } from 'react';
import styled from 'styled-components';
import { fonts } from '../styles';
import { format } from 'date-fns';

const StyledNewsLink = styled.a`
  display: block;
  width: 100%;

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
    font-weight: ${fonts.weight.normal}
    font-size: ${fonts.size.medium};
    line-height: ${fonts.size.medium};
    & small {
      font-size: ${fonts.size.tiny};
      font-weight: ${fonts.weight.normal}
    }
  }
`;

const StyledHeaderContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

class NewsLink extends Component {
  render() {
    const { post } = this.props;
    return (
      <StyledNewsLink href={post.url}>
        <StyledHeaderContainer>
          {post.source ? (
            <img
              src={`//${post.source.toLowerCase()}.com/favicon.ico`}
              alt=""
            />
          ) : (
            ''
          )}
          <h4>
            {post.title} <br />
            <small>{format(post.date, 'YYYY-MM-DD hh:mm')}</small>
          </h4>
        </StyledHeaderContainer>
      </StyledNewsLink>
    );
  }
}

export default NewsLink;
