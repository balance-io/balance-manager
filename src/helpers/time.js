import BigNumber from 'bignumber.js';
import lang from '../languages';
import timeUnits from '../libraries/time-units.json';

/**
 * @desc get time zone code
 * @param {String} [value='']
 * @param {String} [unit='']
 * @param {Boolean} [short=false]
 * @return {String}
 */
export const getTimeZone = () => {
  const date = new Date();
  const usertime = date.toLocaleString();

  // Some browsers / OSs provide the timezone name in their local string:
  const tzsregex = /\b(ACDT|ACST|ACT|ADT|AEDT|AEST|AFT|AKDT|AKST|AMST|AMT|ART|AST|AWDT|AWST|AZOST|AZT|BDT|BIOT|BIT|BOT|BRT|BST|BTT|CAT|CCT|CDT|CEDT|CEST|CET|CHADT|CHAST|CIST|CKT|CLST|CLT|COST|COT|CST|CT|CVT|CXT|CHST|DFT|EAST|EAT|ECT|EDT|EEDT|EEST|EET|EST|FJT|FKST|FKT|GALT|GET|GFT|GILT|GIT|GMT|GST|GYT|HADT|HAEC|HAST|HKT|HMT|HST|ICT|IDT|IRKT|IRST|IST|JST|KRAT|KST|LHST|LINT|MART|MAGT|MDT|MET|MEST|MIT|MSD|MSK|MST|MUT|MYT|NDT|NFT|NPT|NST|NT|NZDT|NZST|OMST|PDT|PETT|PHOT|PKT|PST|RET|SAMT|SAST|SBT|SCT|SGT|SLT|SST|TAHT|THA|UYST|UYT|VET|VLAT|WAT|WEDT|WEST|WET|WST|YAKT|YEKT)\b/gi;

  // In other browsers the timezone needs to be estimated based on the offset:
  const timezonenames = {
    'UTC+0': 'GMT',
    'UTC+1': 'CET',
    'UTC+2': 'EET',
    'UTC+3': 'EEDT',
    'UTC+3.5': 'IRST',
    'UTC+4': 'MSD',
    'UTC+4.5': 'AFT',
    'UTC+5': 'PKT',
    'UTC+5.5': 'IST',
    'UTC+6': 'BST',
    'UTC+6.5': 'MST',
    'UTC+7': 'THA',
    'UTC+8': 'AWST',
    'UTC+9': 'AWDT',
    'UTC+9.5': 'ACST',
    'UTC+10': 'AEST',
    'UTC+10.5': 'ACDT',
    'UTC+11': 'AEDT',
    'UTC+11.5': 'NFT',
    'UTC+12': 'NZST',
    'UTC-1': 'AZOST',
    'UTC-2': 'GST',
    'UTC-3': 'BRT',
    'UTC-3.5': 'NST',
    'UTC-4': 'CLT',
    'UTC-4.5': 'VET',
    'UTC-5': 'EST',
    'UTC-6': 'CST',
    'UTC-7': 'MST',
    'UTC-8': 'PST',
    'UTC-9': 'AKST',
    'UTC-9.5': 'MIT',
    'UTC-10': 'HST',
    'UTC-11': 'SST',
    'UTC-12': 'BIT'
  };

  let timezone = usertime.match(tzsregex);
  if (timezone) {
    timezone = timezone[timezone.length - 1];
  } else {
    let offset = -1 * date.getTimezoneOffset() / 60;
    offset = 'UTC' + (offset >= 0 ? '+' + offset : offset);
    timezone = timezonenames[offset];
  }
  return timezone;
};

/**
 * @desc get local time & date string
 * @param  {Number} [timestamp=null]
 * @return {String}
 */
export const getLocalTimeDate = (timestamp = null) => {
  timestamp = Number(timestamp) || Date.now();
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()} ${getTimeZone()}`;
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
      } else if (_value >= timeUnits.ms.second && _value < timeUnits.ms.minute) {
        _value = BigNumber(
          BigNumber(`${_value}`)
            .dividedBy(BigNumber(`${timeUnits.ms.second}`))
            .toFixed(2)
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
            .toFixed(2)
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
            .toFixed(2)
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
            .toFixed(2)
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
            .toFixed(2)
        ).toString();
        if (_value === 1) {
          _unit = lang.t('time.milisecond');
          _unitShort = lang.t('time.ms');
        } else {
          _unit = lang.t('time.miliseconds');
          _unitShort = lang.t('time.ms');
        }
      } else if (_value >= timeUnits.secs.minute && _value < timeUnits.secs.hour) {
        _value = BigNumber(
          BigNumber(`${_value}`)
            .dividedBy(BigNumber(`${timeUnits.secs.minute}`))
            .toFixed(2)
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
            .toFixed(2)
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
            .toFixed(2)
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
            .toFixed(2)
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
            .toFixed(2)
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
            .toFixed(2)
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
