/* MOBILE NAVIGATION MENU ICON*/

const nav = document.querySelector("nav");
const navLinks = document.querySelector(".nav-links");

const menuButton = document.createElement("button");

menuButton.className = "mobile-menu-btn";
menuButton.innerHTML = "☰";
menuButton.setAttribute("aria-label", "Open menu");

nav.appendChild(menuButton);

menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("mobile-open");
    const isOpen = navLinks.classList.contains("mobile-open");
    menuButton.innerHTML = isOpen ? "✕" : "☰";
    menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close menu" : "Open menu"
    );

});

  function showToast(message) {

    const existingToast = document.getElementById("custom-toast");

    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement("div");

    toast.id = "custom-toast";

    toast.textContent = message;

    Object.assign(toast.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "#31ca71",
        color: "#ffffff",
        padding: "12px 24px",
        borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        fontSize: "14px",
        fontWeight: "700",
        zIndex: "9999",
        transition: "all .35s ease",
        transform: "translateX(120%)",
        opacity: "0"
    });

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.style.transform = "translateX(0)";
        toast.style.opacity = "1";

    }, 30);

    setTimeout(() => {

        toast.style.transform = "translateX(120%)";
        toast.style.opacity = "0";

        setTimeout(() => {

            toast.remove();

        }, 350);

    }, 2500);

}

