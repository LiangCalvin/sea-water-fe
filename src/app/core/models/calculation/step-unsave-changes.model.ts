export interface StepComponentWithUnsavedChanges {
    hasUnsavedChanges(): boolean;
    resetInteractionState?(): void;
}