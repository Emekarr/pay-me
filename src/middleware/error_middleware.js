import Response from "../utils/Response.js";
const err_names = ["CastError", "SyntaxError"];

export default (error, req, res, next) => {
  console.log("AN ERROR OCCURED!");
  console.log(`ERROR_MESSAGE: ${error.message}\n ERROR_NAME: ${error.name}`);
  console.log(error);
  if (error.name === "CustomError") {
    new Response(error.message, false).respond(error.status_code, res);
  } else if (err_names.includes(error.name)) {
    new Response(error.message, false).respond(400, res);
  } else {
    new Response(error.message, false).respond(500, res);
  }
};
