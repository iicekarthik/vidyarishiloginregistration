// otp.store.js

let otpStore;

if (!global.otpStore) {
  global.otpStore = new Map();
}

otpStore = global.otpStore;

export default otpStore;
