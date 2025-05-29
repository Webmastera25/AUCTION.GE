document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const form = document.querySelector('form');

  // ბალანსის წამოღება ლოკალიდან ან 0-ის მითითება, თუ არ არსებობს
  let balance = parseFloat(localStorage.getItem('balance'));
  if (isNaN(balance)) {
    balance = 0;
    localStorage.setItem('balance', balance.toFixed(2));
  }

  // ბალანსის განახლება ნავიგაციაში ყველა ელემენტზე (#currentBalance)
  function updateBalanceDisplay() {
    const navBalEls = document.querySelectorAll('#currentBalance');
    navBalEls.forEach(el => {
      el.textContent = balance.toFixed(2) + ' ₾';
    });
  }

  // გვერდზე pay.html გადახდის ფორმის ინიციალიზაცია
  if (form && path.includes('pay.html')) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const username = form.querySelector('#username').value.trim();
      const amount = parseFloat(form.querySelector('#amount').value);
      const method = form.querySelector('#paymentMethod').value;
      const successMessage = document.querySelector('.payment-success');
      const historyList = document.getElementById('paymentHistory');

      if (!username || isNaN(amount) || amount <= 0 || !method) return;

      balance += amount;
      localStorage.setItem('balance', balance.toFixed(2));
      updateBalanceDisplay();
      successMessage.style.display = 'block';

      const li = document.createElement('li');
      li.textContent = `${username} შევსო ბალანსი: ${amount.toFixed(2)} ₾ (${method})`;
      historyList.prepend(li);
      form.reset();
    });
  }

 // რეგისტრაცია
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const users = JSON.parse(localStorage.getItem('users')) || [];

      if (users.find(u => u.email === email)) {
        alert('მომხმარებელი უკვე არსებობს');
        return;
      }

      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('loggedInUser', JSON.stringify(newUser));

      window.location.href = 'index.html';
    });
  }

  // ლოგინი
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      const users = JSON.parse(localStorage.getItem('users')) || [];
      const foundUser = users.find(u => u.email === email && u.password === password);

      if (foundUser) {
        localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
        window.location.href = 'index.html';
      } else {
        alert('არასწორი მონაცემები');
      }
    });
  }
});

// ლოგაუთი
function logout() {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'login.html';
}

