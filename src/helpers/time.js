import BigNumber from 'bignumber.js';
import lang from '../languages';
import timeUnits from '../references/time-units.json';

/**
 * @desc get local time & date string
 * @param  {Number} [timestamp=null]
 * @return {String}
 */
export const getLocalTimeDate = (timestamp = null) => {
  timestamp = Number(timestamp) || Date.now();
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

/**
 * @desc get time string for minimal unit
 * @param {String} [value='']
 * @param {String} [unit='']
 * @param {Boolean} [short=false]
 * @return {String}
 */
export const getTimeString = (value = '', unit = '', short = false) => {
  let _value = BigNumber(`${value}`).toNumber();
  let _unit = '';
  let _unitShort = '';
  if (_value) {
    if (unit === 'miliseconds' || unit === 'ms') {
      if (_value === 1) {
        _unit = lang.t('time.milisecond');
        _unitShort = lang.t('time.ms');
      } else if (
        _value >= timeUnits.ms.second &&
        _value < timeUnits.ms.minute
      ) {
        _value = BigNumber(
          BigNumber(`${_value}`)
            .dividedBy(BigNumber(`${timeUnits.ms.second}`))
            .toFixed(2),
        ).toString();
        if (_value === 1) {
          _unit = lang.t('time.second');
          _unitShort = lang.t('time.sec');
        } else {
          _unit = lang.t('time.seconds');
          _unitShort = lang.t('time.secs');
        }
      } else if (_value >= timeUnits.ms.minute && _value < timeUnits.ms.hour) {
        _value = BigNumber(
          BigNumber(`${_value}`)
            .dividedBy(BigNumber(`${timeUnits.ms.minute}`))
            .toFixed(2),
        ).toString();
        if (_value === 1) {
          _unit = lang.t('time.minute');
          _unitShort = lang.t('time.min');
        } else {
          _unit = lang.t('time.minutes');
          _unitShort = lang.t('time.mins');
        }
      } else if (_value >= timeUnits.ms.hour && _value < timeUnits.ms.day) {
        _value = BigNumber(
          BigNumber(`${_value}`)
            .dividedBy(BigNumber(`${timeUnits.ms.hour}`))
            .toFixed(2),
        ).toString();
        if (_value === 1) {
          _unit = lang.t('time.hour');
          _unitShort = lang.t('time.hr');
        } else {
          _unit = lang.t('time.hours');
          _unitShort = lang.t('time.hrs');
        }
      } else if (_value >= timeUnits.ms.day) {
        _value = BigNumber(
          BigNumber(`${_value}`)
            .dividedBy(BigNumber(`${timeUnits.ms.day}`))
            .toFixed(2),
        ).toString();
        if (_value === 1) {
          _unit = lang.t('time.day');
          _unitShort = lang.t('time.day');
        } else {
          _unit = lang.t('time.days');
          _unitShort = lang.t('time.days');
        }
      } else {
        _unit = lang.t('time.miliseconds');
        _unitShort = lang.t('time.ms');
      }
    } else if (unit === 'seconds' || unit === 'secs') {
      if (_value === 1) {
        _unit = lang.t('time.second');
        _unitShort = lang.t('time.sec');
      } else if (_value < 1) {
        _value = BigNumber(
          BigNumber(`${_value}`)
            .times(BigNumber(`${timeUnits.ms.second}`))
            .toFixed(2),
        ).toString();
        if (_value === 1) {
          _unit = lang.t('time.milisecond');
          _unitShort = lang.t('time.ms');
        } else {
          _unit = lang.t('time.miliseconds');
          _unitShort = lang.t('time.ms');
        }
      } else if (
        _value >= timeUnits.secs.minute &&
        _value < timeUnits.secs.hour
      ) {
        _value = BigNumber(
          BigNumber(`${_value}`)
            .dividedBy(BigNumber(`${timeUnits.secs.minute}`))
            .toFixed(2),
        ).toString();
        if (_value === 1) {
          _unit = lang.t('time.minute');
          _unitShort = lang.t('time.min');
        } else {
          _unit = lang.t('time.minutes');
          _unitShort = lang.t('time.mins');
        }
      } else if (_value >= timeUnits.secs.hour && _value < timeUnits.secs.day) {
        _value = BigNumber(
          BigNumber(`${_value}`)
            .dividedBy(BigNumber(`${timeUnits.secs.hour}`))
            .toFixed(2),
        ).toString();
        if (_value === 1) {
          _unit = lang.t('time.hour');
          _unitShort = lang.t('time.hr');
        } else {
          _unit = lang.t('time.hours');
          _unitShort = lang.t('time.hrs');
        }
      } else if (_value >= timeUnits.secs.day) {
        _value = BigNumber(
          BigNumber(`${_value}`)
            .dividedBy(BigNumber(`timeUnits.secs.day`))
            .toFixed(2),
        ).toString();
        if (_value === 1) {
          _unit = lang.t('time.day');
          _unitShort = lang.t('time.day');
        } else {
          _unit = lang.t('time.days');
          _unitShort = lang.t('time.days');
        }
      } else {
        _unit = lang.t('time.seconds');
        _unitShort = lang.t('time.secs');
      }
    } else if (unit === 'minutes' || unit === 'mins') {
      if (_value === 1) {
        _unit = lang.t('time.minute');
        _unitShort = lang.t('time.min');
      } else if (_value < 1) {
        _value = BigNumber(
          BigNumber(`${_value}`)
            .times(BigNumber(`${timeUnits.secs.minute}`))
            .toFixed(2),
        ).toString();
        if (_value === 1) {
          _unit = lang.t('time.second');
          _unitShort = lang.t('time.sec');
        } else {
          _unit = lang.t('time.seconds');
          _unitShort = lang.t('time.secs');
        }
      } else if (_value > timeUnits.mins.hour && _value < timeUnits.mins.day) {
        _value = BigNumber(
          BigNumber(`${_value}`)
            .dividedBy(BigNumber(`${timeUnits.mins.hour}`))
            .toFixed(2),
        ).toString();
        if (_value === 1) {
          _unit = lang.t('time.hour');
          _unitShort = lang.t('time.hr');
        } else {
          _unit = lang.t('time.hours');
          _unitShort = lang.t('time.hrs');
        }
      } else if (_value >= timeUnits.mins.day) {
        _value = BigNumber(
          BigNumber(`${_value}`)
            .dividedBy(BigNumber(`${timeUnits.mins.day}`))
            .toFixed(2),
        ).toString();
        if (_value === 1) {
          _unit = lang.t('time.day');
          _unitShort = lang.t('time.day');
        } else {
          _unit = lang.t('time.days');
          _unitShort = lang.t('time.days');
        }
      } else {
        _unit = lang.t('time.minutes');
        _unitShort = lang.t('time.mins');
      }
    }
  }
  if (short) {
    return `${_value} ${_unitShort}`;
  } else {
    return `${_value} ${_unit}`;
  }
};
