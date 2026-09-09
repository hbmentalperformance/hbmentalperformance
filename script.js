// HB Mental Performance — shared site behavior

document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Mark current page's nav link as active
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === current) {
      link.classList.add('active');
    }
  });

  // Contact form handler — submits to Netlify Forms via AJAX so the page doesn't redirect
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('form-status');
      var submitBtn = form.querySelector('button[type="submit"]');
      var formData = new FormData(form);
      if (submitBtn) submitBtn.disabled = true;
      if (status) status.textContent = 'Sending...';

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      }).then(function (response) {
        if (response.ok) {
          if (status) status.textContent = "Thanks — your message is on its way. I'll get back to you soon.";
          form.reset();
        } else {
          throw new Error('Form submission failed');
        }
      }).catch(function () {
        if (status) status.textContent = "Something went wrong sending that — please email hanna@hbmentalperformance.com directly for now.";
      }).finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }

  initQuiz();
  initTeamQuiz();
});

// ---------- "What's Your Next Move?" quiz ----------
function initQuiz() {
  var box = document.getElementById('quiz-box');
  if (!box) return;

  var STEPS = ['1', '2', '3', '4', '5', 'result'];
  var history = ['1'];
  var answers = {};

  var progressBar = document.getElementById('quiz-progress-bar');
  var backBtn = document.getElementById('quiz-back');
  var restartBtn = document.getElementById('quiz-restart');

  var STAGE_LABEL = {
    youth: "still building your game as a youth player",
    highschool: "grinding for the next level as a high school or club player",
    college: "chasing the jump to college or pro",
    pro: "handling everything that comes with being pro or semi-pro",
    mixed: "somewhere in between all of that"
  };

  var FOCUS = {
    confidence: {
      headline: "Build the self-belief you keep second-guessing",
      body: "You're not lacking ability — you're lacking trust in it. "
    },
    pressure: {
      headline: "Learn to keep your head when it matters most",
      body: "Big moments get in your head before they get on the field. "
    },
    transition: {
      headline: "Get ahead of what's next, before it gets here",
      body: "A new level, a new team, a new chapter — the mental side of a transition matters as much as the physical one. "
    },
    consistency: {
      headline: "Turn one good week into a habit that lasts",
      body: "You don't need a spark — you need a system you can actually stick to. "
    }
  };

  var STORYLINE = {
    doubt: "you catch yourself thinking “I’m about to mess this up”",
    judged: "you feel like everyone's watching and judging you",
    shutdown: "you go quiet and shut down",
    overthink: "you get stuck in your head and can't get out"
  };

  var SHIFT = {
    play_free: "finally play free, without overthinking every touch",
    trust: "trust yourself in the moments that matter most",
    compare: "stop comparing yourself to everyone else",
    enjoy: "actually enjoy playing again"
  };

  var OFFERS = {
    webinars: {
      tag: "Weekly · $30 or $100/4",
      title: "Weekly Public Webinars",
      price: "$30 per session · $100 for a 4-session pass",
      blurb: "Live, low-commitment webinars every Saturday — a great way to start building mental skills before locking into 1-on-1 coaching.",
      href: "you-vs-you.html#webinars",
      cta: "See webinar schedule"
    },
    foundations: {
      tag: "4 Weeks · $300",
      title: "Foundations",
      price: "$300",
      blurb: "A focused 4-week 1-on-1 reset — the core mental skills toolkit, built around exactly what you're dealing with right now.",
      href: "you-vs-you.html",
      cta: "Start Foundations"
    },
    elevate: {
      tag: "12 Weeks · $800",
      title: "Elevate",
      price: "$800",
      blurb: "A deeper 12-week 1-on-1 partnership for athletes ready to make lasting change to how they think, train, and compete.",
      href: "you-vs-you.html",
      cta: "Start Elevate"
    }
  };

  function pickOffer(depth, stage) {
    if (depth === 'tools') return 'webinars';
    if (depth === 'reset') return 'foundations';
    if (depth === 'partnership') return 'elevate';
    // depth === 'unsure'
    if (stage === 'youth' || stage === 'highschool') return 'foundations';
    if (stage === 'college' || stage === 'pro') return 'elevate';
    return 'foundations';
  }

  function showStep(step) {
    box.querySelectorAll('.quiz-step').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-step') === step);
    });
    var index = STEPS.indexOf(step);
    var pct = step === 'result' ? 100 : ((index + 1) / 5) * 100;
    if (progressBar) progressBar.style.width = pct + '%';
    if (backBtn) backBtn.hidden = (step === '1');
  }

  function renderResult() {
    var offerKey = pickOffer(answers.depth, answers.stage);
    var offer = OFFERS[offerKey];
    var focus = FOCUS[answers.focus] || FOCUS.confidence;
    var stageLabel = STAGE_LABEL[answers.stage] || STAGE_LABEL.mixed;

    document.getElementById('quiz-result-title').textContent = focus.headline;

    var bodyText = focus.body + "As someone " + stageLabel + ", here's where I'd start:";
    if (answers.depth === 'unsure') {
      bodyText += " Not sure yet is a totally normal place to be — here's the starting point I'd recommend, plus a lighter option if you want to test the waters first.";
    }
    document.getElementById('quiz-result-body').textContent = bodyText;

    var reflectionEl = document.getElementById('quiz-result-reflection');
    if (reflectionEl) {
      var storyline = STORYLINE[answers.storyline];
      var shift = SHIFT[answers.shift];
      if (storyline && shift) {
        reflectionEl.textContent = "You said " + storyline + " — and that if that shifted, you'd " + shift + ". That's exactly what this work is for.";
      } else {
        reflectionEl.textContent = '';
      }
    }

    document.getElementById('quiz-result-tag').textContent = offer.tag;
    document.getElementById('quiz-result-offer').textContent = offer.title;
    document.getElementById('quiz-result-price').textContent = offer.price;
    document.getElementById('quiz-result-blurb').textContent = offer.blurb;
    var cta = document.getElementById('quiz-result-cta');
    cta.textContent = offer.cta;
    cta.setAttribute('href', offer.href);

    var secondary = document.getElementById('quiz-result-secondary');
    if (secondary) secondary.hidden = !(answers.depth === 'unsure');
  }

  box.querySelectorAll('.quiz-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var field = btn.closest('.quiz-options').getAttribute('data-field');
      var value = btn.getAttribute('data-value');
      answers[field] = value;

      btn.closest('.quiz-options').querySelectorAll('.quiz-option').forEach(function (opt) {
        opt.classList.remove('is-selected');
      });
      btn.classList.add('is-selected');

      var currentStep = STEPS[history.length - 1];
      var nextIndex = STEPS.indexOf(currentStep) + 1;
      var nextStep = STEPS[nextIndex];

      setTimeout(function () {
        history.push(nextStep);
        if (nextStep === 'result') {
          renderResult();
        }
        showStep(nextStep);
      }, 220);
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (history.length > 1) {
        history.pop();
        showStep(history[history.length - 1]);
      }
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      answers = {};
      history = ['1'];
      box.querySelectorAll('.quiz-option').forEach(function (opt) {
        opt.classList.remove('is-selected');
      });
      showStep('1');
    });
  }

  showStep('1');
}

