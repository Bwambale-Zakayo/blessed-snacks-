'use strict';
/* =========================================================
   Blessed Snacks – single-page website
   Data is stored in the browser (localStorage). Orders are
   sent to the restaurant through WhatsApp.
   ========================================================= */
const WA_NUMBER = '256787741832';   // 0787741832 in international format
const PHONE_DISPLAY = '0787741832';
const STAFF_PIN = '1234';           // CHANGE THIS – used to update order status on this device

/* ---------- Delivery areas (UGX) – edit freely ---------- */
const AREAS = [
  ['Kampala Central', 5000], ['Nakasero', 5000], ['Kololo', 5000], ['Nsambya', 5000], ['Kamwokya', 4000],
  ['Bukoto', 4000], ['Ntinda', 5000], ['Naguru', 4000], ['Nakawa', 5000], ['Bugolobi', 5000],
  ['Wandegeya', 4000], ['Makerere', 4000], ['Mulago', 4000], ['Mengo', 5000], ['Rubaga', 5000],
  ['Kisaasi', 5000], ['Kyanja', 6000], ['Najjera', 6000], ['Kiwatule', 6000], ['Mutungo', 5000],
  ['Banda', 5000], ['Kabalagala', 5000], ['Kansanga', 6000], ['Muyenga', 6000], ['Makindye', 6000],
  ['Luzira', 7000], ['Kira', 7000], ['Namugongo', 8000], ['Munyonyo', 7000], ['Entebbe Road / Zana', 8000],
  ['Other area in Kampala (confirm on WhatsApp)', 8000]
];

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => 'UGX ' + Number(n).toLocaleString('en-US');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };
const fmtDate = iso => iso ? new Date(iso).toLocaleString('en-GB', { timeZone: 'Africa/Kampala', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
const img = (kw, seed, w = 480, h = 360) => `https://loremflickr.com/${w}/${h}/${kw}?lock=${seed}`;
window.imgFail = (el, emoji) => {
  el.onerror = null;
  el.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="100%" height="100%" fill="#fde6c8"/><text x="50%" y="58%" font-size="120" text-anchor="middle">${emoji}</text></svg>`);
};
const imgTag = (kw, seed, emoji, alt = '', w, h) => `<img loading="lazy" src="${img(kw, seed, w, h)}" alt="${esc(alt)}" onerror="imgFail(this,'${emoji}')">`;

/* =========================================================
   MENU DATA   [name, price, image keywords, optional note]
   ========================================================= */
const CAT = {};      // id -> item
let SEED = 1;
function build(page, sections) {
  return sections.map((s, si) => ({
    id: `${page}-${si}`, title: s.title, emoji: s.emoji,
    items: s.items.map((a, i) => {
      const it = { id: `${page}-${si}-${i}`, name: a[0], price: a[1], kw: a[2], note: a[3] || '', emoji: s.emoji, page, seed: SEED++ };
      CAT[it.id] = it; return it;
    })
  }));
}

const MENU = {
  snacks: build('snacks', [
    {
       title: 'Rolex', emoji: '🌯', 
      items: [
        [
          'Egg Rolex', 5000, 'omelette,chapati'
        ],
        
        [
          'Beef Mince Rolex', 8000, 'beef,wrap'
        ],
        
        [
          'Chicken Rolex', 10000, 'chicken,wrap'
        ],
        
        [
          'Liver Rolex', 9000, 'wrap,sandwich'
        ]
      ]
     },

    { 
      title: 'Kikomando', emoji: '🥞', 
      items: [
        [
          'Beans Kikomando', 7000, 'chapati,beans'
        ], 
        
        [
          'Beef Mince Kikomando', 10000, 'chapati,beef'
        ], 
        
        [
          'Chicken Kikomando', 14000, 'chapati,chicken'
        ],
        
        [
          'Liver Kikomando', 13000, 'chapati,stew'
        ]
      ] 
    },

    { 
      title: 'Snacks & Sides (Updated)', emoji: '🌭',
       items: [
        [
          'Sausage', 1500, 'sausage,grilled'
        ],
        
        [
          'Chapati', 1000, 'chapati,flatbread'
        ],
        
        [
          'Mandazi', 1000, 'doughnut,fried'
        ],
        
        [
          'Fried Gonja (Plantain)', 5000, 'fried,plantain'
        ]
      ]
     },

    { 
      title: 'Crispy Chicken', emoji: '🍗',
       items: [
        [
          'Crispy Chicken Wings (6 pcs)', 15000, 'fried,chicken,wings'
        ], 
        
        [
          'Crispy Chicken Wings (10 pcs)', 22000, 'crispy,chicken'
        ]
      ]
     },

    {
       title: 'Rolex Combos', emoji: '🌯',
       items: [
        [
          'Egg Rolex + Sausage', 6000, 'omelette,sausage'],
           [
            'Beef Mince Rolex + Sausage', 9500, 'wrap,sausage'
          ],

           [
            'Chicken Rolex + Soda', 11500, 'wrap,soda'
          ], 
          
          [
            'Liver Rolex + Sausage', 10500, 'wrap,grill'
          ]
        ]
       },

    { 
      title: 'Kikomando Combos', emoji: '🥞',
       items: [
        [
          'Beans Kikomando + Sausage', 8000, 'beans,sausage'],
           [
            'Beef Mince Kikomando + Soda', 11500, 'beef,soda'
          ], 
          
          [
            'Chicken Kikomando + Soda', 15500, 'chicken,cola'
          ],
          
          [
            'Liver Kikomando + Sausage', 14500, 'meat,sausage'
          ]
        ]
       },
    
          { 
            title: 'Wing Combos', emoji: '🍗', 
      items: [
        [
          '6 Wings + Soda', 17000, 'wings,cola'],
           [
            '6 Wings + Chapati', 16000, 'wings,bread'
          ], 
          
          [
            '6 Wings + Gonja', 18000, 'wings,plantain'
          ], 
          
          [
            '10 Wings + 2 Sodas', 25000, 'wings,drinks'
          ]
        ]
       },

    {
       title: 'Value / Student Combos', emoji: '🎓', 
      items: [
        [
          'Chapati + Beans + Sausage', 5000, 'beans,chapati'
        ],
           [
            'Mandazi (2 pcs)', 2000, 'donut,fried'
           ], 
           [
            'Gonja + Sausage', 6500, 'plantain,sausage'
           ]
          ]
         }
  ]),

  foods: build('foods', [
    { 
      title: 'Local Favourites', emoji: '🍛',
       items: [
        [
          'Matooke & Beef Stew', 12000, 'matooke,stew', 'Steamed matooke with rich beef stew'
        ],

         ['Matooke & Groundnut Sauce', 10000, 'plantain,peanut,sauce'], ['Posho & Beans', 6000, 'beans,maize,meal'], ['Katogo (Matooke & Offals)', 9000, 'stew,plantain'], ['Chapati & Beef Stew', 9000, 'chapati,stew'], ['Luwombo (Chicken)', 20000, 'chicken,steamed,leaf', 'Order 1 hour ahead']] },
    { 
      title: 'Rice & Pilau', emoji: '🍚', 
      items: [
        [
          'Beef Pilau', 13000, 'pilau,rice'
        ],

         ['Chicken Pilau', 15000, 'chicken,rice'], ['Rice & Beef Stew', 12000, 'rice,beef,stew'], ['Rice & Beans', 8000, 'rice,beans']] },
    { 
      title: 'Chicken & Chips', emoji: '🍟',
       items: [
        [
          'Chicken & Chips (Quarter)', 18000, 'chicken,chips'
        ], 

        [
          'Chicken & Chips (Half)', 30000, 'roast,chicken,fries'
        ], 
        
        [
          'Fish & Chips', 20000, 'fish,chips'
        ], 
        
        [
          'Chips Masala', 10000, 'fries,masala'
        ],
        
        [
          'Chips & Sausage', 9000, 'fries,sausage'
        ]
      ]
     },

    {
       title: 'Burgers & Light Bites', emoji: '🍔',
        items: [
          [
            'Beef Burger', 14000, 'beef,burger'
          ], 

          [
            'Chicken Burger', 15000, 'chicken,burger'
          ],
          
          [
            'Chicken Samosas (3 pcs)', 6000, 'samosa'
          ], 
          
          [
            'Spaghetti & Sausage', 10000, 'spaghetti,sausage'
          ], 
          
          [
            'Club Sandwich', 14000, 'club,sandwich'
          ]
        ]
       }
  ]),
  drinks: build('drinks', [
    { 
      title: 'Dawa Teas', emoji: '🍵', 
      items: [
        [
          'Classic Dawa Tea', 5000, 'ginger,honey,tea'
        ],
        
        [
          'Ginger Dawa', 5000, 'ginger,tea'
        ],
        
        [
          'Lemon Honey Dawa', 6000, 'lemon,honey,tea'
        ]
      ]
     },

    { 
      title: 'Kiddie Drinks', emoji: '🧃', 
      items: [
        [
          'Kiddie Strawberry Milk', 3500, 'strawberry,milk'
        ], 
        
        [
          'Kiddie Choco Shake', 4500, 'chocolate,milkshake'
        ],
        
        [
          'Kiddie Fruit Punch', 3500, 'fruit,punch'
        ]
      ]
     },

    {
       title: 'Creamy Milkshakes', emoji: '🥛', 
       items: [
        [
          'Vanilla Milkshake', 8000, 'vanilla,milkshake'
        ], 
        
        [
          'Chocolate Milkshake', 8000, 'chocolate,milkshake'
        ],
        
        [
          'Strawberry Milkshake', 8000, 'strawberry,milkshake'
        ],

         [
          'Oreo Milkshake', 10000, 'oreo,milkshake'
        ]
      ]
     },

    {
       title: 'Real Fruit Smoothies', emoji: '🥭',
        items: [
          [
            'Mango Smoothie', 8000, 'mango,smoothie'
          ], 
          
          [
            'Passion Smoothie', 8000, 'passionfruit,smoothie'
          ],
          
          [
            'Pineapple Smoothie', 7000, 'pineapple,smoothie'
          ],
          
          [
            'Mixed Berry Smoothie', 9000, 'berry,smoothie'
          ]
        ]
       },

    { 
      title: 'Fruit Boosters', emoji: '🍊',
       items: [
        [
          'Immune Booster', 7000, 'orange,ginger,juice'
        ], 
        
        [
          'Energy Booster', 7000, 'banana,smoothie'
        ], 
        
        [
          'Green Detox Booster', 8000, 'green,juice'
        ]
      ]
     },

    {
       title: 'Speciality Juices', emoji: '🍹',
        items: [
          [
            'Fresh Passion Juice', 5000, 'passionfruit,juice'
          ], 
          
          [
            'Fresh Pineapple Juice', 5000, 'pineapple,juice'
          ],
          
          [
            'Watermelon Juice', 5000, 'watermelon,juice'
          ],

           [
            'Beetroot, Carrot & Ginger', 7000, 'beetroot,juice'
          ]] },
    { 
      title: 'Refreshing Iced Teas', emoji: '🧊',
       items: [
        [
          'Lemon Iced Tea', 6000, 'iced,tea,lemon'
        ],
        
        ['Peach Iced Tea', 6000, 'peach,iced,tea'], ['Hibiscus Iced Tea', 6000, 'hibiscus,tea']] },
    {
       title: 'Handcrafted Lemonades', emoji: '🍋', 
       items: [
        [
          'Classic Lemonade', 5000, 'lemonade'
        ],
        
        ['Mint Lemonade', 6000, 'mint,lemonade'], ['Strawberry Lemonade', 7000, 'strawberry,lemonade']] },
    {
       title: 'Coladas', emoji: '🍍',
        items: [
          [
            'Pina Colada (Virgin)', 10000, 'pina,colada'
          ], 
          
          [
            'Strawberry Colada', 10000, 'strawberry,colada'
          ],
          
          [
            'Mango Colada', 10000, 'mango,drink'
          ]
        ]
       },
    {
       title: 'Nojitos', emoji: '🌿',
        items: [
          [
            'Classic Nojito', 9000, 'mojito,mint'
          ], 
          
          [
            'Strawberry Nojito', 10000, 'strawberry,mojito'
          ], 
          
          [
            'Passion Nojito', 10000, 'passionfruit,mojito'
          ]
        ]
       },

    {
       title: 'Chocolate', emoji: '🍫', 
       items: [
        [
          'Hot Chocolate', 6000, 'hot,chocolate'
        ],
        
        [
          'Iced Chocolate', 8000, 'iced,chocolate'
        ]
      ]
     },

    {
       title: 'Teas', emoji: '🫖',
        items: [
          [
            'Black Tea', 3000, 'black,tea,cup'
          ], 
          
          [
            'Milk Tea', 4000, 'milk,tea'
          ], 
          
          [
            'Green Tea', 4000, 'green,tea'
          ]
        ]
       },

    { 
      title: 'Coffees', emoji: '☕', 
      items: [
        [
          'Espresso', 5000, 'espresso'
        ], 
        
        [
          'Cappuccino', 7000, 'cappuccino'
        ],
        
        [
          'Latte', 7000, 'latte,coffee'
        ],
        
        [
          'Iced Coffee', 8000, 'iced,coffee'
        ]
      ]
     },

    { 
      title: 'Sodas & Water', emoji: '🥤',
       items: [
        [
          'Soda (300ml)', 2000, 'soda,bottle'
        ], 
        
        [
          'Bottled Water', 1500, 'water,bottle'
        ]
      ]
     }
  ]),
  desserts: build('desserts', [
    {
       title: 'Classic Cakes', emoji: '🍰',
        items: [
          [
            'Chocolate Cake', 50000, 'chocolate,cake', 'From 1 kg'
          ], 
          
          [
            'Vanilla Cake', 45000, 'vanilla,cake', 'From 1 kg'
          ],
          
          [
            'Red Velvet Cake', 60000, 'red,velvet,cake', 'From 1 kg'
          ],
          
          [
            'Black Forest Cake', 55000, 'black,forest,cake', 'From 1 kg'
          ],

           [
            'White Forest Cake', 55000, 'white,forest,cake', 'From 1 kg'
          ],
          
          [
            'Strawberry Cake', 50000, 'strawberry,cake', 'From 1 kg'
          ], 
          
          [
            'Fruit Cake', 55000, 'fruit,cake', 'From 1 kg'
          ],
          
          [
            'Coconut Cake', 48000, 'coconut,cake', 'From 1 kg'
          ],
          
          [
            'Lemon Cake', 48000, 'lemon,cake', 'From 1 kg'
          ],
          
          [
            'Carrot Cake', 52000, 'carrot,cake', 'From 1 kg'
          ]
        ]
       },
    {
       title: 'Celebration Cakes', emoji: '🎉',
        items: [
          [
            'Birthday Cake', 60000, 'birthday,cake', 'Custom message included'
          ],
          
          [
            'Graduation Cake', 70000, 'graduation,cake'
          ], 
          
          [
            'Anniversary Cake', 70000, 'anniversary,cake'
          ],
          
          [
            'Baby Shower Cake', 75000, 'baby,shower,cake'
          ],
          
          [
            "Kid's Character Cake", 80000, 'kids,cartoon,cake'
          ],

           [
            'Heart-Shaped Cake', 65000, 'heart,shaped,cake'
          ]
        ]
       },
    {
       title: 'Premium Designs', emoji: '👑',
        items: [
          [
            'Chocolate Drip Cake', 85000, 'chocolate,drip,cake'
          ],
          
          [
            'Floral Cake', 90000, 'floral,cake'
          ],
          
          [
            'Fondant Cake', 120000, 'fondant,cake'
          ],
          
          [
            'Naked Cake', 75000, 'naked,cake'
          ],
          
          [
            'Tiered / Wedding Cake', 350000, 'wedding,cake,tiered', 'Price depends on tiers'
          ],
           
          [
            'Luxury Gold Cake', 150000, 'gold,luxury,cake'
          ],
          
          [
            'Photo Cake', 90000, 'photo,cake'
          ],
          
          [
            '3D / Sculpted Cake', 200000, 'sculpted,3d,cake'
          ]
        ]
       },
    {
       title: 'Smaller Options', emoji: '🧁', 
       items: [
        [
          'Cupcakes (box of 6)', 24000, 'cupcakes'
        ],
        
        [
          'Bento Cake', 25000, 'bento,cake'
        ],
        
        [
          'Mini Cakes', 8000, 'mini,cake', 'Price per piece'
        ],
        
        [
          'Cake Slices', 6000, 'cake,slice'
        ]
      ]
     }
  ])

};
const PAGE_ORDER = ['snacks', 'foods', 'drinks', 'desserts'];

/* =========================================================
   STATE
   ========================================================= */
let cart = load('bs_cart', []);          // [{id, qty}]
let orders = load('bs_orders', []);
let users = load('bs_users', {});
let user = load('bs_user', null);
let feedbacks = load('bs_feedback', []);
const STEPS = ['Pending', 'Confirmed', 'Preparing', 'Delivered'];

const cartCount = () => cart.reduce((a, c) => a + c.qty, 0);
const cartSubtotal = () => cart.reduce((a, c) => a + (CAT[c.id] ? CAT[c.id].price * c.qty : 0), 0);
const saveCart = () => { store('bs_cart', cart); updateCartUI(); };

function addToCart(id, qty = 1, silent = false) {
  const row = cart.find(c => c.id === id);
  if (row) row.qty += qty; else cart.push({ id, qty });
  saveCart();
  if (!silent) toast('Added to cart', `${CAT[id].name} – ${fmt(CAT[id].price)}`);
}
function setQty(id, q) {
  const row = cart.find(c => c.id === id); if (!row) return;
  row.qty = q; if (row.qty <= 0) cart = cart.filter(c => c.id !== id);
  saveCart(); route();
}
function updateCartUI() {
  $('#cartCount').textContent = cartCount();
  $('#cartCount').classList.toggle('hidden', cartCount() === 0);
  const page = currentPage();
  const bar = $('#cartBar');
  if (cartCount() > 0 && !['cart', 'checkout'].includes(page)) {
    bar.classList.remove('hidden');
    bar.innerHTML = `<span>🛒 <b>${cartCount()}</b> item${cartCount() > 1 ? 's' : ''} · <b>${fmt(cartSubtotal())}</b></span><a class="btn gold small" href="#/cart">View Cart</a><a class="btn small" href="#/checkout">Order Now</a>`;
  } else bar.classList.add('hidden');
  const nb = $('#navCartBadge'); if (nb) { nb.textContent = cartCount(); nb.classList.toggle('hidden', !cartCount()); }
}

/* =========================================================
   TOASTS & NOTIFICATIONS
   ========================================================= */
function toast(title, msg = '', warn = false) {
  const t = document.createElement('div');
  t.className = 'toast' + (warn ? ' warn' : '');
  t.innerHTML = `<b>${esc(title)}</b>${esc(msg)}`;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 4800);
}
function notify(title, msg) {
  toast(title, msg);
  try { if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body: msg }); } catch { /* ignore */ }
}

/* =========================================================
   NAVIGATION (on the RIGHT, top-to-bottom)
   ========================================================= */
const NAV = [
  ['home', 'Home', '🏠'], ['menu', 'Menu', '📖'],
  ['snacks', 'Snacks', '🌯', 1], ['foods', 'Foods', '🍛', 1], ['drinks', 'Drinks', '🥤', 1], ['desserts', 'Desserts & Cakes', '🎂', 1],
  ['track', 'Track Order', '📦'], ['about', 'About Us (Contact)', 'ℹ️'], ['feedback', 'Feedback', '💬'],
  ['careers', 'Careers', '💼'], ['cart', 'Cart', '🛒'], ['location', 'Location', '📍']
];
function renderNav() {
  const cur = currentPage();
  $('#sideNav').innerHTML = `
    <a class="nav-cta" href="${cartCount() ? '#/checkout' : '#/menu'}">🍽️ Order Now</a>
    <h5>Pages</h5>
    ${NAV.map(([k, label, em, sub]) => `<a class="nav-link ${sub ? 'sub' : ''} ${cur === k ? 'active' : ''}" href="#/${k}"><span class="em">${em}</span>${label}${k === 'cart' ? `<span id="navCartBadge" class="nav-badge ${cartCount() ? '' : 'hidden'}">${cartCount()}</span>` : ''}</a>`).join('')}`;
}
const currentPage = () => (location.hash.replace(/^#\//, '').split('?')[0]) || 'home';
const queryParam = k => new URLSearchParams(location.hash.split('?')[1] || '').get(k);

/* =========================================================
   REUSABLE UI PIECES
   ========================================================= */
const head = (title, sub, emoji) => `<div class="page-head" data-emoji="${emoji}"><h1>${title}</h1><p>${sub}</p></div>`;
const footer = () => `<footer class="foot">© ${new Date().getFullYear()} Blessed Snacks · Call/WhatsApp <a href="tel:+${WA_NUMBER}">${PHONE_DISPLAY}</a> · <a href="#/location">Find us</a></footer>`;
function card(it) {
  return `<article class="card"><div class="card-img">${imgTag(it.kw, it.seed, it.emoji, it.name)}</div>
  <div class="card-body"><h4>${esc(it.name)}</h4>${it.note ? `<p class="note">${esc(it.note)}</p>` : ''}<div class="price">${fmt(it.price)}</div>
  <div class="card-actions"><button class="btn small ghost" data-add="${it.id}">+ Add to Cart</button><button class="btn small" data-order="${it.id}">Order Now</button></div></div></article>`;
}
function stepper(active) {
  const s = ['Menu', 'Add to cart', 'Cart', 'Order now', 'Complete your order'];
  return `<div class="stepper">${s.map((x, i) => `<span class="${i < active ? 'done' : i === active ? 'on' : ''}">${i + 1}. ${x}</span>${i < s.length - 1 ? '<i>→</i>' : ''}`).join('')}</div>`;
}

/* =========================================================
   PAGES
   ========================================================= */
function pageHome() {
  const pick = (page, ids) => ids.map(i => CAT[`${page}-${i}`]);
  const marqueeA = [...pick('snacks', ['0-0', '0-1', '0-2', '1-1', '2-3', '3-0', '3-1', '4-0', '6-0']), ...pick('foods', ['0-0', '2-0'])];
  const marqueeB = [...pick('foods', ['0-0', '1-0', '2-0', '2-2', '3-0', '3-1']), ...pick('desserts', ['0-0', '0-2', '2-0'])];
  const marqueeC = pick('drinks', ['2-0', '2-1', '3-0', '3-1', '5-0', '7-0', '8-0', '12-1', '11-1']);
  const row = (items, rev = false, title = '') => {
    const html = items.map(it => `<a class="m-item" href="#/${it.page}"><span style="width:52px;height:52px;border-radius:50%;overflow:hidden;display:block;flex-shrink:0">${imgTag(it.kw, it.seed, it.emoji, it.name, 160, 160)}</span><span><b>${esc(it.name)}</b><small>${fmt(it.price)}</small></span></a>`).join('');
    return `<div class="marquee-title">${title}</div><div class="marquee ${rev ? 'rev' : ''}"><div class="marquee-track">${html}${html}</div></div>`;
  };
  const popular = [CAT['snacks-0-2'], CAT['snacks-1-1'], CAT['snacks-3-0'], CAT['snacks-6-0']];
  return `
  <section class="hero">
    <div><h1>Taste the <span>Blessing</span> in every bite</h1>
      <p>Hot Rolex, loaded Kikomando, crispy chicken wings, hearty meals, fresh drinks and cakes for every celebration – delivered across Kampala.</p>
      <div class="hero-btns"><a class="btn gold" href="#/menu">🍽️ Order Now</a><a class="btn light" href="#/snacks">View Snacks</a></div></div>
    <div class="hero-pics">${imgTag('rolex,chapati,egg', 901, '🌯', 'Rolex', 400, 400)}${imgTag('fried,chicken,wings', 902, '🍗', 'Crispy wings', 400, 400)}${imgTag('sausage,grill', 903, '🌭', 'Sausages', 400, 400)}<span class="sticker">From UGX 1,000!</span></div>
  </section>

  <section class="marquee-wrap" aria-label="Our snacks, foods and drinks">
    ${row(marqueeA, false, '🌯 Snacks we love')}${row(marqueeB, true, '🍛 Foods & cakes')}${row(marqueeC, false, '🥤 Fresh drinks')}
  </section>

  <h2 class="sec-title">Explore our menu</h2>
  <div class="tiles">
    ${[['snacks', 'Snacks', 'Rolex, Kikomando, wings & combos', 'rolex,chapati', 801], ['foods', 'Foods', 'Matooke, pilau, chips & more', 'matooke,stew', 802], ['drinks', 'Drinks', 'Smoothies, milkshakes, teas & coffees', 'smoothie,juice', 803], ['desserts', 'Desserts & Cakes', 'Classic, celebration & premium cakes', 'chocolate,cake', 804]]
      .map(([k, t, p, kw, s]) => `<a class="tile" href="#/${k}">${imgTag(kw, s, '🍽️', t)}<div><h3>${t}</h3><p>${p}</p></div></a>`).join('')}
  </div>

  <h2 class="sec-title">⭐ Customer favourites</h2>
  <div class="grid">${popular.map(card).join('')}</div>

  <div class="promo"><div><h3>🎓 Student Combos from UGX 2,000</h3><p>Chapati + Beans + Sausage for just UGX 5,000.</p></div><a class="btn" href="#/snacks">Grab a combo</a></div>

  <h2 class="sec-title">Why Blessed Snacks?</h2>
  <div class="features">
    <div class="feature"><div class="big">🔥</div><h4>Fresh &amp; hot</h4><p>Cooked when you order.</p></div>
    <div class="feature"><div class="big">🛵</div><h4>Kampala delivery</h4><p>Ntinda, Bukoto, Central &amp; more.</p></div>
    <div class="feature"><div class="big">💬</div><h4>Order on WhatsApp</h4><p>Quick, simple and personal.</p></div>
    <div class="feature"><div class="big">🎂</div><h4>Cakes for every day</h4><p>From cupcakes to wedding cakes.</p></div>
  </div>${footer()}`;
}

function pageMenu() {
  const t = [['snacks', 'Snacks', '🌯', 'Rolex, Kikomando, wings, combos', 'rolex,chapati', 801], ['foods', 'Foods', '🍛', 'Local favourites, rice, chips, burgers', 'matooke,stew', 802], ['drinks', 'Drinks', '🥤', 'Dawa teas, milkshakes, smoothies, coffees…', 'smoothie,juice', 803], ['desserts', 'Desserts & Cakes', '🎂', 'Classic, celebration, premium & small cakes', 'chocolate,cake', 804]];
  return `${stepper(0)}${head('Our Menu', 'Pick a category, add your favourites to the cart, then press <b>Order Now</b>.', '📖')}
  <div class="tiles">${t.map(([k, n, e, p, kw, s]) => `<a class="tile" href="#/${k}">${imgTag(kw, s, e, n)}<div><h3>${e} ${n}</h3><p>${p}</p></div></a>`).join('')}</div>
  <div class="promo"><div><h3>Ready to eat?</h3><p>${cartCount() ? `You have ${cartCount()} item(s) in your cart.` : 'Your cart is empty – add something tasty!'}</p></div><a class="btn" href="${cartCount() ? '#/checkout' : '#/snacks'}">${cartCount() ? 'Order Now' : 'Start with Snacks'}</a></div>${footer()}`;
}

function pageCatalog(page) {
  const meta = {
    snacks: ['Snacks', 'Hot Rolex, Kikomando, crispy chicken wings, sides and combos.', '🌯'],
    foods: ['Foods', 'Filling meals made fresh – prices can be edited in app.js.', '🍛'],
    drinks: ['Drinks', 'Dawa teas, kiddie drinks, milkshakes, smoothies, juices, coladas, nojitos, coffees and more.', '🥤'],
    desserts: ['Desserts & Cakes', 'Cakes for every moment. Please order cakes at least 24 hours ahead; custom designs are confirmed on WhatsApp.', '🎂']
  }[page];
  const secs = MENU[page];
  return `${stepper(1)}${head(...meta)}
  <div class="chips">${secs.map(s => `<button class="chip" data-scroll="${s.id}">${s.emoji} ${s.title}</button>`).join('')}</div>
  ${secs.map(s => `<section id="${s.id}" style="scroll-margin-top:130px"><h3 class="sec-title">${s.emoji} ${s.title}</h3><div class="grid">${s.items.map(card).join('')}</div></section>`).join('')}${footer()}`;
}

function pageCart() {
  if (!cart.length) return `${stepper(2)}<div class="panel empty"><div class="big">🛒</div><h2>Your cart is empty</h2><p>Browse the menu and add something delicious.</p><br><a class="btn" href="#/menu">Go to Menu</a></div>${footer()}`;
  return `${stepper(2)}${head('Your Cart', 'Check your items, change quantities, then press Order Now.', '🛒')}
  <div class="panel">${cart.map(c => { const it = CAT[c.id]; if (!it) return ''; return `
    <div class="cart-row"><span style="width:72px;height:72px;border-radius:12px;overflow:hidden;display:block">${imgTag(it.kw, it.seed, it.emoji, it.name, 160, 160)}</span>
      <div><h4>${esc(it.name)}</h4><small>${fmt(it.price)} each</small><br><span class="qty"><button data-dec="${it.id}" aria-label="Decrease">−</button><b>${c.qty}</b><button data-inc="${it.id}" aria-label="Increase">+</button></span></div>
      <div class="line-total">${fmt(it.price * c.qty)}<button class="rm" data-rm="${it.id}">Remove</button></div></div>`; }).join('')}
    <div class="totals"><div><span>Subtotal</span><b>${fmt(cartSubtotal())}</b></div><div style="color:var(--muted);font-size:.85rem"><span>Delivery fee</span><span>Added at the next step</span></div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><a class="btn ghost" href="#/menu">+ Add more</a><a class="btn" href="#/checkout" style="flex:1">Order Now →</a></div></div>${footer()}`;
}

function pageCheckout() {
  if (!cart.length) return pageCart();
  const u = user || {};
  return `${stepper(4)}${head('Complete your order', 'Fill in your details and send the order to us on WhatsApp.', '📝')}
  <div class="checkout">
    <form id="orderForm" class="panel" novalidate>
      <h3>Your details</h3>
      <label>Full name<input name="name" required autocomplete="name" value="${esc(u.name || '')}" placeholder="e.g. Sarah Nakato"></label>
      <label>Phone number<input name="phone" type="tel" required autocomplete="tel" value="${esc(u.phone || '')}" placeholder="07XX XXX XXX"></label>
      <fieldset><legend>Delivery or pickup</legend>
        <label class="radio"><input type="radio" name="mode" value="Delivery" checked> 🛵 Delivery</label>
        <label class="radio"><input type="radio" name="mode" value="Pickup"> 🏪 Pickup</label></fieldset>
      <div id="deliveryFields">
        <label>Delivery location<select name="area" id="areaSel"><option value="">Select your area…</option>${AREAS.map(([n, f]) => `<option value="${esc(n)}" data-fee="${f}">${esc(n)} – ${fmt(f)}</option>`).join('')}</select></label>
        <label>Street / landmark<input name="address" placeholder="e.g. Plot 12, near the petrol station"></label>
      </div>
      <label>Additional instructions<textarea name="notes" rows="3" placeholder="e.g. No onions, call when you arrive, write 'Happy Birthday Mum' on the cake"></textarea></label>
      <div class="err hidden" id="formErr"></div>
      <button class="btn wa big" type="submit">💬 Place order on WhatsApp</button>
      <p style="font-size:.78rem;color:var(--muted);margin-top:10px;text-align:center">WhatsApp will open with your order ready to send. You can then track it on the “Track Order” page.</p>
    </form>
    <aside class="panel summary">
      <h3>Your order</h3>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>
      ${cart.map(c => { const it = CAT[c.id]; return it ? `<tr><td>${esc(it.name)}</td><td>${c.qty}</td><td>${fmt(it.price * c.qty)}</td></tr>` : ''; }).join('')}</tbody></table>
      <div class="totals"><div><span>Subtotal</span><b>${fmt(cartSubtotal())}</b></div><div><span>Delivery fee</span><b id="feeVal">—</b></div></div>
      <div class="total-line" id="totalLine">Total: ${fmt(cartSubtotal())} + delivery fee</div>
      <a href="#/cart" class="btn ghost small" style="margin-top:14px">← Edit cart</a>
    </aside>
  </div>${footer()}`;
}

function feeFor(area) { const a = AREAS.find(x => x[0] === area); return a ? a[1] : 0; }
function updateTotals() {
  const f = $('#orderForm'); if (!f) return;
  const mode = f.mode.value, sub = cartSubtotal();
  $('#deliveryFields').classList.toggle('hidden', mode === 'Pickup');
  const fee = mode === 'Delivery' ? feeFor(f.area.value) : 0;
  const chosen = mode === 'Pickup' || f.area.value;
  $('#feeVal').textContent = mode === 'Pickup' ? 'UGX 0 (pickup)' : chosen ? fmt(fee) : 'Select area';
  $('#totalLine').textContent = chosen ? `Total: ${fmt(sub)} + ${fmt(fee)} delivery = ${fmt(sub + fee)}` : `Total: ${fmt(sub)} + delivery fee`;
}

function submitOrder(form) {
  const d = Object.fromEntries(new FormData(form));
  const err = $('#formErr'); const fail = m => { err.textContent = m; err.classList.remove('hidden'); err.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
  d.name = (d.name || '').trim(); d.phone = (d.phone || '').replace(/\s+/g, '');
  if (d.name.length < 2) return fail('Please enter your full name.');
  if (!/^(\+?256|0)7\d{8}$/.test(d.phone)) return fail('Please enter a valid phone number, e.g. 0788493213.');
  if (d.mode === 'Delivery' && !d.area) return fail('Please choose your delivery location.');
  const sub = cartSubtotal(), fee = d.mode === 'Delivery' ? feeFor(d.area) : 0, now = new Date().toISOString();
  const order = {
    id: 'BS-' + Date.now().toString(36).slice(-5).toUpperCase(),
    name: d.name, phone: d.phone, mode: d.mode, area: d.area || '', address: (d.address || '').trim(), notes: (d.notes || '').trim(),
    items: cart.map(c => ({ name: CAT[c.id].name, qty: c.qty, price: CAT[c.id].price })),
    subtotal: sub, fee, total: sub + fee, status: 'Pending', placedAt: now, deliveredAt: null, history: [{ status: 'Pending', at: now }]
  };
  orders.unshift(order); store('bs_orders', orders);
  const lines = [
    '*NEW ORDER – Blessed Snacks*', `Order ID: ${order.id}`, `Name: ${order.name}`, `Phone: ${order.phone}`, `Type: ${order.mode}`,
    order.mode === 'Delivery' ? `Location: ${order.area}${order.address ? ' – ' + order.address : ''}` : 'Pickup at the shop', '',
    '*Items:*', ...order.items.map((i, n) => `${n + 1}. ${i.name} x${i.qty} – ${fmt(i.price * i.qty)}`), '',
    `Subtotal: ${fmt(order.subtotal)}`, `Delivery fee: ${fmt(order.fee)}`, `*TOTAL: ${fmt(order.total)}*`,
    order.notes ? `Instructions: ${order.notes}` : '', `Placed: ${fmtDate(now)}`
  ].filter(l => l !== undefined);
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  cart = []; saveCart();
  const w = window.open(url, '_blank');
  location.hash = `#/track?id=${order.id}`;
  notify('Order placed – Pending ⏳', `Order ${order.id} is waiting for confirmation.`);
  if (!w) setTimeout(() => { window.location.href = url; }, 600);
}

/* ---------- Track order ---------- */
const staffOn = () => sessionStorage.getItem('bs_staff') === '1';
function stepLabel(o, s) { return s === 'Delivered' && o.mode === 'Pickup' ? 'Ready / Picked up' : s; }
function pageTrack() {
  const focus = queryParam('id');
  const list = orders.length ? orders.map(o => {
    const idx = STEPS.indexOf(o.status);
    const next = STEPS[idx + 1];
    return `<div class="panel order" style="${focus === o.id ? 'outline:3px solid var(--gold)' : ''}">
      <div class="order-head"><div><h3 style="margin:0">Order ${o.id}</h3><small style="color:var(--muted)">${esc(o.name)} · ${esc(o.phone)}</small></div><span class="pill ${o.status}">${stepLabel(o, o.status)}</span></div>
      <ol class="timeline">${STEPS.map((s, i) => { const h = o.history.find(x => x.status === s); return `<li class="${i <= idx ? 'done' : ''} ${i === idx ? 'current' : ''}"><span class="dot">${i <= idx ? '✓' : i + 1}</span><div><b>${stepLabel(o, s)}</b><br><small>${h ? fmtDate(h.at) : 'Waiting…'}</small></div></li>`; }).join('')}</ol>
      <div class="meta">
        <div><b>Order received</b>${fmtDate(o.placedAt)}</div>
        <div><b>${o.mode === 'Pickup' ? 'Picked up' : 'Delivered'}</b>${o.deliveredAt ? fmtDate(o.deliveredAt) : 'Not yet'}</div>
        <div><b>${o.mode}</b>${o.mode === 'Delivery' ? esc(o.area) + (o.address ? ' – ' + esc(o.address) : '') : 'At the shop'}</div>
        <div><b>Total</b>${fmt(o.total)} <small>(${fmt(o.subtotal)} + ${fmt(o.fee)} delivery)</small></div>
        <div style="grid-column:1/-1"><b>Items</b>${o.items.map(i => `${esc(i.name)} ×${i.qty}`).join(' · ')}</div>
        ${o.notes ? `<div style="grid-column:1/-1"><b>Instructions</b>${esc(o.notes)}</div>` : ''}
      </div>
      ${staffOn() && next ? `<div class="staff-bar">👩‍🍳 Staff: <button class="btn gold" data-status="${o.id}|${next}">Mark as ${stepLabel(o, next)}</button></div>` : ''}
    </div>`;
  }).join('') : `<div class="panel empty"><div class="big">📦</div><h2>No orders yet</h2><p>Orders you place will appear here with live status.</p><br><a class="btn" href="#/menu">Order something</a></div>`;
  return `${head('Track Your Order', 'Pending → Confirmed → Preparing → Delivered, with the date and time of each stage.', '📦')}
  <div class="note-box">ℹ️ Your order is sent to us on WhatsApp. Statuses are updated by our team and shown on this device. ${('Notification' in window && Notification.permission === 'default') ? '<button class="btn small ghost" data-notify="1" style="margin-left:8px">Enable alerts</button>' : ''}
    <button class="btn small ghost" data-staff="1" style="margin-left:8px">${staffOn() ? 'Exit staff mode' : '🔒 Staff access'}</button></div>
  ${list}${footer()}`;
}
function setStatus(id, status) {
  const o = orders.find(x => x.id === id); if (!o) return;
  const now = new Date().toISOString();
  o.status = status; o.history.push({ status, at: now });
  if (status === 'Delivered') o.deliveredAt = now;
  store('bs_orders', orders);
  notify(`Order ${id}: ${stepLabel(o, status)}`, `Updated ${fmtDate(now)}`);
  route();
}

/* ---------- About, feedback, careers, location ---------- */
function pageAbout() {
  return `${head('About Us', 'A family-run snack spot serving Kampala with love – every plate is a blessing.', 'ℹ️')}
  <div class="cols">
    <div class="panel"><h3>Our story</h3><p>Blessed Snacks started with one simple idea: great street-food classics – Rolex, Kikomando, crispy wings – made fresh, priced fairly and served with a smile. Today we also offer hearty meals, fresh drinks and cakes for every celebration.</p>
      <br><p><b>Our promise:</b> fresh ingredients, clean kitchen, fast service and friendly people.</p></div>
    <div class="panel"><h3>Contact us</h3><ul class="contact-list">
      <li><span class="ic">📞</span><div><b>Call</b><br><a href="tel:+${WA_NUMBER}">${PHONE_DISPLAY}</a></div></li>
      <li><span class="ic">💬</span><div><b>WhatsApp</b><br><a href="https://wa.me/${WA_NUMBER}" target="_blank" rel="noopener">Chat with us</a></div></li>
      <li><span class="ic">📍</span><div><b>Where</b><br>Makerere Hill, Kampala, Uganda – <a href="#/location">see location</a></div></li>
      <li><span class="ic">🕘</span><div><b>Opening hours</b><br>Mon–Sun · 7:00 AM – 10:00 PM</div></li></ul></div>
    <form class="panel" id="contactForm"><h3>Send us a message</h3>
      <label>Your name<input name="name" required></label><label>Message<textarea name="msg" rows="4" required></textarea></label>
      <button class="btn wa" type="submit">💬 Send on WhatsApp</button></form>
  </div>${footer()}`;
}
function pageFeedback() {
  const avg = feedbacks.length ? (feedbacks.reduce((a, f) => a + f.rating, 0) / feedbacks.length).toFixed(1) : null;
  return `${head('Feedback', 'Tell us how we did – your words help us serve you better.', '💬')}
  <div class="cols">
    <form class="panel" id="feedbackForm"><h3>Leave feedback</h3>
      <label>Your name<input name="name" value="${esc(user?.name || '')}" required></label>
      <fieldset><legend>Rating</legend><div class="stars">${[5, 4, 3, 2, 1].map(n => `<input type="radio" id="st${n}" name="rating" value="${n}" ${n === 5 ? 'checked' : ''}><label for="st${n}" title="${n} stars">★</label>`).join('')}</div></fieldset>
      <label>Your message<textarea name="msg" rows="4" required placeholder="What did you enjoy? What can we improve?"></textarea></label>
      <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="wa" checked> Also send to Blessed Snacks on WhatsApp</label>
      <button class="btn big" type="submit">Submit feedback</button></form>
    <div class="panel"><h3>Recent feedback ${avg ? `<small style="color:var(--gold-dark)">★ ${avg} average</small>` : ''}</h3>
      ${feedbacks.length ? feedbacks.slice(0, 12).map(f => `<div class="fb"><b>${esc(f.name)}</b> <span class="s">${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</span><p>${esc(f.msg)}</p><small style="color:var(--muted)">${fmtDate(f.at)}</small></div>`).join('') : '<p style="color:var(--muted)">No feedback yet – be the first!</p>'}</div>
  </div>${footer()}`;
}
const JOBS = [['Rolex / Kikomando Cook', 'Full-time', 'Fast, clean, loves street food'], ['Kitchen Assistant', 'Full-time', 'Prep, frying and cleaning'], ['Delivery Rider', 'Full-time / Part-time', 'Own motorbike & permit preferred'], ['Cashier & Customer Service', 'Full-time', 'Friendly, honest, good with numbers'], ['Barista / Juice Maker', 'Full-time', 'Smoothies, juices and coffees'], ['Cake Baker & Decorator', 'Full-time', 'Creative with cakes & icing']];
function pageCareers() {
  return `${head('Careers', 'Join the Blessed Snacks family. We grow together.', '💼')}
  <div class="cols">
    <div class="panel"><h3>Open positions</h3>${JOBS.map(j => `<div class="job"><div><b>${j[0]}</b><br><small>${j[1]} · ${j[2]}</small></div><a class="btn small ghost" href="#apply" data-apply="${esc(j[0])}">Apply</a></div>`).join('')}</div>
    <form class="panel" id="careerForm"><h3 id="apply">Apply now</h3>
      <label>Full name<input name="name" required></label><label>Phone number<input name="phone" type="tel" required></label>
      <label>Position<select name="job">${JOBS.map(j => `<option>${j[0]}</option>`).join('')}<option>Other</option></select></label>
      <label>Experience &amp; why you'd fit<textarea name="msg" rows="4" required></textarea></label>
      <button class="btn wa big" type="submit">💬 Send application on WhatsApp</button></form>
  </div>${footer()}`;
}
function pageLocation() {
  return `${head('Find Us & Delivery Areas', 'We deliver around Kampala. Delivery fees are added to your total at checkout.', '📍')}
  <iframe class="map" title="Map of Kampala" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Kampala,Uganda&output=embed"></iframe>
  <p style="margin:10px 0"><a class="btn small" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=Kampala+Uganda">Open in Google Maps</a>
  <small style="color:var(--muted)"> (Replace the map link in app.js with your exact shop address.)</small></p>
  <div class="panel" style="margin-top:18px"><h3>🛵 Delivery fees</h3><div class="fee-grid"><table class="fee-table">${AREAS.map(([n, f]) => `<tr><td>${esc(n)}</td><td>${fmt(f)}</td></tr>`).join('')}</table></div>
  <br><a class="btn" href="#/menu">Order Now</a></div>${footer()}`;
}

/* =========================================================
   ROUTER
   ========================================================= */
const ROUTES = {
  home: pageHome, menu: pageMenu, cart: pageCart, checkout: pageCheckout, track: pageTrack, about: pageAbout,
  feedback: pageFeedback, careers: pageCareers, location: pageLocation,
  snacks: () => pageCatalog('snacks'), foods: () => pageCatalog('foods'), drinks: () => pageCatalog('drinks'), desserts: () => pageCatalog('desserts')
};
let lastPage = null;
function route() {
  const p = ROUTES[currentPage()] ? currentPage() : 'home';
  $('#app').innerHTML = ROUTES[p]();
  if (p !== lastPage) window.scrollTo({ top: 0, behavior: 'instant' });
  lastPage = p;
  document.title = 'Blessed Snacks – ' + (NAV.find(n => n[0] === p)?.[1] || 'Home');
  renderNav(); updateCartUI(); updateAuthUI();
  document.body.classList.remove('nav-open');
  if (p === 'checkout') updateTotals();
}
window.addEventListener('hashchange', route);

/* =========================================================
   SIGN IN / SIGN UP (stored only in this browser)
   ========================================================= */
async function hashPw(s) {
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch { return btoa(unescape(encodeURIComponent(s))); }
}
function updateAuthUI() { $('#signInLabel').textContent = user ? user.name.split(' ')[0] : 'Sign in'; }
function openModal(html) { $('#modalBox').innerHTML = `<button class="modal-x" data-close="1" aria-label="Close">×</button>${html}`; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }
function openAuth(tab = 'in') {
  if (user) {
    return openModal(`<h3>👋 Hi ${esc(user.name)}</h3><p style="margin:8px 0 16px;color:var(--muted)">${esc(user.phone)}</p>
      <a class="btn big" href="#/track" data-close="1">📦 My orders</a><br><br><button class="btn ghost big" data-signout="1">Sign out</button>`);
  }
  openModal(`<h3 style="color:var(--red-dark)">Welcome to Blessed Snacks</h3>
  <div class="tabs"><button class="${tab === 'in' ? 'on' : ''}" data-tab="in">Sign in</button><button class="${tab === 'up' ? 'on' : ''}" data-tab="up">Create account</button></div>
  <form id="authForm" data-mode="${tab}" novalidate>
    ${tab === 'up' ? '<label>Full name<input name="name" autocomplete="name" required></label>' : ''}
    <label>Phone number<input name="phone" type="tel" autocomplete="tel" required placeholder="07XX XXX XXX"></label>
    <label>Password<input name="pw" type="password" autocomplete="${tab === 'up' ? 'new-password' : 'current-password'}" required minlength="4"></label>
    <div class="err hidden" id="authErr"></div>
    <button class="btn big" type="submit">${tab === 'up' ? 'Create account' : 'Sign in'}</button></form>
  <p style="font-size:.75rem;color:var(--muted);margin-top:12px">Accounts are saved on this device only and are used to pre-fill your order details.</p>`);
}
async function handleAuth(form) {
  const d = Object.fromEntries(new FormData(form)); const err = $('#authErr');
  const fail = m => { err.textContent = m; err.classList.remove('hidden'); };
  const phone = (d.phone || '').replace(/\s+/g, '');
  if (!/^(\+?256|0)7\d{8}$/.test(phone)) return fail('Enter a valid phone number.');
  if ((d.pw || '').length < 4) return fail('Password must be at least 4 characters.');
  const h = await hashPw(phone + ':' + d.pw);
  if (form.dataset.mode === 'up') {
    if ((d.name || '').trim().length < 2) return fail('Please enter your name.');
    if (users[phone]) return fail('An account with this phone already exists. Please sign in.');
    users[phone] = { name: d.name.trim(), phone, h }; store('bs_users', users);
  } else if (!users[phone] || users[phone].h !== h) return fail('Wrong phone number or password.');
  user = { name: users[phone].name, phone }; store('bs_user', user);
  closeModal(); updateAuthUI(); toast(`Welcome, ${user.name.split(' ')[0]}! 🎉`, 'You are signed in.');
  if (currentPage() === 'checkout' || currentPage() === 'feedback') route();
}

/* =========================================================
   EVENTS
   ========================================================= */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-add],[data-order],[data-inc],[data-dec],[data-rm],[data-scroll],[data-status],[data-staff],[data-notify],[data-close],[data-signout],[data-tab],[data-apply]');
  if (!t) { if (e.target === $('#modal')) closeModal(); return; }
  const d = t.dataset;
  if (d.add) addToCart(d.add);
  else if (d.order) { addToCart(d.order, 1, true); location.hash = '#/checkout'; }
  else if (d.inc) setQty(d.inc, cart.find(c => c.id === d.inc).qty + 1);
  else if (d.dec) setQty(d.dec, cart.find(c => c.id === d.dec).qty - 1);
  else if (d.rm) setQty(d.rm, 0);
  else if (d.scroll) document.getElementById(d.scroll)?.scrollIntoView({ behavior: 'smooth' });
  else if (d.status) { const [id, s] = d.status.split('|'); setStatus(id, s); }
  else if (d.staff) {
    if (staffOn()) { sessionStorage.removeItem('bs_staff'); route(); }
    else { const pin = prompt('Enter staff PIN'); if (pin === STAFF_PIN) { sessionStorage.setItem('bs_staff', '1'); route(); } else if (pin !== null) toast('Wrong PIN', 'Staff access denied.', true); }
  }
  else if (d.notify) Notification.requestPermission().then(route);
  else if (d.close) closeModal();
  else if (d.signout) { user = null; localStorage.removeItem('bs_user'); closeModal(); updateAuthUI(); toast('Signed out', 'See you soon!'); route(); }
  else if (d.tab) openAuth(d.tab);
  else if (d.apply) { const sel = $('#careerForm select'); if (sel) sel.value = d.apply; e.preventDefault(); $('#careerForm').scrollIntoView({ behavior: 'smooth' }); }
});

