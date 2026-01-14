import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'atLeastOne', async: false })
export class AtLeastOneConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const object: object = args.object;
    const properties = args.constraints[0] as string[];

    // Check if at least one of the specified properties has a value
    return properties.some((property) => {
      const propValue = object[property] as string;
      return (
        propValue !== undefined &&
        propValue !== null &&
        propValue !== '' &&
        (typeof propValue !== 'string' || propValue.trim() !== '')
      );
    });
  }

  defaultMessage(args: ValidationArguments): string {
    const properties = args.constraints[0] as string[];
    return `At least one of the following fields must be provided: ${properties.join(', ')}`;
  }
}

/**
 * Validates that at least one of the specified properties has a value
 * @param properties - Array of property names to check
 * @param validationOptions - Optional validation options
 */
export function AtLeastOne(
  properties: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [properties],
      validator: AtLeastOneConstraint,
    });
  };
}
