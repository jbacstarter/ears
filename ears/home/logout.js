import { hideLoading, showLoading } from "../Utilities/loader.js";


export const logout = ()=>{
    const logout = document.querySelector("#logout-button");
    logout.addEventListener("click", (e)=>{
        showLoading()
        setTimeout(() => {
        window.location.href = "../auth/login.html";
        hideLoading();
        sessionStorage.removeItem("user");
    }, 2000);
    })
}