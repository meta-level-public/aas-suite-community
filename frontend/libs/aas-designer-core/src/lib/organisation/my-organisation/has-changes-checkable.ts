export abstract class HasChangesCheckable {
  abstract hasChanges(): boolean;
  abstract isInEditMode(): boolean;
  abstract cancelEditing(force?: boolean): void;
}