// დაცვა
function protectPage() {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user) {
    window.location.href = 'login.html';
  }
}


  updateBalanceDisplay();

  // აუქციონის ნივთის არჩევა და bid.html-ზე გადაყვანა
  window.goToBidPage = (name, image) => {
    localStorage.setItem('selectedItem', name);
    localStorage.setItem('selectedImage', image);
    window.location.href = 'bid.html';
  };

  // bid.html გვერდზე აუქციონის ბიდის ლოგიკა
  const bidContainer = document.querySelector('.bid-container');
  if (bidContainer) {
    const itemNameEl = bidContainer.querySelector('.item-name');
    const itemImageEl = bidContainer.querySelector('.item-image');
    const timerEl = bidContainer.querySelector('.timer');
    const bidInput = bidContainer.querySelector('#bidAmount');
    const errorEl = bidContainer.querySelector('.bid-error');
    const successEl = bidContainer.querySelector('.bid-success');
    const bidsList = bidContainer.querySelector('.bids-list');
    const bidBtn = bidContainer.querySelector('#bidButton');
    const lastBidInfo = bidContainer.querySelector('.last-bid-info');

    // ავსებს აიტემის სახელს და სურათს
    itemNameEl.textContent = localStorage.getItem('selectedItem') || '';
    const img = localStorage.getItem('selectedImage');
    if (img) itemImageEl.src = img;

    const warningSound = new Audio('sound/clock-clock.mp3');
    warningSound.preload = 'play';
    warningSound.volume = 1;

    const clapSound = new Audio('sound/clap-clap.mp3');
    clapSound.preload = 'auto';

    let warningPlayed = false;
    const timerDuration = 24 * 1000; // 25 წამი
    let endTime = Date.now() + timerDuration;
    let timerInterval;

    function startTimer() {
      endTime = Date.now() + timerDuration;
      warningPlayed = false;
      timerEl.style.color = '';
      if (timerInterval) clearInterval(timerInterval);

      timerInterval = setInterval(() => {
        const diff = endTime - Date.now();

        if (diff <= 0) {
          clearInterval(timerInterval);
          timerEl.textContent = 'დასრულებულია';
          bidBtn.disabled = true;
          timerEl.style.color = '';

          // ტაშის ხმა გამარჯვებულის ჩვენებისას
          clapSound.play().catch(() => {});

          // გამარჯვებულის ჩვენება
          const allBids = JSON.parse(localStorage.getItem('allBidHistory') || '{}');
          const itemName = itemNameEl.textContent;
          const bids = allBids[itemName] || [];
          if (bids.length > 0) {
            const winner = bids[0];
            const winnerEl = document.createElement('div');
            winnerEl.className = 'winner-info';
            winnerEl.textContent = `🎉 გამარჯვებული: #${bids.length} - ${winner.user} ბიდით ${winner.amount} ₾ - ${winner.time}`;
            bidContainer.appendChild(winnerEl);
          }
          return;
        }

        if (!warningPlayed && diff <= 25000 && diff > 0) {
          warningSound.play().catch(() => {});
          warningPlayed = true;
          timerEl.style.color = 'red';
        }

        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        timerEl.textContent = `დრო დასრულებამდე: ${m} წთ ${s} წმ`;
      }, 1000);
    }

    // ტაიმერის დასაწყებად გვერდის ჩატვირთვაზე
    startTimer();

    updateBalanceDisplay();

    bidBtn.addEventListener('click', () => {
      const amt = parseFloat(bidInput.value);

      bidBtn.classList.add('loading');
      bidBtn.textContent = 'ბიდი იგზავნება...';
      setTimeout(() => {
        bidBtn.classList.remove('loading');
        bidBtn.textContent = 'ბიდის დადება';
      }, 1500);

      if (isNaN(amt) || amt !== 1) {
        errorEl.textContent = '❌ ბიდი უნდა იყოს ზუსტად 1₾';
        errorEl.style.display = 'block';
        successEl.style.display = 'none';
        return;
      }

      if (amt > balance) {
        errorEl.textContent = '❌ ბალანსი არ გყოფნით';
        errorEl.style.display = 'block';
        successEl.style.display = 'none';
        return;
      }

      // ბიდის ისტორიის წამოღება ლოკალიდან
      const allBids = JSON.parse(localStorage.getItem('allBidHistory') || '{}');
      const itemName = itemNameEl.textContent;
      if (!allBids[itemName]) allBids[itemName] = [];

      const newBidNumber = allBids[itemName].length + 1;

      const newBid = {
        amount: amt.toFixed(2),
        time: new Date().toLocaleString(),
        user: localStorage.getItem('username') || 'უცნობი'
      };

      allBids[itemName].unshift(newBid);
      localStorage.setItem('allBidHistory', JSON.stringify(allBids));

      balance -= amt;
      localStorage.setItem('balance', balance.toFixed(2));
      updateBalanceDisplay();

      errorEl.style.display = 'none';
      successEl.textContent = `✅ ბიდი მიღებულია №${newBidNumber}`;
      successEl.style.display = 'block';

      const div = document.createElement('div');
      div.textContent = `#${newBidNumber} – ${newBid.amount} ₾ — ${newBid.user} — ${newBid.time}`;
      bidsList.appendChild(div);

      if(lastBidInfo) {
        lastBidInfo.textContent = `ბოლო ბიდი: ${newBid.amount} ₾ — ${newBid.user} (${newBid.time})`;
      }

      bidInput.value = '';

      // ბიდის დადებისას ტაიმერის გადატვირთვა
      startTimer();
    });
  }

 
  // 5) აუქციონის სტატუსი
  document.querySelectorAll('.item-card').forEach(card => {
    const badge = card.querySelector('.status-badge');
    const btn = card.querySelector('button');
    const cd = card.querySelector('.countdown');
    const end = new Date(card.dataset.endtime).getTime();
    const iv2 = setInterval(() => {
      let diff = end - Date.now();
      if (diff <= 0) {
        badge.textContent = 'დასრულებულია';
        badge.classList.replace('active', 'ended');
        if (btn) btn.textContent = 'დასრულებულია', btn.disabled = true;
        cd.textContent = 'დასრულებულია';
        clearInterval(iv2);
        return;
      }
      const days = Math.floor(diff / 86400000); diff %= 86400000;
      const hrs = Math.floor(diff / 3600000); diff %= 3600000;
      const mins = Math.floor(diff / 60000); diff %= 60000;
      const secs = Math.floor(diff / 1000);
      const fmt = n => String(n).padStart(2, '0');
      //badge.textContent = 'აქტიური';
      badge.classList.replace('ended', 'active');
      if (btn) btn.textContent = 'ბიდის დადება', btn.disabled = false;
      cd.textContent = `დარჩა:${fmt(days)}დღე${fmt(hrs)}სთ${fmt(mins)}წთ${fmt(secs)}წმ`;
    }, 1000);
  });


});

