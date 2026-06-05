$(document).ready(function(){
    $('.carousele').slick({
        arrows: false,
        autoplay: true,
        dots: true,
        slidesToShow: 3, // Показываем 3 элемента
        slidesToScroll: 1, // Прокручиваем по одному
        centerMode: true, // Центральный элемент больше
        variableWidth: false, // Отключаем, чтобы все элементы были одинаковой ширины
        focusOnSelect: true, // Выбор центрального элемента при клике
        autoplaySpeed: 2000 // Скорость смены слайдов
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const themeToggle = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const body = document.body;

    // Проверяем, какая тема была выбрана ранее
    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("dark-mode");
        themeIcon.src = "assets/images/sun.png"; // Меняем иконку
    }

    themeToggle.addEventListener("click", function() {
        body.classList.toggle("dark-mode");

        // Меняем иконку при смене темы
        if (body.classList.contains("dark-mode")) {
            themeIcon.src = "assets/images/sun.png";
            localStorage.setItem("darkMode", "enabled");
        } else {
            themeIcon.src = "assets/images/moon.png";
            localStorage.setItem("darkMode", "disabled");
        }
    });
});



