/* =========================================================
   Reverb — interactivity
   1. Sticky navbar effect on scroll
   2. Smooth scrolling for in-page nav anchors
   3. Complex interactive features:
      a) client-side search/filter for trending content cards
      b) tabbed monthly/yearly pricing switch
   4. Contact/newsletter form validation
   ========================================================= */

$(function () {

  /* ---------- 1. Sticky navbar effect ---------- */
  const $nav = $('#mainNav');

  function updateNavOnScroll() {
    if ($(window).scrollTop() > 50) {
      $nav.addClass('scrolled');
    } else {
      $nav.removeClass('scrolled');
    }
  }
  updateNavOnScroll();
  $(window).on('scroll', updateNavOnScroll);

  /* ---------- 2. Smooth scrolling for nav anchors ---------- */
  $('a[href^="#"]').on('click', function (e) {
    const targetId = $(this).attr('href');
    if (targetId.length < 2) return; // ignore bare "#"

    const $target = $(targetId);
    if ($target.length) {
      e.preventDefault();

      // close the mobile menu if it's open
      const $collapse = $('#navContent');
      if ($collapse.hasClass('show')) {
        bootstrap.Collapse.getOrCreateInstance($collapse[0]).hide();
      }

      const navHeight = $nav.outerHeight() || 0;
      $('html, body').animate(
        { scrollTop: $target.offset().top - navHeight + 1 },
        500
      );
    }
  });

  /* ---------- 3a. Trending content: search + genre filter ---------- */
  const $items = $('.content-item');
  const $noResults = $('#noResults');
  let activeGenre = 'all';

  function applyFilters() {
    const query = $('#genreSearch').val().trim().toLowerCase();
    let visibleCount = 0;

    $items.each(function () {
      const $item = $(this);
      const genre = $item.data('genre');
      const text = $item.text().toLowerCase();

      const matchesGenre = activeGenre === 'all' || genre === activeGenre;
      const matchesSearch = query === '' || text.indexOf(query) !== -1;

      if (matchesGenre && matchesSearch) {
        $item.removeClass('is-hidden');
        visibleCount++;
      } else {
        $item.addClass('is-hidden');
      }
    });

    $noResults.toggleClass('d-none', visibleCount !== 0);
  }

  $('.filter-pills .pill').on('click', function () {
    $('.filter-pills .pill').removeClass('active');
    $(this).addClass('active');
    activeGenre = $(this).data('filter');
    applyFilters();
  });

  $('#genreSearch').on('input', applyFilters);

  /* ---------- 3b. Pricing: monthly / yearly tabbed switch ---------- */
  $('.toggle-pill').on('click', function () {
    const billing = $(this).data('billing');
    $('.toggle-pill').removeClass('active');
    $(this).addClass('active');

    $('.plan-price .amount[data-monthly]').each(function () {
      const $amount = $(this);
      const value = billing === 'yearly' ? $amount.data('yearly') : $amount.data('monthly');
      $amount.text(value);
    });

    $('.plan-price .period').text(billing === 'yearly' ? '/mo, billed yearly' : '/mo');
  });

  /* ---------- 4. Newsletter form validation ---------- */
  const $form = $('#newsletterForm');
  const $name = $('#fullName');
  const $email = $('#emailAddress');
  const $nameError = $('#nameError');
  const $emailError = $('#emailError');
  const $success = $('#signupSuccess');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateName() {
    const value = $name.val().trim();
    if (value === '') {
      $name.addClass('is-invalid');
      $nameError.text('Enter your name so we know who to welcome.');
      return false;
    }
    $name.removeClass('is-invalid');
    $nameError.text('');
    return true;
  }

  function validateEmail() {
    const value = $email.val().trim();
    if (value === '') {
      $email.addClass('is-invalid');
      $emailError.text('Enter an email address.');
      return false;
    }
    if (!emailPattern.test(value)) {
      $email.addClass('is-invalid');
      $emailError.text('That email address doesn\'t look right.');
      return false;
    }
    $email.removeClass('is-invalid');
    $emailError.text('');
    return true;
  }

  $name.on('blur input', validateName);
  $email.on('blur input', validateEmail);

  $form.on('submit', function (e) {
    e.preventDefault();
    const nameOk = validateName();
    const emailOk = validateEmail();

    if (nameOk && emailOk) {
      $success.removeClass('d-none');
      $form[0].reset();
      $name.removeClass('is-invalid');
      $email.removeClass('is-invalid');
    } else {
      $success.addClass('d-none');
    }
  });

  /* ---------- Login form validation (login.html) ---------- */
  const $loginForm = $('#loginForm');

  if ($loginForm.length) {
    const $loginEmail = $('#loginEmail');
    const $loginPassword = $('#loginPassword');
    const $loginEmailError = $('#loginEmailError');
    const $loginPasswordError = $('#loginPasswordError');
    const $loginSuccess = $('#loginSuccess');

    function validateLoginEmail() {
      const value = $loginEmail.val().trim();
      if (value === '') {
        $loginEmail.addClass('is-invalid');
        $loginEmailError.text('Enter your email.');
        return false;
      }
      if (!emailPattern.test(value)) {
        $loginEmail.addClass('is-invalid');
        $loginEmailError.text('That email address doesn\'t look right.');
        return false;
      }
      $loginEmail.removeClass('is-invalid');
      $loginEmailError.text('');
      return true;
    }

    function validateLoginPassword() {
      const value = $loginPassword.val();
      if (value === '') {
        $loginPassword.addClass('is-invalid');
        $loginPasswordError.text('Enter your password.');
        return false;
      }
      $loginPassword.removeClass('is-invalid');
      $loginPasswordError.text('');
      return true;
    }

    $loginEmail.on('blur input', validateLoginEmail);
    $loginPassword.on('blur input', validateLoginPassword);

    $loginForm.on('submit', function (e) {
      e.preventDefault();
      const emailOk = validateLoginEmail();
      const passwordOk = validateLoginPassword();

      if (emailOk && passwordOk) {
        $loginSuccess.removeClass('d-none');
        // Wire this up to real auth later — for now it just confirms the form works.
      } else {
        $loginSuccess.addClass('d-none');
      }
    });
  }

  /* ---------- Now Playing player controls (player.html) ---------- */
  const audioEl = document.getElementById('playerAudio');

  if (audioEl) {
    const $audio = $(audioEl);
    const $playPauseBtn = $('#playPauseBtn');
    const $playPauseIcon = $('#playPauseIcon');
    const $progressBar = $('#progressBar');
    const $progressFill = $('#progressFill');
    const $currentTime = $('#currentTime');
    const $duration = $('#duration');
    const $volumeSlider = $('#volumeSlider');
    const $volumeIcon = $('#volumeIcon');
    const $shuffleBtn = $('#shuffleBtn');
    const $repeatBtn = $('#repeatBtn');

    function formatTime(seconds) {
      if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return mins + ':' + String(secs).padStart(2, '0');
    }

    // Play / pause toggle
    $playPauseBtn.on('click', function () {
      if (audioEl.paused) {
        audioEl.play();
      } else {
        audioEl.pause();
      }
    });

    audioEl.addEventListener('play', function () {
      $playPauseIcon.removeClass('bi-play-fill').addClass('bi-pause-fill');
      $playPauseBtn.attr('aria-label', 'Pause');
    });

    audioEl.addEventListener('pause', function () {
      $playPauseIcon.removeClass('bi-pause-fill').addClass('bi-play-fill');
      $playPauseBtn.attr('aria-label', 'Play');
    });

    // Progress + time
    audioEl.addEventListener('loadedmetadata', function () {
      $duration.text(formatTime(audioEl.duration));
    });

    audioEl.addEventListener('timeupdate', function () {
      const pct = audioEl.duration ? (audioEl.currentTime / audioEl.duration) * 100 : 0;
      $progressFill.css('width', pct + '%');
      $currentTime.text(formatTime(audioEl.currentTime));
    });

    audioEl.addEventListener('ended', function () {
      $progressFill.css('width', '0%');
      $currentTime.text('0:00');
    });

    // Click-to-seek
    $progressBar.on('click', function (e) {
      if (!audioEl.duration) return;
      const rect = this.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      audioEl.currentTime = ratio * audioEl.duration;
    });

    // Volume
    $volumeSlider.on('input', function () {
      const value = Number($(this).val());
      audioEl.volume = value / 100;
      audioEl.muted = value === 0;
      $volumeIcon
        .toggleClass('bi-volume-mute', value === 0)
        .toggleClass('bi-volume-down', value > 0 && value < 50)
        .toggleClass('bi-volume-up', value >= 50);
    });
    audioEl.volume = Number($volumeSlider.val()) / 100;

    // Shuffle / repeat — visual toggle for now; wire to a real
    // playlist once there's more than one track to shuffle/repeat.
    $shuffleBtn.on('click', function () {
      const active = $(this).toggleClass('active').hasClass('active');
      $(this).attr('aria-pressed', active);
    });

    $repeatBtn.on('click', function () {
      const active = $(this).toggleClass('active').hasClass('active');
      $(this).attr('aria-pressed', active);
      audioEl.loop = active;
    });
  }

  /* ---------- Footer year ---------- */
  $('#year').text(new Date().getFullYear());

});
