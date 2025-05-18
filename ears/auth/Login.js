
import { CheckLogin } from "../Utilities/api.js";
import { hideLoading, showLoading } from "../Utilities/loader.js";
import { showNotification } from "../Utilities/notification.js";

const form = document.getElementById("login-form");

const data = {};
// Debugging;temporary admin account
const email = "admin@gmail.com"
const password = "admin1234";
form.addEventListener("submit", async (e) =>{
    e.preventDefault(); 
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      data[key] = value;
    })

    if(email === data.email && password === data.password){
      sessionStorage.setItem("user", email);
      showLoading()
      setTimeout(() => {
      window.location.href = "../admin/managemodules.html";
      hideLoading();
    }, 2500);
      showNotification("Signing in (Admin)", "success");
    }
    
    else {
      const details = await CheckLogin(data);
      const status = details.status;
      const text = details.text;

    if(status != 200){
      showNotification("Email or Password Incorrect", "warning");
    }else if(status == 400){
      showNotification("Internal Server Error", "error");
    }else {
      showNotification("Signing in", "success");
      sessionStorage.setItem("user", data.email);
      showLoading();
      setTimeout(() => {
        hideLoading();
      window.location.href = "../home/dashboard.html"
      }, 2000);
    }
    }
 
});