document.getElementById('loadMoreNews').addEventListener('click', () => {
  const extraNews = document.querySelector('.additional-news');
  extraNews.classList.remove('d-none');
  document.getElementById('loadMoreNews').style.display = 'none';
});


document.getElementById('newsForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const title = document.getElementById('newsTitle').value;
  const text = document.getElementById('newsText').value;
  const container = document.getElementById('newsPreview');

  const col = document.createElement('div');
  col.className = 'col';
  col.innerHTML = `
    <div class="card h-100 shadow-sm">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${text}</p>
      </div>
    </div>
  `;
  container.prepend(col);

  document.getElementById('newsForm').reset();
});


// ადმინ პანელის გვერდის ფუნქცია

const newsForm = document.getElementById('newsForm');
const newsContainer = document.getElementById('newsContainer');

let newsData = JSON.parse(localStorage.getItem('newsData')) || [];

function renderNews() {
  newsContainer.innerHTML = '';
  newsData.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML = `
      <h4>${item.title}</h4>
      <p>${item.text}</p>
      ${item.image ? `<img src="${item.image}" alt="სიახლის სურათი" class="img-fluid">` : ''}
      <div class="mt-2">
        <button class="btn btn-sm btn-warning me-2" onclick="editNews(${index})">✏️ რედაქტირება</button>
        <button class="btn btn-sm btn-danger" onclick="deleteNews(${index})">🗑️ წაშლა</button>
      </div>
    `;
    newsContainer.appendChild(div);
  });
}

newsForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('newsTitle').value.trim();
  const text = document.getElementById('newsText').value.trim();
  const imageInput = document.getElementById('newsImage');
  const file = imageInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      newsData.unshift({ title, text, image: e.target.result });
      localStorage.setItem('newsData', JSON.stringify(newsData));
      renderNews();
    };
    reader.readAsDataURL(file);
  } else {
    newsData.unshift({ title, text });
    localStorage.setItem('newsData', JSON.stringify(newsData));
    renderNews();
  }

  newsForm.reset();
});

function deleteNews(index) {
  if (confirm('დარწმუნებული ხარ რომ გსურს წაშლა?')) {
    newsData.splice(index, 1);
    localStorage.setItem('newsData', JSON.stringify(newsData));
    renderNews();
  }
}

function editNews(index) {
  const item = newsData[index];
  document.getElementById('newsTitle').value = item.title;
  document.getElementById('newsText').value = item.text;
  document.getElementById('newsImage').value = '';
  newsData.splice(index, 1);
  renderNews();
}

renderNews();

// სიახლეების ადმინ პანელის ფუნქცია
[
  {
    "title": "ახალი აუქციონი",
    "description": "დღეს დაიწყო ახალი აუქციონი iPhone-ზე",
    "image": "data:image/png;base64,...."
  }
]

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.news-section');
  const news = JSON.parse(localStorage.getItem('news') || '[]');

  container.innerHTML = ''; // გაწმენდა

  news.forEach(n => {
    const block = document.createElement('div');
    block.className = 'news-items';
    block.innerHTML = `
      <h3>${n.title}</h3>
      <p>${n.description}</p>
      ${n.image ? `<img src="${n.image}" style="max-width:100%; height:auto;">` : ''}
    `;
    container.appendChild(block);
  });
});
