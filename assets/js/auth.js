async function checkAuth(requiredRole) {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location = "/pharmacy/login/sign_in/login.html";
        return;
    }

    try {

        const response = await fetch("/pharmacy/backend/api/auth/me.php", {

            headers: {
                Authorization: "Bearer " + token
            }

        });

        const data = await response.json();

        if (!data.success) {

            localStorage.clear();

            window.location = "/pharmacy/login/sign_in/login.html";

            return;
        }

        if (requiredRole && data.user.role !== requiredRole) {

            alert("Access Denied.");

            localStorage.clear();

            window.location = "/pharmacy/login/sign_in/login.html";

            return;
        }

        window.currentUser = data.user;

    } catch (error) {

        console.error(error);

        localStorage.clear();

        window.location = "/pharmacy/login/sign_in/login.html";

    }

}