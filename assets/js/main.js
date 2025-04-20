/*  ========= js documentation ==============

 * theme name: Memeco
 * version: 1.0
 * description: Memeco - Meme coin ICO & Crypto Bootstrap Template 
 * author: Pixelaxis
 * author-url: https://themeforest.net/user/pixelaxis
 * 

   
    -------------------------------------------------
     01. Scroll top
     -------------------------------------------------
     02. Menu
     -------------------------------------------------
     03. Swiper Sliders
     -------------------------------------------------
     04. FAQ accordion
     -------------------------------------------------
     05.  Animation
     -------------------------------------------------
     
    ================================================== */

("use strict");
document.addEventListener("DOMContentLoaded", function () {
  AOS.init({
    duration: 1500,
  });

  /**
   * ======================================
   * 01. scroll top
   * ======================================
   */

  let scrollHeight;
  const scrollTopButton = document.querySelector(".scroll-top");

  const handleProgressClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  window.addEventListener("scroll", () => {
    scrollHeight = window.scrollY;
    if (scrollHeight > 100) {
      scrollTopButton?.classList.add("active");
    } else {
      scrollTopButton?.classList.remove("active");
    }
  });

  scrollTopButton && scrollTopButton.addEventListener("click", handleProgressClick);

  const bgImages = document.querySelectorAll("[data-bg]");
  if (bgImages.length) {
    bgImages.forEach((image) => {
      const bgList = image
        .getAttribute("data-bg")
        .split(",")
        .map((bg) => `url(${bg.trim()})`);
      image.style.backgroundImage = bgList.join(", ");
    });
  }

  /**
   * ======================================
   * 02. Menu
   * ======================================
   */

  window.addEventListener("scroll", function () {
    scrollHeight = window.scrollY;
    const desktopNav = document.querySelector(".desktop-nav-container");

    if (scrollHeight > 100) {
      desktopNav?.classList.add("active");
    } else {
      desktopNav.classList.remove("active");
    }
  });

  // Mobile menu functionality
  const menuToggle = document.getElementById("menuToggle");
  const closeMenu = document.getElementById("closeMenu");
  const overlay = document.getElementById("overlay");
  const mobileMenuContainer = document.querySelector(".mobile-menu-container");

  function toggleMenu() {
    mobileMenuContainer.classList.toggle("active");
  }

  menuToggle?.addEventListener("click", toggleMenu);
  closeMenu?.addEventListener("click", toggleMenu);
  overlay?.addEventListener("click", toggleMenu);

  // Mobile submenu functionality
  const mobileSubmenuButtons = document.querySelectorAll("#mobileMenu .mobile-sub-menu");

  mobileSubmenuButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const submenu = this.nextElementSibling;
      const icon = this.querySelector("i");

      // Close all other submenus before opening the current one
      document.querySelectorAll(".submenu").forEach((otherSubmenu) => {
        if (otherSubmenu !== submenu) {
          otherSubmenu.classList.remove("open");
          otherSubmenu.style.maxHeight = "0px";
          otherSubmenu.previousElementSibling.querySelector("i").classList.remove("ph-minus");
          otherSubmenu.previousElementSibling.querySelector("i").classList.add("ph-plus");
        }
      });

      // Toggle the clicked submenu
      if (submenu.classList.contains("open")) {
        submenu.style.maxHeight = "0px";
        submenu.classList.remove("open");
      } else {
        submenu.style.maxHeight = submenu.scrollHeight + "px";
        submenu.classList.add("open");
      }

      // Toggle icons
      icon.classList.toggle("ph-plus");
      icon.classList.toggle("ph-minus");
    });
  });

  /**
   * ======================================
   * 03. Swiper Sliders
   * ======================================
   */

  var swiper = new Swiper(".home-2-brands", {
    slidesPerView: "auto",
    speed: 18000,
    freeMode: true,
    autoplay: {
      delay: 0,
    },
    loop: true,
    breakpoints: {
      0: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 4,
      },
      1024: {
        slidesPerView: 6,
      },
    },
  });

  /**
   * ======================================
   * 04. FAQ accordion
   * ======================================
   */
  let accordion = document.querySelectorAll(".appear-down");
  let accordionQuestion = document.querySelectorAll(".faq-accordion");

  accordion.forEach((item, index) => {
    accordionQuestion[index].addEventListener("click", function () {
      let faqAnswer = accordion[index].querySelector(".faq-answer");

      // Close all other accordions
      accordion.forEach((otherAccordion, otherIndex) => {
        if (otherIndex !== index) {
          let otherFaqAnswer = otherAccordion.querySelector(".faq-answer");
          otherFaqAnswer.style.height = null;
          otherAccordion.classList.remove("active");
        }
      });

      // Toggle open/close for the clicked accordion
      if (faqAnswer.style.height) {
        faqAnswer.style.height = null;
      } else {
        faqAnswer.style.height = faqAnswer.scrollHeight + "px";
      }

      accordion[index].classList.toggle("active");
    });
  });
});

