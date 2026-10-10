(function () {
    function bindNavbar() {
        const menuToggle = document.getElementById('menuToggle');
        const menuClose = document.getElementById('menuClose');
        const menuOverlay = document.getElementById('menuOverlay');
        const sideMenu = document.getElementById('sideMenu');

        function openMenu() {
            sideMenu.classList.add('active');
            menuOverlay.classList.add('active');
            menuToggle.classList.add('active');
        }

        const koleksiMenuTrigger = document.getElementById('koleksiMenuTrigger');
        const megaMenu = document.getElementById('megaMenu');
        const megaMenuClose = document.getElementById('megaMenuClose');

        function openMegaMenu() {
            megaMenu.classList.add('active');
            megaMenu.setAttribute('aria-hidden', 'false');
        }

        function closeMegaMenu() {
            megaMenu.classList.remove('active');
            megaMenu.setAttribute('aria-hidden', 'true');
        }

        function closeMenu() {
            sideMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            menuToggle.classList.remove('active');
            closeMegaMenu();
        }

        menuToggle.addEventListener('click', () => {
            sideMenu.classList.contains('active') ? closeMenu() : openMenu();
        });
        menuClose.addEventListener('click', closeMenu);
        menuOverlay.addEventListener('click', closeMenu);

        koleksiMenuTrigger.addEventListener('click', openMegaMenu);
        megaMenuClose.addEventListener('click', closeMegaMenu);

        if (window.location.hash === '#koleksi-kristal') {
            openMenu();
            openMegaMenu();
        }

        const searchToggle = document.getElementById('searchToggle');
        const searchBar = document.getElementById('searchBar');
        const searchClose = document.getElementById('searchClose');
        const searchInput = document.getElementById('searchInput');
        const searchForm = document.getElementById('searchForm');

        function openSearch() {
            searchBar.classList.add('active');
            setTimeout(() => searchInput.focus(), 300);
        }

        function closeSearch() {
            searchBar.classList.remove('active');
            searchInput.value = '';
        }

        searchToggle.addEventListener('click', () => {
            searchBar.classList.contains('active') ? closeSearch() : openSearch();
        });
        searchClose.addEventListener('click', closeSearch);
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = 'koleksi.html?q=' + encodeURIComponent(query);
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeSearch();
        });
    }

    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    const navbarLoaded = navbarPlaceholder
        ? fetch('partials/navbar.html')
            .then((res) => res.text())
            .then((html) => { navbarPlaceholder.outerHTML = html; })
        : Promise.resolve();

    const footerLoaded = footerPlaceholder
        ? fetch('partials/footer.html')
            .then((res) => res.text())
            .then((html) => { footerPlaceholder.outerHTML = html; })
        : Promise.resolve();

    Promise.all([navbarLoaded, footerLoaded]).then(bindNavbar);
})();
