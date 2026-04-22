
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Deactivate all buttons and sections
        document.querySelectorAll('.nav-btn').forEach(b => {
          b.classList.remove('active');
          b.removeAttribute('aria-current');
        });
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

        // Activate clicked button and its section
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'page');
        document.getElementById('s-' + btn.dataset.s).classList.add('active');

        // Scroll to top on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });


    /*
    ──────────────────────────────────────────────────────────
     GOOGLE SEARCH
     Opens a real Google search for the entered query in a new tab.
     URL format: https://www.google.com/search?q=ENCODED_QUERY
    ──────────────────────────────────────────────────────────
    */
    function doGoogle() {
      const query = document.getElementById('gInput').value.trim();

      if (!query) {
        showToast('Please type a search term first.');
        return;
      }

      // encodeURIComponent handles special characters, spaces, operators
      const url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    /*
    ──────────────────────────────────────────────────────────
     FILL GOOGLE INPUT
     Called by example box onclick handlers.
     Sets the input value and focuses it so the user can edit.
    ──────────────────────────────────────────────────────────
    */
    function setG(text) {
      const input = document.getElementById('gInput');
      input.value = text;
      input.focus();
    }


    /*
    ──────────────────────────────────────────────────────────
     YOUTUBE SEARCH
     Opens a real YouTube search for the entered query in a new tab.
     URL format: https://www.youtube.com/results?search_query=ENCODED_QUERY
    ──────────────────────────────────────────────────────────
    */
    function doYT() {
      const query = document.getElementById('ytInput').value.trim();

      if (!query) {
        showToast('Please type a topic first.');
        return;
      }

      const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    /*
    ──────────────────────────────────────────────────────────
     FILL YOUTUBE INPUT
    ──────────────────────────────────────────────────────────
    */
    function setYT(text) {
      const input = document.getElementById('ytInput');
      input.value = text;
      input.focus();
    }


    /*
    ──────────────────────────────────────────────────────────
     TOAST NOTIFICATION
     Displays a short message at the bottom-right of the screen.
     Disappears automatically after 2.5 seconds.
    ──────────────────────────────────────────────────────────
    */
    let toastTimer = null;

    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.add('show');

      // Clear any existing timer before starting a new one
      if (toastTimer) clearTimeout(toastTimer);

      toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }


    /*
    ──────────────────────────────────────────────────────────
     KEYBOARD SUPPORT
     Press Enter in either input to trigger the search.
    ──────────────────────────────────────────────────────────
    */
    document.getElementById('gInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') doGoogle();
    });

    document.getElementById('ytInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') doYT();
    });
