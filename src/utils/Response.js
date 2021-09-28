export default class Response {
  #response;
  #status_code;
  #res;

  constructor(message, success, data) {
    this.#response = {
      message: this.#format(message),
      data: data || null,
      success: success ? success : false,
    };
  }

  #format(message) {
    message.replace(
      /(^\w|\s\w)(\S*)/g,
      (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase()
    );
    return message;
  }

  payload() {
    return this.#response;
  }

  respond(status_code, res) {
    this.#status_code = status_code;
    this.#res = res;
    this.#res.status(this.#status_code).send(this.#response);
  }
}
