import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

type ValidateDateOptions = {
  greaterThan?: Date;
  lessThan?: Date;
  equalTo?: Date;
  future?: boolean;
  past?: boolean;
  allowToday?: boolean;
};

export function ValidateDate(
  options: ValidateDateOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'ValidateDate',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (!value) return false;

          const input = new Date(value as string);

          if (isNaN(input.getTime())) return false;

          const inputDate = new Date(input);
          inputDate.setHours(0, 0, 0, 0);

          const now = new Date();
          now.setHours(0, 0, 0, 0);

          const { equalTo, greaterThan, lessThan, future, past, allowToday } =
            options;

          if (equalTo) {
            const target = new Date(equalTo);
            target.setHours(0, 0, 0, 0);
            if (inputDate.getTime() !== target.getTime()) return false;
          }

          if (greaterThan) {
            const gt = new Date(greaterThan);
            gt.setHours(0, 0, 0, 0);
            if (inputDate <= gt) return false;
          }

          if (lessThan) {
            const lt = new Date(lessThan);
            lt.setHours(0, 0, 0, 0);
            if (inputDate >= lt) return false;
          }

          if (future && (allowToday ? inputDate < now : inputDate <= now))
            return false;
          if (past && (allowToday ? inputDate > now : inputDate >= now))
            return false;

          return true;
        },

        defaultMessage(args: ValidationArguments) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const [relatedPropertyName, message] = args.constraints;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return (
            message ||
            `${relatedPropertyName} is not a valid date for the specified condition.`
          );
        },
      },
    });
  };
}
