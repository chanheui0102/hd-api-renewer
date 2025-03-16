// src/validators/is-file.decorator.ts
import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

interface IsFileOptions {
    mime: Array<'image/jpg' | 'image/png' | 'image/jpeg' | 'image/webp'>;
}

export function IsFile(
    options: IsFileOptions,
    validationOptions?: ValidationOptions
) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isFile',
            target: object.constructor,
            propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (
                        value?.mimetype &&
                        options?.mime?.includes(value.mimetype)
                    ) {
                        return true;
                    }
                    return false;
                },
            },
        });
    };
}
