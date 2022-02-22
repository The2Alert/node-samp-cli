import {Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";

export interface PluginParams {
    platform: string;
    path: string;
}

@ValidatorConstraint({name: "isPluginParams", async: false})
export class PluginParamsValidator implements ValidatorConstraintInterface {
    public validate(value: unknown): boolean {
        return value instanceof Array && value.every((value) => typeof value === "string" || (typeof value === "object" && typeof value.platform === "string" && typeof value.path === "string"));
    }

    public defaultMessage({property}: ValidationArguments): string {
        return `each value in ${property} must be an {platform: string, path: string} or string`;
    }
}

export function IsPluginParams(): PropertyDecorator {
    return Validate(PluginParamsValidator);
}