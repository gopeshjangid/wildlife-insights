import { translateText } from 'utils/functions';

export const requiredValidation = value => (typeof value === 'undefined' || value === '' || value === null || (Array.isArray(value) && value.length === 0)
  ? translateText('This field should not be left blank.')
  : null);

export const requiredCheckboxValidation = value => (value !== true ? translateText('Please tick this checkbox.') : null);

export const lengthValidation = limitLength => value => (value.length < limitLength
  ? translateText('Password must contain at least {limitLength} characters.', { limitLength })
  : null);

export const passwordMatchValidation = (value, values) => {
  const confirmationField = values['password-confirmation'] !== null && values['password-confirmation'] !== undefined
    ? values['password-confirmation']
    : values.repeatPassword;

  return confirmationField !== values.password
    ? translateText("The password didn't match. Try again.")
    : null;
};

export const emailValidation = value => (!requiredValidation(value)
  && !/^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/.test(value)
  ? translateText('Please enter a valid email address.')
  : null);

export const urlValidation = value => (!requiredValidation(value)
  && !/^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i.test(
    value
  )
  ? translateText('Please enter a valid URL.')
  : null);

export const numberValidation = (min, max) => (value) => {
  const minDefined = min !== undefined && min !== null;
  const maxDefined = max !== undefined && max !== null;

  if (
    !requiredValidation(value)
    && (Number.isNaN(+value) || (minDefined && +value < min) || (maxDefined && +value > max))
  ) {
    let error = 'Please enter a valid number';
    if (minDefined && maxDefined) {
      error = `${error} between {min} and {max}.`;
    } else if (minDefined && !maxDefined) {
      error = `${error} superior than {min}.`;
    } else if (!minDefined && maxDefined) {
      error = `${error} inferior than {max}.`;
    } else {
      error = `${error}.`;
    }

    return translateText(error, { min, max });
  }

  return null;
};

export const decimalValidation = value => (!requiredValidation(value)
  && !/^-?[0-9]*\.[0-9]{4,8}$/.test(value)
  ? translateText('Min 4 and Max 8 decimal values required.')
  : null);

export const coordinateValidation = (value, coordType = 'latitude') => {
  const range = coordType === 'latitude' ? 90 : 180;
  if (numberValidation(-range, range)(value)) {
    return coordType === 'latitude'
      ? 'Latitude must be between -90 and 90.'
      : 'Longitude must be between -180 and 180.';
  }

  return decimalValidation(value);
};

export const passwordValidation = (value, values) => requiredValidation(value) || lengthValidation(8)(value) || passwordMatchValidation(value, values);

export const latLongKeyPress = (event) => {
  let key = event.charCode || event.keyCode || 0;
  if (!(key == 45 || key == 46 || key >= 48 && key <= 57)) {
    event.preventDefault();
  }
}

export const numberKeyPress = (event) => {
  const key = event.charCode || event.keyCode || 0;
  if (!(key === 45 || key === 46 || (key >= 48 && key <= 57))) {
    event.preventDefault();
  }
};

export const validateStartDate = (startDate, endDate) => {
  if (endDate && endDate < startDate) {
    return translateText('Start date must be less than end date');
  }
  return null;
};
