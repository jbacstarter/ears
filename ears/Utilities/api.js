import { showNotification } from "./notification.js";

const HOST = "http://localhost:3000";

export const CheckLogin = async (user) =>{
  const details ={};
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    "email": user.email,
    "password": user.password
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  
  try {
    const response = await fetch(`${HOST}/ears/users/login`, requestOptions);
    const text = await response.text();

    details.text = text;
    details.status = response.status;
  } catch (error) {
    details.text = "Connection To Server Not Found";
    details.status = 404;
    showNotification("Connection To Server Not Found" ,"error")
  }

  return details;
}

export const RegisterAccount = async (user) =>{
  const details ={};
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    "email": user.email,
    "password": user.password,
    "name": user.name
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  
  try {
    const response = await fetch(`${HOST}/ears/users/register`, requestOptions);
    const text = await response.text();
    details.text = text;
    details.status = response.status;
  } catch (error) {
    details.text = "Connection To Server Not Found";
    details.status = 404; 
    showNotification("Connection To Server Not Found" ,"error")
  }

  return details;
}

export const AccountInfo = async (user) =>{
    const details ={};
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
 
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  try {
    const response = await fetch(`${HOST}/ears/info?email=${user}`, requestOptions);
    details.result = await response.json();
  } catch (error) {
    details.result = 0
    showNotification("Connection To Server Not Found" ,"error")
  }

  return details;
}


export const initAccount = async (user) =>{
  const details ={};
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    "email": user.email,
    "name": user.name
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  
  try {
    const response = await fetch(`${HOST}/ears/info/create`, requestOptions);
    const text = await response.text();
    console.log(response.status);
  } catch (error) {
   showNotification("Connection To Server Not Found" ,"error")
  }
}

export const GetCourse = async (user, courseTitle) =>{
  const details ={};
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  try {
    const response = await fetch(`${HOST}/ears/info/course?email=${user}&courseTitle=${courseTitle}`, requestOptions);
    details.result = await response.json();
  } catch (error) {
    details.result = 0
    showNotification("Connection To Server Not Found" ,"error")
  }
  
  return details;
}


export const GetCourseList = async () =>{
  const details ={};
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  try {
    const response = await fetch(`${HOST}/ears/info/courselist`, requestOptions);
    details.result = await response.json();
  } catch (error) {
    details = 0;
    showNotification("Connection To Server Not Found" ,"error")
  }
  return details;
}


export const UpdateScore = async (user, courseTitle, quizTitle, newScore) =>{
  
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  const response = await fetch(`${HOST}/ears/info/newScore?email=${user}&courseTitle=${courseTitle}&quizTitle=${quizTitle}&newScore=${newScore}`, requestOptions);
  const res = await response.json();
  return res.status;
}

export const addModule = async (data) =>{
  const details ={};
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify({
    "title": data.title,
    "body": data.body
  });
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  
  try {
    const response = await fetch(`${HOST}/ears/info/courses/${data.courseTitle}/modules`, requestOptions);
    const text = await response.json();
    return text.status;
  } catch (error) {
    showNotification("Connection To Server Not Found" ,"error")
  }
}
export const removeModule = async (data) =>{
  const details ={};
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const requestOptions = {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow"
  };
  
  try {
    const response = await fetch(`${HOST}/ears/info/courses/${data.courseTitle}/modules/${data.moduleTitle}`, requestOptions);
    const text = await response.json();
    return text.status;
  } catch (error) {
    showNotification("Connection To Server Not Found" ,"error")
  }
}


export const addQuiz = async ({ courseTitle, quiz }) => {
    try {
        const response = await fetch(`${HOST}/ears/${encodeURIComponent(courseTitle)}/quizzes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: quiz.title,
                timeLimit: quiz.timeLimit,
                questions: quiz.questions || []
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add quiz');
        }
        return await response.json();
    } catch (error) {
        showNotification("Connection To Server Not Found" ,"error")
        throw error;
    }
};

export const removeQuiz = async ({ courseTitle, quizTitle }) => {
    try {
        const response = await fetch(`${HOST}/ears/${encodeURIComponent(courseTitle)}/quizzes/${encodeURIComponent(quizTitle)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove quiz');
        }
        return await response.json();
    } catch (error) {
        showNotification("Connection To Server Not Found" ,"error")
        throw error;
    }
};

export const updateQuiz = async ({ courseTitle, quizTitle, quiz }) => {
    try {
        const response = await fetch(`${HOST}/ears/${encodeURIComponent(courseTitle)}/quizzes/${encodeURIComponent(quizTitle)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: quiz.title,
                timeLimit: quiz.timeLimit,
                questions: quiz.questions || []
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update quiz');
        }
        return await response.json();
    } catch (error) {
        showNotification("Connection To Server Not Found" ,"error")
        throw error;
    }
};

// Utility function to handle API errors
const handleApiError = (error) => {
    console.error('API Error:', error);
    throw error;
};


export const GetInfoSummary = async (user) =>{
    const details ={};
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
 
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };
  try {
    const response = await fetch(`${HOST}/ears/info/dashboard?email=${user}`, requestOptions);
    details.result = await response.json();
  } catch (error) {
    details.result = 0
    showNotification("Connection To Server Not Found" ,"error")
  }

  return details;
}

export async function ModuleStatus(email, courseTitle, moduleTitle, status) {
    try {
        const response = await fetch(`${HOST}/ears/info/module-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                courseTitle: courseTitle,
                moduleTitle: moduleTitle,
                status: status
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update module status');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        showNotification("Connection To Server Not Found" ,"error")
        throw error;
    }
}


export async function updateProfile(updatedData) {
    try {
        // Get the current user's email (you'll need to implement getUserEmail())
        const {userEmail,name,gender,address} = updatedData; // Or get it from your auth system
        
        // Prepare the request
        const response = await fetch(`${HOST}/ears/profile/${userEmail}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json' // If using JWT
            },
            body: JSON.stringify({
                name: name,
                gender: gender,
                address: address
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
        }

        const data = await response.json();
        return {
            success: true,
            message: data.message,
            updatedFields: data.updatedFields
        };

    } catch (error) {
        showNotification("Connection To Server Not Found" ,"error")
        return {
            success: false,
            message: error.message
        };
    }
}


export async function addCourse(title) {
  try {
    const response = await fetch(`${HOST}/ears/course`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({title})
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to add course");
    }

    console.log("Course added:", data);
    showNotification("Course added successfully!", "info");
    return true;
  } catch (error) {
    console.error("Add course error:", error.message);
    showNotification("Error adding course: " ,"error");
    return false;
  }
}

export async function removeCourse(title) {
  try {
    const response = await fetch(`${HOST}/ears/course/${encodeURIComponent(title)}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to remove course");
    }

    console.log("Course removed:", data);
    showNotification("Course removed successfully!", "info");
    return true;
  } catch (error) {
    console.error("Remove course error:", error.message);
    showNotification("Error removing course", "error" );
    return false
  }
}
