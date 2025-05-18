
import { CheckLogin } from "../Utilities/api.js";

const form = document.getElementById("login-form");

const data = {};
// Debugging;temporary admin account
const email = "admin@gmail.com"
const password = "admin1234";
form.addEventListener("submit", async (e) =>{
    e.preventDefault(); // Prevent page refresh
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      data[key] = value;
    })
    if(email === data.email && password === data.password){
      sessionStorage.setItem("user", email);
      setTimeout(() => {
      window.location.href = "../admin/modules.html";
      }, 2000);
    }else {
      const details = await CheckLogin(data);
      const status = details.status;
      const text = details.text;

    if(status != 200){
      console.error("Status: "+ status+"\nResponse: "+text)
      alert("ERROR"+"\nStatus: "+ status+"\nResult: "+text)
    }else if(status == 400){
      console.error("Status: "+ status+"\nResponse: "+text)
      alert("ERROR"+"\nStatus: "+ status+"\nResult: "+text)
    }else {
      console.log("Status: "+ status+"\nResponse: "+text)
      alert("Status: "+ status+"\nResult: "+text)

    sessionStorage.setItem("user", data.email);
    setTimeout(() => {
      window.location.href = "../home/dashboard.html"
  }, 2000);
}
    }
 
});