// ---------- "Team Sessions" quiz (you-vs-you.html) ----------
function initTeamQuiz() {
  var box = document.getElementById('team-quiz-box');
  if (!box) return;

  var TEAM_FOCUS = {
    confidence: {
      title: "Building belief that shows up on game day",
      body: "We'll work on turning practice-field confidence into game-day trust — the specific mental skills that hold up under pressure."
    },
    pressure: {
      title: "Staying composed when the game is on the line",
      body: "We'll cover how to manage stress and arousal so the biggest moments become opportunities instead of threats."
    },
    chemistry: {
      title: "Communicating and trusting each other on the field",
      body: "We'll work on the mental side of being a team — trust, communication, and playing for each other under pressure."
    },
    consistency: {
      title: "Turning a good week into a repeatable standard",
      body: "We'll build routines your team can actually stick to, so a good week becomes the norm instead of the exception."
    },
    unsure: {
      title: "Let's figure out the right starting point together",
      body: "No problem — we'll spend the first few minutes of the session identifying exactly where to focus."
    }
  };

  function showTeamStep(step) {
    box.querySelectorAll('.quiz-step').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-step') === step);
    });
  }

  box.querySelectorAll('.quiz-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-value');
      var focus = TEAM_FOCUS[value] || TEAM_FOCUS.unsure;

      box.querySelectorAll('.quiz-option').forEach(function (opt) {
        opt.classList.remove('is-selected');
      });
      btn.classList.add('is-selected');

      document.getElementById('team-result-title').textContent = focus.title;
      document.getElementById('team-result-body').textContent = focus.body;

      setTimeout(function () {
        showTeamStep('result');
      }, 220);
    });
  });

  var restartBtn = document.getElementById('team-quiz-restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      box.querySelectorAll('.quiz-option').forEach(function (opt) {
        opt.classList.remove('is-selected');
      });
      showTeamStep('1');
    });
  }

  showTeamStep('1');
}
