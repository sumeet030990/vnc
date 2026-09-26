// Thrown by services to send a specific status code and message to the client.
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}
