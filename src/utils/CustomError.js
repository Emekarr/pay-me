export default class CustomError extends Error {
  constructor(msg, status_code) {
    super(msg);
    this.name = "CustomError";
    this.status_code = status_code;
  }
}
