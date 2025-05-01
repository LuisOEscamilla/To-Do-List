document.getElementById("authForm").addEventListener("submit", async function(e) {
    if (e.defaultPrevented) return;
    e.preventDefault();
    
    const btn      = document.getElementById("authButton");
    const isSignUp = btn.textContent.trim() === "Sign Up";   // true ↔ register, false ↔ login
    const endpoint = isSignUp ? "register" : "login";

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(`/api/auth/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name     : document.getElementById("name").value,  // ignored on login
                username ,
                password
              })
        });
        
        if (res.ok) window.location.href = "/dashboard";
        else alert((await res.json()).message);
    } catch (err) {
        alert("Connection error");
    }
});