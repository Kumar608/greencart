const generateOtpBtn = document.getElementById("generateOtp");
const phoneInput = document.getElementById("phone");
const passwordBox = document.getElementById("passwordBox");
const form = document.getElementById("forgotForm");
const successMsg = document.getElementById("successMsg");

// Step 1: Generate OTP
generateOtpBtn.addEventListener("click", () => {
  if(phoneInput.value === "") {
    alert("Please enter your phone number!");
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  alert("Your OTP is: " + otp);
  
  // Show password fields on same page
  passwordBox.style.display = "block";
  generateOtpBtn.disabled = true;
  generateOtpBtn.innerText = "OTP Sent ✓";
});

// Step 2: Update Password
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newPass = document.getElementById("newPass").value;
  const confirmPass = document.getElementById("confirmPass").value;

  if(newPass !== confirmPass){
    alert("Passwords do not match!");
    return;
  }

  passwordBox.style.display = "none";
  successMsg.style.display = "block";
  form.reset();
});