/**
 * ======================================
 * 05. Animation
 * ======================================
 */

gsap.registerPlugin(ScrollTrigger);
// text split animation
function splitTextAnimation(selector) {
  document.querySelectorAll(selector).forEach((item) => {
    const delay = parseFloat(item.getAttribute("data-delay")) || 0; // Default: 0s
    const duration = parseFloat(item.getAttribute("data-duration")) || 0.5; // Default: 1s
    // Preserve spaces while wrapping each letter in a span
    let text = item.innerText;
    item.innerHTML = text
      .split("")
      .map((letter) => {
        return letter === " "
          ? "&nbsp;" // Keep space intact
          : `<span style="display: inline-block; opacity: 0;">${letter}</span>`;
      })
      .join("");
    const letters = item.querySelectorAll("span");
    gsap.to(letters, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: duration,
      delay: delay,
      ease: "back.out(1.7)",
      stagger: 0.05, // Stagger effect for each letter
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
    // Initial hidden state for animation
    gsap.set(letters, { opacity: 0, y: 50, rotationX: 90 });
  });
}

function slidingBlurTextReveal(selector) {
  document.querySelectorAll(selector).forEach((item) => {
    const delay = parseFloat(item.getAttribute("data-delay")) || 0; // Default delay
    const duration = parseFloat(item.getAttribute("data-duration")) || 0.8; // Default duration
    // Preserve spaces while wrapping each letter in a span
    let text = item.innerText;
    item.innerHTML = text
      .split("")
      .map((letter) => {
        return letter === " "
          ? "&nbsp;" // Keeps spaces intact
          : `<span style="display: inline-block; opacity: 0; filter: blur(10px);">${letter}</span>`;
      })
      .join("");
    const letters = item.querySelectorAll("span");
    gsap.to(letters, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: duration,
      delay: delay,
      ease: "power3.out",
      stagger: 0.05, // Adds a smooth delay between each letter
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
    // Set initial hidden state
    gsap.set(letters, { opacity: 0, filter: "blur(10px)" });
  });
}

// reveal animation
function revealAnim(selector) {
  document.querySelectorAll(selector).forEach((item) => {
    const direction = item.getAttribute("data-reveal-from") || "left"; // Default: bottom
    const delay = parseFloat(item.getAttribute("data-delay")) || 0; // Default: 0s
    const duration = parseFloat(item.getAttribute("data-duration")) || 1.2; // Default: 1.2s

    // Define animation properties based on direction
    let fromVars = {
      opacity: 0,
      clipPath: "inset(0 0 0 0)", // Default, changes dynamically
      ease: "power3.out",
      duration: duration,
      delay: delay,
    };

    switch (direction) {
      case "top":
        fromVars.clipPath = "inset(100% 0% 0% 0%)";
        break;
      case "right":
        fromVars.clipPath = "inset(0% 0% 0% 100%)";
        break;
      case "bottom":
        fromVars.clipPath = "inset(0% 0% 100% 0%)";
        break;
      case "left":
        fromVars.clipPath = "inset(0% 100% 0% 0%)";
        break;
    }

    gsap.fromTo(item, fromVars, {
      opacity: 1,
      y: 0,
      x: 0,
      duration: duration,
      delay: delay,
      ease: "power3.inOut",
      clipPath: "inset(0% 0% 0% 0%)",
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });
}

slidingBlurTextReveal(".blur_anim");

splitTextAnimation(".split_anim");

revealAnim(".reveal_anim");
