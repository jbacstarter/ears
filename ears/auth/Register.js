import { initAccount, RegisterAccount } from "../Utilities/api.js";
import { hideLoading, showLoading } from "../Utilities/loader.js";
import { showNotification } from "../Utilities/notification.js";



const form = document.getElementById("register-form");
const email = document.getElementById("email");

const emailValidity = () => {
    email.setCustomValidity(""); // reset before checking
    if (email.validity.valueMissing) return -1;
    if (email.validity.typeMismatch || email.validity.patternMismatch) return 0;
    return 1;
};

const send = async (data)=>{
    const details = await RegisterAccount(data);
    const status = details.status;
    const text = details.text;

    if(status != 200){
      showNotification("Account Already Exists...", "warning");
    }else if(status == 400){
      showNotification("Internal Server Error...", "error");
    }else if (status ==200){
      showNotification("Registered...", "success");
      await initAccount(data); 
    }
}
form.addEventListener("submit", async (e) =>{
    e.preventDefault(); // Prevent page refresh
    const data = {};
    const formData = new FormData(form);
    let res = emailValidity();
      formData.forEach((value, key) => {
      data[key] = value;
    })
    showLoading();
    setTimeout(async () => {
      await send(data);
      hideLoading();
    }, 2500);
});

