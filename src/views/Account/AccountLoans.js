import React, { Component } from 'react';
import styled from 'styled-components';

import UnFlexedCard from '../../components/UnFlexedCard';
import Button from '../../components/Button';

import { colors, shadows, responsive, transitions } from '../../styles';

import ethBadge from '../../assets/eth-badge.svg';
import daiBadge from '../../assets/dai-badge.svg';
import arrowReceived from '../../assets/circle-arrow.svg';
import dharmaProtocol from '../../assets/powered-by-dharma.png';

const StyledCard = styled(UnFlexedCard)`
  border-radius: 0px;
  box-shadow: none;

  &:first-of-type {
    padding: 15px;
  }
`;

const MenuDiv = styled.div`
  width: 100%;
  background-color: #ebebeb;
  border-radius: 7.2px;
  padding: 10px 0px 10px 10px;
  transition: ${transitions.base};
  display: flex;
  flex-direction: column;
  cursor: pointer;
  color: #2d2d31;
  font-size: 14.6px;
  margin-top: 10px;
  margin-right: 15px;

  &:last-of-type {
    margin-right: 0px;
  }

  @media screen and (${responsive.md.max}) {
    flex-basis: 100%;
  }

  svg {
    opacity: 0.6;
  }

  &.active {
    background-color: #4f70d2;
    color: #fff;
    transition: ${transitions.base};
    box-shadow: ${shadows.medium};

    small {
      color: #fff;
    }

    svg {
      opacity: 1;
    }
  }

  small {
    font-size: 10px;
    margin-left: 28px;
    color: #6b6b6b;
    transition: ${transitions.base};
  }
`;

const MenuFlex = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const StyledFlex = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;

  svg {
    width: 22px;
    height: 20px;
    margin-right: 5px;
  }
`;

const BorrowDiv = styled.div`
  width: 100%;
  background-color: rgb(${colors.lightGrey});
  border: 1px solid rgb(${colors.borderGrey});
  padding: 15px;
  border-radius: 7.6px;
  margin-top: 30px;
  display: flex;
  flex-direction: row;
  align-items: center;

  h5 {
    font-weight: 500;
  }

  img {
    margin-right: 5px;
  }

  .badges {
    flex-basis: 10%;
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-basis: 75%;
  }

  .controls {
    flex-basis: 15%;
    display: flex;
    justify-content: flex-end;

    button {
      font-size: 14px;
      font-weight: 400;
      padding: 8px 10px;

      img {
        vertical-align: middle;
        margin-right: 8px;
      }
    }
  }

  p {
    font-size: 12px;
    margin-top: 8px;
  }
`;

const Footer = styled.div`
  width: 100%;
  border-top: 1px solid rgb(${colors.borderGrey});
  padding: 0px 15px;
  display: flex;
  justify-content: space-between;

  h6 {
    font-weight: 400;
  }

  p {
    font-size: 12px;
    font-weight: 400;
    margin-top: 5px;
  }

  div:first-child {
    padding: 15px;
    border-right: 1px solid rgb(${colors.borderGrey});
  }

  div {
    padding-left: 10px;
  }

  .dharma-protocol {
    margin-top: 15px;
  }

  a {
    color: rgb(${colors.blue});
  }
