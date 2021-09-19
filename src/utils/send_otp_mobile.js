import Vonage from "@vonage/server-sdk";

export default (from, mobile, otp) =>
  new Promise((resolve, reject) => {
    try {
      const vonage = new Vonage({
        apiKey: process.env.VONAGE_API_KEY,
        apiSecret: process.env.VONAGE_API_SECRET,
      });

      const msg = `DO NOT SHARE THIS MESSAGE TO ANYONE\nYour OTP is ${otp}`;

      vonage.message.sendSms(from, mobile, msg, (err, responseData) => {
        if (err) {
          console.log("AN ERROR OCCURED WHILE SENDING OTP");
          console.log(`ERROR_MESSAGE: ${err.message} ERROR_NAME: ${err.name}`);
          console.log(err);
        } else {
          if (responseData.messages[0]["status"] === "0") {
            console.log("Message sent successfully.");
          } else {
            console.log(
              `Message failed with error ${responseData.messages[0]["error-text"]}`
            );
          }
        }
      });
    } catch (e) {
      reject({ success: false });
    }
  });
