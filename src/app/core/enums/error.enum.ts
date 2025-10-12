export enum MessagePipesim {
    ERROR_CODE_401 = "40001",
    ERROR_CODE_403 = "40003"
}

export const MappingPipesimMessageError: Record<MessagePipesim, string> = {
    [MessagePipesim.ERROR_CODE_401]: 'Value is required in pipeline input.',
    [MessagePipesim.ERROR_CODE_403]: 'Pipesim input data is negative number'
};