document.addEventListener("DOMContentLoaded", function () {
  var flashcardContainer = document.getElementById("flashcardContainer");
  var createBtn = document.getElementById("createBtn");
  var createSection = document.getElementById("createSection");
  var addFlashcardBtn = document.getElementById("addFlashcardBtn");
  var startCustomBtn = document.getElementById("startCustomBtn");
  var newQuestionInput = document.getElementById("newQuestion");
  var newAnswerInput = document.getElementById("newAnswer");
  var newFlashcardsContainer = document.getElementById("newFlashcardsContainer");

  var flashcards = [];
  var currentIndex = 0;
  var score = 0;
  var incorrectCards = [];
  var totalCards = 0;
  var completedCards = 0;

  

  // ============ SHOW FLASHCARDS ============
  function showFlashcard() {
    flashcardContainer.innerHTML = "";
    var progressTracker = document.getElementById('progressTracker');
    
    if (currentIndex < flashcards.length && flashcards.length > 0) {
      if (progressTracker) progressTracker.classList.add('show');
    } else {
      if (progressTracker) progressTracker.classList.remove('show');
      return showResult();
    }
    
    var qa = flashcards[currentIndex] || { question: '', answer: '' };
    var question = qa.question;
    var answer = qa.answer;
    var card = document.createElement("div"); 
    card.classList.add("big-flashcard");

    var inner = document.createElement("div"); 
    inner.classList.add("flashcard-inner");

    var front = document.createElement("div"); 
    front.classList.add("flashcard-front");
    front.innerHTML = '<p>' + escapeHtml(question) + '</p><button class="skip-btn">⏭️ Skip</button>';

    var back = document.createElement("div"); 
    back.classList.add("flashcard-back");
    back.innerHTML = '<p>' + escapeHtml(answer) + '</p>' +
      '<div class="answer-buttons">' +
        '<button class="wrong-btn">I Got It Wrong ❌</button>' +
        '<button class="correct-btn">I Got It Right! ✅</button>' +
      '</div>';
    
    inner.appendChild(front); 
    inner.appendChild(back); 
    card.appendChild(inner); 
    flashcardContainer.appendChild(card);

    // Click to flip
    card.addEventListener("click", function (e) { 
      if (e && e.target && e.target.tagName === "BUTTON") return; 
      if (card.classList) card.classList.toggle("flipped");
    });

    // Skip button
    var skipBtn = front.querySelector(".skip-btn");
    if (skipBtn) {
      skipBtn.addEventListener("click", function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        flashcards.push(flashcards.splice(currentIndex, 1)[0]);
        showFlashcard();
      });
    }
    
    // Wrong button
    var wrongBtn = back.querySelector(".wrong-btn");
    if (wrongBtn) {
      wrongBtn.addEventListener("click", function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        incorrectCards.push(flashcards.splice(currentIndex, 1)[0]);
        completedCards++;
        if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
        showFlashcard();
      });
    }
    
    // Correct button
    var correctBtn = back.querySelector(".correct-btn");
    if (correctBtn) {
      correctBtn.addEventListener("click", function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        score++;
        flashcards.splice(currentIndex, 1);
        completedCards++;
        if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
        showFlashcard();
      });
    }
  }

  // ============ RESULT SCREEN ============
  function showResult() {
    var percentage = totalCards > 0 ? Math.round((score / totalCards) * 100) : 0;
    var performance = "📚 Keep Practicing!";
    if (percentage >= 80) performance = "🎉 Excellent!";
    else if (percentage >= 60) performance = "👍 Good Job!";

    var progressBar = '<div class="progress-bar">' +
        '<div class="progress-fill" style="width: ' + percentage + '%"></div>' +
      '</div>';

    flashcardContainer.innerHTML = '<div class="result-screen">' +
        '<h2>' + performance + '</h2>' +
        '<p>Score: ' + score + '/' + totalCards + ' (' + percentage + '%)</p>' +
        progressBar +
        (incorrectCards.length > 0 ? '<button id="repeatIncorrectBtn" class="skip-btn">🔁 Review ' + incorrectCards.length + ' Wrong</button>' : '') +
      '</div>';
    
    var progressTracker = document.getElementById('progressTracker');
    if (progressTracker) progressTracker.classList.remove('show');
    
    var repeatBtn = document.getElementById("repeatIncorrectBtn");
    if (repeatBtn) repeatBtn.addEventListener("click", function () {
      flashcards = incorrectCards.slice(0);
      incorrectCards = [];
      currentIndex = 0;
      score = 0;
      completedCards = 0;
      if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
      showFlashcard();
    });
  }

  // ============ CREATE YOUR OWN ============
  if (createBtn) {
    createBtn.addEventListener("click", function () {
      if (!createSection) return;
      if (createSection.classList && typeof createSection.classList.toggle === 'function') {
        createSection.classList.toggle("hidden");
      } else {
        createSection.style.display = (createSection.style.display === 'none' ? '' : 'none');
      }
    });
  }

  if (addFlashcardBtn && newQuestionInput && newAnswerInput && newFlashcardsContainer) {
    addFlashcardBtn.addEventListener("click", function () {
      var q = newQuestionInput.value.trim();
      var a = newAnswerInput.value.trim();

      if (!q || !a) {
        alert("⚠️ Please enter both question and answer!");
        return;
      }

      flashcards.push({ question: q, answer: a });
      totalCards = flashcards.length;

      if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);

      var div = document.createElement("div");
      div.innerHTML = '<strong>Q:</strong> ' + escapeHtml(q) + '<br><strong>A:</strong> ' + escapeHtml(a);
      newFlashcardsContainer.appendChild(div);

      newQuestionInput.value = "";
      newAnswerInput.value = "";
      if (newQuestionInput.focus) newQuestionInput.focus();
    });

    // Allow Enter key to add flashcard (fallback for keyCode)
    newAnswerInput.addEventListener("keypress", function (e) {
      var code = e.key ? (e.key === 'Enter' ? 13 : 0) : (e.keyCode || e.which || 0);
      if (e.key === 'Enter' || code === 13) {
        if (addFlashcardBtn && addFlashcardBtn.click) addFlashcardBtn.click();
      }
    });
  }

  if (startCustomBtn) {
    startCustomBtn.addEventListener("click", function () {
      if (flashcards.length === 0) {
        alert("⚠️ Please add at least one flashcard first!");
        return;
      }
      if (createSection && createSection.classList) createSection.classList.add("hidden");
      currentIndex = 0;
      score = 0;
      incorrectCards = [];
      completedCards = 0;
      totalCards = flashcards.length;
      if (window.updateProgressTracker) window.updateProgressTracker(completedCards, totalCards);
      showFlashcard();
    });
  }

  // Helper function to escape HTML and prevent XSS
  function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
  }

  /* ============ Hacker / Admin Panel ============ */
  function buildHackerPanel() {
    var overlay = document.createElement('div');
    overlay.id = 'hackerPanelOverlay';

    var panel = document.createElement('div');
    panel.id = 'hackerPanel';

    var header = document.createElement('div');
    header.className = 'panel-header';
    var title = document.createElement('div');
    title.className = 'panel-title';
    title.textContent = 'Hacker Panel — Debug & App Info';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'panel-close';
    closeBtn.textContent = 'Close';
    header.appendChild(title);
    header.appendChild(closeBtn);

    var content = document.createElement('div');
    content.className = 'panel-content';

    var actions = document.createElement('div');
    actions.className = 'panel-actions';
    var copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy JSON';
    var refreshBtn = document.createElement('button');
    refreshBtn.textContent = 'Refresh';
    actions.appendChild(copyBtn);
    actions.appendChild(refreshBtn);

    var pre = document.createElement('pre');
    pre.id = 'hackerPanelPre';

    content.appendChild(actions);
    content.appendChild(pre);

    panel.appendChild(header);
    panel.appendChild(content);
    overlay.appendChild(panel);

    // Close handlers — ensure global flag is cleared when panel is closed
    closeBtn.addEventListener('click', function () { window._hackerPanelOpen = false; if (document.body.contains(overlay)) document.body.removeChild(overlay); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) { window._hackerPanelOpen = false; if (document.body.contains(overlay)) document.body.removeChild(overlay); } });

    function collectInfo() {
      var info = {};
      try {
        var verEl = document.querySelector('.version');
        info.appVersion = verEl ? verEl.textContent : '';
        info.timestamp = new Date().toString();
        info.navigator = {
          userAgent: (navigator && navigator.userAgent) ? navigator.userAgent : '',
          platform: (navigator && navigator.platform) ? navigator.platform : '',
          language: (navigator && navigator.language) ? navigator.language : ''
        };
        info.screen = {
          width: (window && window.screen && window.screen.width) ? window.screen.width : 0,
          height: (window && window.screen && window.screen.height) ? window.screen.height : 0,
          availWidth: (window && window.screen && window.screen.availWidth) ? window.screen.availWidth : 0,
          availHeight: (window && window.screen && window.screen.availHeight) ? window.screen.availHeight : 0
        };
        info.viewport = { innerWidth: window.innerWidth || 0, innerHeight: window.innerHeight || 0 };

        // localStorage (safe read) and sessionStorage
        try {
          var ls = {};
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            try { ls[k] = localStorage.getItem(k); } catch (ex) { ls[k] = '⛔ (unreadable)'; }
          }
          info.localStorage = ls;
        } catch (e) { info.localStorage = { error: String(e) }; }

        try {
          var ss = {};
          for (var j = 0; j < sessionStorage.length; j++) {
            var kj = sessionStorage.key(j);
            try { ss[kj] = sessionStorage.getItem(kj); } catch (ex) { ss[kj] = '⛔ (unreadable)'; }
          }
          info.sessionStorage = ss;
        } catch (e) { info.sessionStorage = { error: String(e) }; }

        // App runtime state (safe copies)
        try { info.appState = { flashcards: (flashcards || []).slice(0), incorrectCards: (incorrectCards || []).slice(0), totalCards: totalCards, completedCards: completedCards, score: score, currentIndex: currentIndex }; } catch (e) { info.appState = { error: String(e) }; }

        // Basic environment
        info.environment = { cookieEnabled: navigator ? !!navigator.cookieEnabled : false, online: navigator ? !!navigator.onLine : false }; 
      } catch (err) { info._error = String(err); }
      return info;
    }

    function refresh() { pre.textContent = JSON.stringify(collectInfo(), null, 2); }
    refresh();

    copyBtn.addEventListener('click', function () {
      try {
        var text = pre.textContent;
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
        } else {
          var ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        }
      } catch (e) { alert('Copy failed: ' + String(e)); }
    });

    refreshBtn.addEventListener('click', refresh);

    return overlay;
  }

  // Secret: open Hacker Panel only when Numpad 1,2,3 are pressed in sequence
  (function () {
    var seq = ['Numpad1', 'Numpad2', 'Numpad3'];
    var idx = 0;
    var lastTime = 0;
    var maxGap = 1500; // ms between key presses
    window._hackerPanelOpen = false;

    function normalizeEventCode(e) {
      if (!e) return null;
      if (e.code) return e.code;
      // Fallback: check key + location
      if (e.key === '1' && e.location === 3) return 'Numpad1';
      if (e.key === '2' && e.location === 3) return 'Numpad2';
      if (e.key === '3' && e.location === 3) return 'Numpad3';
      return null;
    }

    document.addEventListener('keydown', function (e) {
      try {
        var code = normalizeEventCode(e);
        var now = (new Date()).getTime();
        if (lastTime && (now - lastTime) > maxGap) idx = 0;
        lastTime = now;
        if (!code) return;
        if (code === seq[idx]) {
          idx++;
          if (idx >= seq.length) {
            idx = 0;
            // open panel
            if (!window._hackerPanelOpen) {
              try {
                var panel = buildHackerPanel();
                document.body.appendChild(panel);
                window._hackerPanelOpen = true;
              } catch (err) {
                try { alert('Unable to open Hacker Panel: ' + String(err)); } catch (ignore) {}
              }
            }
          }
        } else {
          // wrong key — reset
          idx = 0;
        }
      } catch (ex) {
        idx = 0;
      }
    });
  }());
});
