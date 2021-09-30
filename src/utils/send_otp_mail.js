import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default (email, otp) =>
  new Promise((resolve, reject) => {
    try {
      const msg = {
        to: email,
        from: process.env.PAYME_EMAIL,
        subject: "PayMe account verification.",
        text: `DO NOT SHARE THIS MESSAGE TO ANYONE\nYour OTP is ${otp}`,
      };

      try {
        sgMail
          .send(msg)
          .then(() => {
            console.log("otp sent");
            resolve({ success: true });
          })
          .catch((err) => {
            console.log("AN ERROR OCCURED WHILE SENDING OTP");
            console.log(
              `ERROR_MESSAGE: ${err.message} ERROR_NAME: ${err.name}`
            );
            console.log(err);
            reject({ success: false });
          });
      } catch (err) {
        reject({ success: false });
      }
    } catch (err) {
      reject({ success: false });
    }
  });
