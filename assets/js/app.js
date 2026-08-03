console.log('FJ-IA listo 🚀');

document.addEventListener('DOMContentLoaded', function () {
  const menu = document.getElementById('fjIaNavbar');

  if (!menu || typeof bootstrap === 'undefined') {
    return;
  }

  const enlaces = menu.querySelectorAll('a');

  enlaces.forEach(function (enlace) {
    enlace.addEventListener('click', function () {
      if (window.innerWidth < 992 && menu.classList.contains('show')) {
        const collapse = bootstrap.Collapse.getOrCreateInstance(menu);
        collapse.hide();
      }
    });
  });
});