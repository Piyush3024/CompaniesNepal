import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { decodeId } from '../utils/secure.util';

@ValidatorConstraint({ name: 'isEncodedId', async: false })
export class IsEncodedIdConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    // Check format: base62-hash (e.g., "1A-12345678")
    const encodedIdPattern = /^[0-9A-Za-z]+-[0-9a-f]{8}$/;
    if (!encodedIdPattern.test(value)) {
      return false;
    }

    try {
      const decodedId = decodeId(value);
      return (
        decodedId !== null &&
        decodedId !== undefined &&
        Number.isInteger(decodedId) &&
        decodedId > 0
      );
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid encoded ID`;
  }
}

export function IsEncodedId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEncodedIdConstraint,
    });
  };
}
