import {
  validatePresence,
} from 'ember-changeset-validations/validators';

export default function validatePresenceIf(options) {
  const { withValue, on } = options;

  return (...args) => {
    const [,,, changes, content] = args;
    const target = Object.prototype.hasOwnProperty.call(changes, on) ? changes[on] : content[on];
    const hasMatchingWith = target === withValue;

    if (hasMatchingWith) {
      return validatePresence(options)(...args);
    }

    return true;
  };
}
