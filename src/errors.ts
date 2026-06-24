export class CleanroomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CleanroomError";
  }
}

export function assertCleanroom(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new CleanroomError(message);
  }
}