document.addEventListener('submit', e => {
  const f = e.target; e.preventDefault();
  const d = Object.fromEntries(new FormData(f));
  const wa = text => window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  if (f.id === 'orderForm') submitOrder(f);
  else if (f.id === 'authForm') handleAuth(f);
  else if (f.id === 'contactForm') { wa(`*Message from website*\nName: ${d.name}\n${d.msg}`); f.reset(); }
  else if (f.id === 'careerForm') { wa(`*Job application – Blessed Snacks*\nName: ${d.name}\nPhone: ${d.phone}\nPosition: ${d.job}\n${d.msg}`); toast('Application ready', 'Send it in WhatsApp to finish.'); f.reset(); }
  else if (f.id === 'feedbackForm') {
    feedbacks.unshift({ name: d.name.trim(), rating: +d.rating || 5, msg: d.msg.trim(), at: new Date().toISOString() }); store('bs_feedback', feedbacks);
    if (d.wa) wa(`*Feedback – Blessed Snacks*\nFrom: ${d.name}\nRating: ${'★'.repeat(+d.rating)}\n${d.msg}`);
    toast('Thank you! 💛', 'Your feedback was saved.'); route();
  }
});
document.addEventListener('change', e => { if (e.target.closest('#orderForm')) updateTotals(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); document.body.classList.remove('nav-open'); } });
$('#signInBtn').addEventListener('click', () => openAuth('in'));
$('#menuToggle').addEventListener('click', () => document.body.classList.toggle('nav-open'));
$('#navScrim').addEventListener('click', () => document.body.classList.remove('nav-open'));

/* Re-sync if the order list changes in another tab on this device (e.g. staff updates a status) */
window.addEventListener('storage', e => {
  if (e.key === 'bs_orders') {
    const before = Object.fromEntries(orders.map(o => [o.id, o.status]));
    orders = load('bs_orders', []);
    orders.forEach(o => { if (before[o.id] && before[o.id] !== o.status) notify(`Order ${o.id}: ${stepLabel(o, o.status)}`, 'Your order status changed.'); });
    if (currentPage() === 'track') route();
  }
  if (e.key === 'bs_cart') { cart = load('bs_cart', []); route(); }
});

route();