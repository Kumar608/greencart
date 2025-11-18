// Smooth GSAP entrance animations
// gsap.from(".nav-btn", {
//     opacity: 0,
//     y: 25,
//     duration: 1,
//     stagger: 0.2,
//     delay: 0.3
// });

// gsap.from(".category-btn", {
//     opacity: 0,
//     scale: 0.8,
//     duration: 1.2,
//     stagger: 0.2,
//     delay: 1
// });

// // Switch active navigation button
// document.querySelectorAll(".nav-btn").forEach(btn => {
//     btn.addEventListener("click", () => {
//         document.querySelector(".nav-btn.active")?.classList.remove("active");
//         btn.classList.add("active");
//     });
// });
gsap.from(".footer", {
    opacity: 0,
    y: 40,
    duration: 1.3,
    delay: 1
});