`;

class AccountLoans extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'COLLATERALIZED_LOANS',
    };
  }

  setTab = tab => {
    this.setState({
      currentTab: tab,
    });
  };

  render() {
    return (
      <div className="account-loans">
        <StyledCard minHeight={280} className="content-section">
          <MenuFlex>
            <MenuDiv
              className={
                this.state.currentTab === 'COLLATERALIZED_LOANS' && 'active'
              }
              onClick={() => this.setTab('COLLATERALIZED_LOANS')}
            >
              <StyledFlex>
                <svg
                  width="22px"
                  height="20px"
                  viewBox="0 0 22 20"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g
                    id="Page-1"
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <g
                      id="loan-overview"
                      transform="translate(-84.000000, -220.000000)"
                      fill={
                        this.state.currentTab === 'COLLATERALIZED_LOANS'
                          ? '#FFFFFF'
                          : '#6b6b6b'
                      }
                      fillRule="nonzero"
                    >
                      <path
                        d="M84.1458922,232.089705 L86.9615498,226.099734 C86.9862197,226.045432 86.9843631,225.983617 86.9564736,225.930726 C86.928584,225.877835 86.8774882,225.839229 86.8167731,225.825173 C86.1679469,225.679164 85.5681893,225.381696 85.0723448,224.959972 L84.9570988,224.846492 C84.8784582,224.770825 84.8348985,224.668681 84.8360336,224.562604 C84.8371687,224.456527 84.8829052,224.355237 84.9631488,224.28109 L85.5681479,223.721089 C85.7354101,223.566475 86.0034568,223.568962 86.1674779,223.726649 L86.2751508,223.83293 C86.8304513,224.236628 87.5208686,224.437906 88.2202019,224.399971 C88.8830528,224.355524 89.5361403,224.224104 90.1606839,224.00949 C91.2634181,223.672044 92.3975831,223.434468 93.5478753,223.299969 C93.6942532,223.285007 93.810279,223.176405 93.8275711,223.038168 C93.934305,222.134108 94.1406162,221.243059 94.4431471,220.379523 C94.5230246,220.15288 94.747346,220 95.0000214,220 C95.2526968,220 95.4770182,220.15288 95.5568956,220.379523 C95.8594622,221.243046 96.0657465,222.134101 96.1723871,223.038168 C96.189724,223.176384 96.3057264,223.284965 96.4520828,223.299969 C97.6023806,223.43452 98.7365457,223.672149 99.8392743,224.00965 C100.463829,224.224201 101.116915,224.355567 101.779756,224.399971 C102.479039,224.437921 103.169412,224.236671 103.72468,223.83301 L103.832438,223.726729 C103.99642,223.569029 104.264459,223.566542 104.431683,223.721169 L105.036682,224.28117 C105.116926,224.355317 105.162663,224.456607 105.163798,224.562684 C105.164933,224.668761 105.121373,224.770905 105.042732,224.846572 L104.927613,224.960052 C104.431652,225.381742 103.831819,225.67919 103.182931,225.825213 C103.122231,225.839288 103.071157,225.877902 103.043285,225.93079 C103.015413,225.983679 103.013568,226.045483 103.038239,226.099774 L105.853939,232.089745 C105.950185,232.294295 105.99994,232.515669 105.999985,232.739546 L105.999985,233.287547 C106.001762,233.568543 105.846042,233.829422 105.590701,233.973229 C103.475048,235.075366 100.909548,235.075366 98.793895,233.973229 C98.5386059,233.829451 98.3828945,233.568646 98.3846109,233.287707 L98.3846109,232.739706 C98.3845912,232.515823 98.4343038,232.294431 98.5305299,232.089865 L101.287211,226.225534 C101.314081,226.167438 101.310222,226.100737 101.276809,226.045759 C101.243396,225.990781 101.184388,225.95404 101.117769,225.946734 C100.518871,225.855214 99.9284191,225.719751 99.3517634,225.541573 C98.4251045,225.260692 97.4750716,225.054095 96.5117366,224.923972 C96.4507456,224.91665 96.3893524,224.93432 96.3430215,224.97253 C96.2966906,225.01074 96.2698385,225.065848 96.2692292,225.123972 L96.2692292,235.199991 C96.2692292,236.967305 97.7845711,238.399997 99.6538399,238.399997 C99.8874985,238.399997 100.076916,238.579083 100.076916,238.799998 L100.076916,239.599999 C100.076916,239.820914 99.8874985,240 99.6538399,240 L90.3461605,240 C90.1125019,240 89.9230842,239.820914 89.9230842,239.599999 L89.9230842,238.799998 C89.9230842,238.579083 90.1125019,238.399997 90.3461605,238.399997 C92.2154294,238.399997 93.7307712,236.967305 93.7307712,235.199991 L93.7307712,225.123972 C93.7300781,225.065897 93.7031899,225.010864 93.6568694,224.972716 C93.6105489,224.934569 93.5492041,224.916935 93.4882639,224.924252 C92.5249644,225.05426 91.5749589,225.26075 90.6483216,225.541533 C90.071659,225.719659 89.4812077,225.855082 88.8823164,225.946574 C88.8156743,225.953846 88.7566307,225.990573 88.7231895,226.045556 C88.6897482,226.100539 88.6858737,226.16726 88.7127474,226.225374 L91.4695551,232.089705 C91.5657365,232.294281 91.6154195,232.51567 91.6153895,232.739546 L91.6153895,233.287547 C91.6172002,233.568561 91.4614525,233.829462 91.2060632,233.973229 C90.1709362,234.529031 88.9980144,234.814382 87.8077025,234.79999 C86.6173819,234.814411 85.4444393,234.529116 84.4092572,233.973389 C84.1539194,233.829584 83.9982129,233.568699 84.0000155,233.287707 L84.0000155,232.739706 C83.9999751,232.515773 84.0496731,232.294328 84.1458922,232.089705 Z M87.7019334,228.464658 L86.1577048,231.749304 C86.0904458,231.892457 86.1043401,232.05806 86.194629,232.189397 C86.2849179,232.320733 86.4393461,232.399976 86.6050234,232.399986 L89.0103816,232.399986 C89.1760852,232.400039 89.3305617,232.320809 89.4208649,232.189451 C89.5111681,232.058094 89.5250303,231.892454 89.4577002,231.749304 L87.9134716,228.464658 C87.8948347,228.425205 87.8534045,228.399799 87.8077025,228.399799 C87.7620005,228.399799 87.7205703,228.425205 87.7019334,228.464658 Z M100.989577,232.399986 L103.395019,232.399986 C103.560698,232.399984 103.715129,232.320739 103.805413,232.189398 C103.895696,232.058057 103.909575,231.89245 103.842296,231.749304 L102.298067,228.464658 C102.279457,228.425175 102.238018,228.399741 102.192298,228.399741 C102.146578,228.399741 102.105139,228.425175 102.086529,228.464658 L100.5423,231.749304 C100.475021,231.89245 100.4889,232.058057 100.579183,232.189398 C100.669467,232.320739 100.823898,232.399984 100.989577,232.399986 Z"
                        id="Shape"
                      />
                    </g>
                  </g>
                </svg>
                {'Collateralized Loans'}
              </StyledFlex>

              <small>Lock up money to borrow some money</small>
            </MenuDiv>

            <MenuDiv
              className={
                this.state.currentTab === 'CREDIT_SCORE_LOANS' && 'active'
              }
              onClick={() => this.setTab('CREDIT_SCORE_LOANS')}
            >
              <StyledFlex>
                <svg
                  width="18px"
                  height="18px"
                  viewBox="0 0 18 18"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g
                    id="Page-1"
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <g
                      id="loan-options"
                      transform="translate(-312.000000, -223.000000)"
                      fill={
                        this.state.currentTab === 'CREDIT_SCORE_LOANS'
                          ? '#FFF'
                          : '#6B6B6B'
                      }
                      fillRule="nonzero"
                    >
                      <g
                        id="circlecheckmark"
                        transform="translate(312.000000, 223.000000)"
                      >
                        <path
                          d="M8.82,17.6402939 C3.95087731,17.6402939 0.00367346939,13.69309 0.00367346939,8.82396735 C0.00367346939,3.95484465 3.95087731,0.00764081633 8.82,0.00764081633 C13.6891227,0.00764081633 17.6363265,3.95484465 17.6363265,8.82396735 C17.6363265,13.69309 13.6891227,17.6402939 8.82,17.6402939 Z M13.742449,4.62937959 C13.5882987,4.47684526 13.3746649,4.40015545 13.158697,4.41982559 C12.9427292,4.43949574 12.7464652,4.55351864 12.6224082,4.73139184 L7.90427755,11.4869388 L5.74633469,8.3971102 C5.62227763,8.21923701 5.42601371,8.1052141 5.21004585,8.08554396 C4.994078,8.06587381 4.78044415,8.14256362 4.62629388,8.29509796 C4.37071809,8.56372945 4.34422938,8.97684186 4.56340408,9.27591429 L6.99685714,12.7602 C7.20400391,13.0565265 7.54278159,13.2330505 7.90433265,13.2330505 C8.26588371,13.2330505 8.6046614,13.0565265 8.81180816,12.7602 L13.8054122,5.61001224 C14.0244485,5.31095397 13.9979322,4.89797049 13.742449,4.62937959 Z"
                          id="Shape"
                        />
                      </g>
                    </g>
                  </g>
                </svg>
                {'Credit Score Loans'}
              </StyledFlex>

              <small>Buidl and stake your credit score</small>
            </MenuDiv>

            <MenuDiv
              className={
                this.state.currentTab === 'INCOME_STREAM_LOANS' && 'active'
              }
              onClick={() => this.setTab('INCOME_STREAM_LOANS')}
            >
              <StyledFlex>
                <svg
                  width="17px"
                  height="18px"
                  viewBox="0 0 17 18"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g
                    id="Page-1"
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <g
                      id="loan-options"
                      transform="translate(-510.000000, -223.000000)"
                      fill={
                        this.state.currentTab === 'INCOME_STREAM_LOANS'
                          ? '#FFF'
                          : '#6B6B6B'
                      }
                      fillRule="nonzero"
                    >
                      <g
                        id="database"
                        transform="translate(510.000000, 223.000000)"
                      >
                        <path
                          d="M8.5,18 C3.80562,18 7.30369405e-16,16.3516091 7.30369405e-16,14.3181818 L7.30369405e-16,13.6935818 C-0.0011337059,13.4641541 0.134858571,13.2545351 0.349524156,13.154824 C0.564189741,13.0551129 0.819286362,13.083073 1.0051675,13.2266864 C2.465935,14.3649 5.28904,15.1363636 8.5,15.1363636 C11.71096,15.1363636 14.5340225,14.3649 15.994875,13.2266864 C16.1807568,13.0830985 16.4358355,13.0551534 16.6504849,13.1548612 C16.8651343,13.2545691 17.0011204,13.4641695 17,13.6935818 L17,14.3181818 C17,16.3516091 13.1944225,18 8.5,18 Z M8.5,13.5 C3.80562,13.5 7.30445638e-16,11.8516091 7.30445638e-16,9.81818182 L7.30445638e-16,9.19358182 C-0.0011337059,8.96415413 0.134858571,8.75453514 0.349524156,8.65482401 C0.564189741,8.55511288 0.819286362,8.58307297 1.0051675,8.72668636 C2.465935,9.8649 5.28904,10.6363636 8.5,10.6363636 C11.71096,10.6363636 14.5340225,9.8649 15.994875,8.72668636 C16.1807568,8.58309848 16.4358355,8.55515342 16.6504849,8.65486125 C16.8651343,8.75456907 17.0011204,8.96416953 17,9.19358182 L17,9.81818182 C17,11.8516091 13.1944225,13.5 8.5,13.5 Z M8.5,9 C3.80562,9 1.06581563e-15,7.35160909 1.06581563e-15,5.31818182 L1.06581563e-15,3.68181818 C1.06581563e-15,1.64839091 3.80562,0 8.5,0 C13.19438,0 17,1.64839091 17,3.68181818 L17,5.31818182 C17,7.35160909 13.1944225,9 8.5,9 Z"
                          id="Shape"
                        />
                      </g>
                    </g>
                  </g>
                </svg>
                {'Income Stream Loans'}
              </StyledFlex>

              <small>Take a loan out against your income</small>
            </MenuDiv>

            <MenuDiv
              className={
                this.state.currentTab === 'UNIQUE_TOKEN_LOANS' && 'active'
              }
              onClick={() => this.setTab('UNIQUE_TOKEN_LOANS')}
            >
              <StyledFlex>
                <svg
                  width="19px"
                  height="19px"
                  viewBox="0 0 19 19"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g
                    id="Page-1"
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <g
                      id="loan-options"
                      transform="translate(-728.000000, -222.000000)"
                      fill={
                        this.state.currentTab === 'UNIQUE_TOKEN_LOANS'
                          ? '#FFF'
                          : '#6B6B6B'
                      }
                      fillRule="nonzero"
                    >
                      <g
                        id="star"
                        transform="translate(728.000000, 222.000000)"
                      >
                        <path
                          d="M13.6698572,11.8305063 L15.5343987,18.0117448 C15.6347985,18.3204855 15.5317386,18.6613988 15.2796199,18.854531 C15.0275012,19.0476632 14.6843477,19.0485659 14.4312956,18.8567625 L9.48990896,14.9776382 L4.55848073,18.8546643 C4.3048058,19.0449731 3.96208731,19.0425553 3.71091076,18.8486849 C3.45973421,18.6548144 3.35777616,18.314009 3.45876041,18.0058461 L5.30980867,11.8394929 L0.30327425,8.09477176 C0.048232826,7.90423577 -0.0605868386,7.56471771 0.0334178145,7.25281795 C0.127422468,6.94091819 0.403017611,6.72708882 0.716852406,6.72255322 L6.884454,6.72255322 L8.80897406,0.522074719 C8.90172937,0.211557657 9.17764572,0 9.48987095,0 C9.80209618,0 10.0780125,0.211557657 10.1707678,0.522074719 L12.0952879,6.72255322 L18.2831864,6.72255322 C18.5971341,6.72710799 18.8727898,6.94110263 18.9666857,7.25316147 C19.0605815,7.5652203 18.9514922,7.90480193 18.6961944,8.09516765 L13.6698572,11.8305063 Z"
                          id="Shape"
                        />
                      </g>
                    </g>
                  </g>
                </svg>
                {'Unique Token Loans'}
              </StyledFlex>

              <small>Pawn your non-fungible tokens</small>
            </MenuDiv>
          </MenuFlex>

          <BorrowDiv>
            <div className="badges">
              <img src={daiBadge} alt="dai to ether loan" />
              <img className="ethBadge" src={ethBadge} alt="borrow dai" />
            </div>

            <div className="content">
              <h5> Borrow Dai by locking up Ether </h5>
              <p>
                {' '}
                Get Dai, the coin that is pegged to the US Dollar by putting
                down some Ether as collateral.{' '}
              </p>
            </div>

            <div className="controls">
              <Button
                color="brightGreen"
                activeColor="brightGreenHover"
                hoverColor="brightGreenHover"
              >
                <img src={arrowReceived} alt="borrow dai" />
                Borrow DAI{' '}
              </Button>
            </div>
          </BorrowDiv>

          <BorrowDiv>
            <div className="badges">
              <img className="ethBadge" src={ethBadge} alt="borrow eth" />
              <img src={daiBadge} alt="borrow eth" />
            </div>

            <div className="content">
              <h5> Borrow Ether by locking up Dai </h5>
              <p>
                {' '}
                Get Ether, the fuel that powers the Ethereum network by putting
                down some Dai as collateral.{' '}
              </p>
            </div>

            <div className="controls">
              <Button
                activeColor="brightGreenHover"
                color="brightGreen"
                hoverColor="brightGreenHover"
              >
                <img src={arrowReceived} alt="borrow eth" />
                Borrow ETH{' '}
              </Button>
            </div>
          </BorrowDiv>
        </StyledCard>

        <StyledCard>
          <Footer>
            <div>
              <h6>How does this work under the hood?</h6>
              <p className="border-right">
                Dharma is an open economic protocol for lending money. When you
                request a loan, it pops up on services like{' '}
                <a href="bloqboard.com">bloqboard.com</a>, which is a place
                where people go to lend money. All of this runs on Ethereum.{' '}
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href="https://dharma.io"
                >
                  Learn more
                </a>
              </p>
            </div>

            <div>
              <img
                className="dharma-protocol"
                src={dharmaProtocol}
                alt="dharma protocol"
              />
            </div>
          </Footer>
        </StyledCard>
      </div>
    );
  }
}

export default AccountLoans;
