const DB_KEY = "savagePortalDbV2";

const defaults = {
  user: { name: "User", email: "user@savage.test", wallet: 0, deposited: 68000, spent: 0 },
  customers: [
    { id: "cust-1", name: "User", email: "user@savage.test", phone: "08012345678", status: "Active", createdAt: "May 26, 2026 15:18" },
  ],
  smsInventory: [
    { id: "sms-1", service: "WhatsApp", country: "Nigeria", number: "+234 812 000 1001", code: "482910", price: 350, status: "available" },
    { id: "sms-2", service: "Telegram", country: "Nigeria", number: "+234 812 000 1002", code: "719204", price: 280, status: "available" },
    { id: "sms-3", service: "Google", country: "United States", number: "+1 213 555 0108", code: "338190", price: 900, status: "available" },
    { id: "sms-4", service: "Instagram", country: "United Kingdom", number: "+44 7400 123456", code: "921774", price: 750, status: "available" },
  ],
  dataPlans: [
    { id: "data-1", network: "MTN", bundle: "1GB - 30 Days", price: 650, stock: 24, status: "active" },
    { id: "data-2", network: "Airtel", bundle: "1GB - 30 Days", price: 670, stock: 18, status: "active" },
    { id: "data-3", network: "Glo", bundle: "2GB - 30 Days", price: 1200, stock: 14, status: "active" },
    { id: "data-4", network: "9mobile", bundle: "5GB - 30 Days", price: 3100, stock: 9, status: "active" },
  ],
  orders: [],
  deposits: [{ id: "dep-1", ref: "WAL-68000", amount: 68000, method: "Bank Transfer", status: "Completed", createdAt: "May 26, 2026 15:18" }],
  logs: [{ id: "log-1", event: "Wallet Top-up", description: "Completed wallet top-up of ₦68,000.00", createdAt: "May 26, 2026 15:18" }],
  tickets: [],
  invoices: [],
  flights: [],
  updated: "May 26, 2026 15:18",
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadDb() {
  const saved = localStorage.getItem(DB_KEY);
  if (!saved) {
    localStorage.setItem(DB_KEY, JSON.stringify(defaults));
    return clone(defaults);
  }

  try {
    const parsed = { ...clone(defaults), ...JSON.parse(saved) };
    if (!parsed.customers || !parsed.customers.length) parsed.customers = clone(defaults.customers);
    return parsed;
  } catch {
    localStorage.setItem(DB_KEY, JSON.stringify(defaults));
    return clone(defaults);
  }
}

function saveDb(next) {
  localStorage.setItem(DB_KEY, JSON.stringify(next));
}

let db = loadDb();

const nav = [
  { title: "Dashboard", links: [{ page: "dashboard", href: "index.html", label: "Dashboard", icon: "D" }] },
  {
    title: "SMS Services",
    links: [
      { page: "sms", href: "sms-services.html", label: "SMS Services", icon: "S" },
      { page: "sme", href: "sme-services.html", label: "SME Services", icon: "M" },
    ],
  },
  { title: "Balance", links: [{ page: "balance", href: "balance.html", label: "Balance", icon: "B" }] },
  {
    title: "Tools & Logs",
    links: [
      { page: "logs", href: "tools-logs.html", label: "Tools & Logs", icon: "L" },
      { page: "purchased", href: "purchased.html", label: "Buy Purchased", icon: "P" },
      { page: "contact", href: "contact.html", label: "Contact", icon: "C" },
    ],
  },
];

const adminNav = [
  { href: "admin.html#overview", label: "Overview", icon: "O" },
  { href: "admin.html#products", label: "Products", icon: "P" },
  { href: "admin.html#customers", label: "Customers", icon: "C" },
  { href: "admin.html#orders", label: "Orders", icon: "R" },
  { href: "admin.html#logs", label: "Logs", icon: "L" },
  { href: "index.html", label: "Customer Site", icon: "S" },
];

function now() {
  return new Date().toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function addLog(event, description) {
  db.logs.unshift({ id: uid("log"), event, description, createdAt: now() });
}

function availableSms() {
  return db.smsInventory.filter((item) => item.status === "available");
}

function activePlans() {
  return db.dataPlans.filter((item) => item.status === "active");
}

function smsOrders() {
  return db.orders.filter((order) => order.kind === "SMS");
}

function dataOrders() {
  return db.orders.filter((order) => order.kind === "SME");
}

function shell(page, content, role = "Customer") {
  return `
    <div class="shell">
      <aside class="sidebar" aria-label="Main navigation">
        <a class="brand" href="index.html">
          <span class="brand-mark">S</span>
          <span><strong>Savage</strong><span>${role}</span></span>
        </a>
        <div class="user-card">
          <div class="avatar">${role === "Admin" ? "A" : "U"}</div>
          <div><span class="user-name">${role === "Admin" ? "Admin" : db.user.name}</span><span class="user-role">${role}</span></div>
        </div>
        ${nav
          .map(
            (block) => `
            <nav class="nav-block">
              <p class="nav-title">${block.title}</p>
              ${block.links
                .map(
                  (link) => `
                  <a class="nav-link ${page === link.page ? "active" : ""}" href="${link.href}">
                    <span class="nav-icon">${link.icon}</span>${link.label}
                  </a>`
                )
                .join("")}
            </nav>`
          )
          .join("")}
      </aside>
      <main class="main">
        <button class="mobile-menu" type="button" data-menu>Menu</button>
        <div data-toast class="toast" hidden></div>
        ${content}
        <footer class="footer">Copyright 2024 © Wapx PLUS +</footer>
      </main>
    </div>`;
}

function adminShell(content) {
  return `
    <div class="admin-shell">
      <aside class="admin-sidebar" aria-label="Admin navigation">
        <a class="admin-brand" href="admin.html">
          <span class="admin-mark">S</span>
          <span><strong>Savage Admin</strong><small>Inventory Control</small></span>
        </a>
        <div class="admin-user">
          <div class="avatar">A</div>
          <div><span class="user-name">Admin</span><span class="user-role">Store Manager</span></div>
        </div>
        <nav class="admin-nav">
          ${adminNav.map((item) => `<a class="admin-link" href="${item.href}"><span>${item.icon}</span>${item.label}</a>`).join("")}
        </nav>
      </aside>
      <main class="admin-main">
        <button class="mobile-menu" type="button" data-menu>Admin Menu</button>
        <div data-toast class="toast" hidden></div>
        ${content}
        <footer class="footer">Admin Console - Copyright 2024 © Wapx PLUS +</footer>
      </main>
    </div>`;
}

function adminHeader(title, subtitle, extra = "") {
  return `
    <section class="admin-topbar">
      <div>
        <p class="eyebrow">Admin Console</p>
        <h1 class="page-title">${title}</h1>
        <p class="subtitle">${subtitle}</p>
      </div>
      <div class="top-actions">
        ${extra}
        <a class="btn secondary" href="index.html">Customer Site</a>
      </div>
    </section>`;
}

function pageHeader(title, subtitle, eyebrow = "Savage", extra = "") {
  return `
    <section class="topbar">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h1 class="page-title">${title}</h1>
        <p class="subtitle">${subtitle}</p>
      </div>
      <div class="top-actions">
        ${extra}
        <span class="status-pill"><span class="dot"></span> Wallet Active</span>
        <a class="btn secondary" href="balance.html">Top Up</a>
      </div>
    </section>`;
}

function stat(label, value, note, icon) {
  return `
    <article class="card stat-card">
      <div>
        <div class="stat-head">
          <span class="stat-label">${label}</span>
          <span class="icon-box">${icon}</span>
        </div>
        <div class="stat-value">${value}</div>
      </div>
      <p class="stat-note">${note}</p>
    </article>`;
}

function stats() {
  return `
    <section class="grid stats-grid">
      ${stat("Available Balance", money(db.user.wallet), `Updated ${db.updated}`, "W")}
      ${stat("Total Spent", money(db.user.spent), "All-time service usage", "₦")}
      ${stat("Total Deposited", money(db.user.deposited), "Completed wallet top-ups", "+")}
      ${stat("Activations", smsOrders().length, "Successful SMS activations", "A")}
    </section>`;
}

function table(headers, rows, empty = "No records yet.") {
  const body = rows.length
    ? rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")
    : `<tr><td class="empty" colspan="${headers.length}">${empty}</td></tr>`;

  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((head) => `<th>${head}</th>`).join("")}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

function dashboard() {
  const usage = db.user.deposited ? Math.min(100, (db.user.spent / db.user.deposited) * 100) : 0;
  const recentLogs = db.logs.slice(0, 4).map((log) => `<div class="feed-item"><strong>${log.event}</strong><span>${log.description}</span><small>${log.createdAt}</small></div>`).join("");
  const orderRows = db.orders.slice(0, 5).map((order, index) => [
    index + 1,
    order.kind,
    order.country || order.network || "-",
    money(order.amount),
    `<span class="pill">${order.status}</span>`,
    order.createdAt,
  ]);

  return shell(
    "dashboard",
    `
    ${pageHeader("Welcome Back", "Your wallet and activity overview at a glance. Purchases now use real local inventory and update your wallet immediately.", "Dashboard")}
    ${stats()}
    <section class="grid two-col section-gap">
      <div class="card panel">
        <div class="panel-title-row">
          <h2>Quick Actions</h2>
          <span class="small-label">Wallet Status: Active</span>
        </div>
        <div class="quick-actions">
          <a class="action" href="balance.html"><span class="icon-box">+</span><span><strong>Wallet</strong><span>Top Up</span></span></a>
          <a class="action" href="sms-services.html"><span class="icon-box">S</span><span><strong>SMS</strong><span>Buy Number</span></span></a>
          <a class="action" href="sme-services.html"><span class="icon-box">M</span><span><strong>SME</strong><span>Buy Data</span></span></a>
        </div>
      </div>
      <aside class="card panel">
        <div class="panel-title-row"><h2>Spend Breakdown</h2></div>
        <div class="list">
          <div class="list-row"><span>SMS Orders</span><strong>${smsOrders().length}</strong></div>
          <div class="list-row"><span>SME Orders</span><strong>${dataOrders().length}</strong></div>
          <div class="list-row"><span>Usage</span><strong>${usage.toFixed(1)}%</strong></div>
          <div class="meter"><span style="width: ${usage}%"></span></div>
          <div class="list-row"><span>Deposited</span><strong>${money(db.user.deposited)}</strong></div>
          <div class="list-row"><span>Spent</span><strong>${money(db.user.spent)}</strong></div>
          <div class="list-row"><span>Balance</span><strong>${money(db.user.wallet)}</strong></div>
        </div>
      </aside>
    </section>
    <section class="grid two-col section-gap">
      <div class="card panel">
        <div class="panel-title-row"><h2>Recent Activity</h2></div>
        ${recentLogs || '<div class="empty-state">No recent activity.</div>'}
      </div>
      <div class="card panel">
        <div class="panel-title-row"><h2>Inventory Snapshot</h2><span class="small-label">Live product availability</span></div>
        <div class="list">
          <div class="list-row"><span>SMS numbers available</span><strong>${availableSms().length}</strong></div>
          <div class="list-row"><span>SME plans active</span><strong>${activePlans().length}</strong></div>
          <div class="list-row"><span>Total orders</span><strong>${db.orders.length}</strong></div>
        </div>
      </div>
    </section>
    <section class="card section-gap">
      <div class="panel-title-row panel">
        <h2>Latest Orders</h2>
        <span class="small-label">Live local data</span>
      </div>
      ${table(["S/N", "Type", "Country / Network", "Amount", "Status", "Created At"], orderRows, "No orders yet.")}
    </section>`
  );
}

function smsServices() {
  const services = [...new Set(db.smsInventory.map((item) => item.service))];
  const countries = [...new Set(db.smsInventory.map((item) => item.country))];
  const popular = availableSms()
    .slice(0, 5)
    .map((item) => `<div class="list-row"><span>${item.service} ${item.country}</span><strong>${money(item.price)}</strong></div>`)
    .join("");
  const orderRows = smsOrders().map((order, index) => [index + 1, order.service, order.country, order.number, order.code, `<span class="pill">${order.status}</span>`]);

  return shell(
    "sms",
    `
    ${pageHeader("SMS Services", "Buy virtual numbers only when matching admin inventory is available.", "Services")}
    <section class="grid three-col">
      ${stat("Available Balance", money(db.user.wallet), "Ready for SMS activations", "W")}
      ${stat("Available Numbers", availableSms().length, "Stock controlled by admin", "S")}
      ${stat("Completed SMS Orders", smsOrders().length, "Successful activations", "%")}
    </section>
    <section class="grid two-col section-gap">
      <div class="card panel">
        <div class="panel-title-row"><h2>Buy SMS Number</h2><span class="pill neutral">Inventory checked</span></div>
        <form class="form-grid" data-form="buy-sms">
          <div class="field"><label>Service</label><select name="service">${services.map((item) => `<option>${item}</option>`).join("")}</select></div>
          <div class="field"><label>Country</label><select name="country">${countries.map((item) => `<option>${item}</option>`).join("")}</select></div>
          <div class="field"><label>Quantity</label><input name="quantity" type="number" value="1" min="1" max="5" /></div>
          <div class="field"><label>Estimated Amount</label><input name="estimate" value="Select stock to price" readonly /></div>
          <div class="field full"><button class="btn" type="submit">Buy Number</button></div>
        </form>
      </div>
      <aside class="card panel">
        <div class="panel-title-row"><h2>Available Stock</h2><a class="text-link" href="admin.html">Manage</a></div>
        <div class="list">${popular || '<div class="empty-state compact">No SMS stock available.</div>'}</div>
      </aside>
    </section>
    <section class="card section-gap">
      <div class="panel-title-row panel"><h2>SMS Orders</h2><span class="small-label">Latest activation requests</span></div>
      ${table(["S/N", "Service", "Country", "Number", "Code", "Status"], orderRows, "No SMS orders yet.")}
    </section>`
  );
}

function smeServices() {
  const planOptions = activePlans().map((plan) => `<option value="${plan.id}">${plan.network} ${plan.bundle} - ${money(plan.price)} (${plan.stock} left)</option>`).join("");
  const rates = activePlans().map((plan) => `<div class="list-row"><span>${plan.network} ${plan.bundle}</span><strong>${money(plan.price)} / ${plan.stock}</strong></div>`).join("");
  const rows = dataOrders().map((order, index) => [index + 1, order.network, order.bundle, order.phone, money(order.amount), `<span class="pill">${order.status}</span>`]);

  return shell(
    "sme",
    `
    ${pageHeader("SME Services", "Purchase data bundles from available admin-managed stock.", "Services")}
    <section class="grid two-col">
      <div class="card panel">
        <div class="panel-title-row"><h2>Buy Data</h2><span class="pill neutral">Stock checked</span></div>
        <form class="form-grid" data-form="buy-data">
          <div class="field full"><label>Plan</label><select name="planId">${planOptions}</select></div>
          <div class="field"><label>Phone Number</label><input name="phone" placeholder="08012345678" required /></div>
          <div class="field"><label>Quantity</label><input name="quantity" type="number" value="1" min="1" max="10" /></div>
          <div class="field full"><button class="btn" type="submit">Purchase Data</button></div>
        </form>
      </div>
      <aside class="card panel">
        <div class="panel-title-row"><h2>Bundle Rates</h2><a class="text-link" href="admin.html">Manage</a></div>
        <div class="list">${rates || '<div class="empty-state compact">No active data plans.</div>'}</div>
      </aside>
    </section>
    <section class="card section-gap">
      <div class="panel-title-row panel"><h2>SME Purchase History</h2><span class="small-label">Live local data</span></div>
      ${table(["S/N", "Network", "Plan", "Phone", "Amount", "Status"], rows, "No SME purchases yet.")}
    </section>`
  );
}

function balance() {
  const rows = db.deposits.map((deposit, index) => [index + 1, deposit.ref, money(deposit.amount), deposit.method, `<span class="pill">${deposit.status}</span>`, deposit.createdAt]);
  return shell(
    "balance",
    `
    ${pageHeader("Wallet Balance", "Top up your wallet, review deposits, and monitor your current spend.", "Balance")}
    ${stats()}
    <section class="grid two-col section-gap">
      <div class="card panel">
        <div class="panel-title-row"><h2>Top Up Wallet</h2><span class="pill">Instant local credit</span></div>
        <form class="form-grid" data-form="top-up">
          <div class="field"><label>Amount</label><input name="amount" type="number" placeholder="10000" min="100" required /></div>
          <div class="field"><label>Payment Method</label><select name="method"><option>Bank Transfer</option><option>Card Payment</option><option>USSD</option></select></div>
          <div class="field full"><label>Narration</label><input name="narration" placeholder="Wallet top-up" /></div>
          <div class="field full"><button class="btn" type="submit">Create Deposit</button></div>
        </form>
      </div>
      <aside class="card panel">
        <div class="panel-title-row"><h2>Wallet Health</h2></div>
        <div class="list">
          <div class="list-row"><span>Deposited</span><strong>${money(db.user.deposited)}</strong></div>
          <div class="list-row"><span>Spent</span><strong>${money(db.user.spent)}</strong></div>
          <div class="list-row"><span>Current Balance</span><strong>${money(db.user.wallet)}</strong></div>
          <div class="list-row"><span>Status</span><strong>Active</strong></div>
        </div>
      </aside>
    </section>
    <section class="card section-gap">
      <div class="panel-title-row panel"><h2>Deposit History</h2><span class="small-label">Completed wallet top-ups</span></div>
      ${table(["S/N", "Reference", "Amount", "Method", "Status", "Created At"], rows)}
    </section>`
  );
}

function logs() {
  const rows = db.logs.map((log, index) => [index + 1, log.event, log.description, "127.0.0.1", log.createdAt]);
  return shell(
    "logs",
    `
    ${pageHeader("Tools & Logs", "Audit wallet changes, service attempts, account activity, and system notes.", "Logs")}
    <section class="grid three-col">
      ${stat("Login Events", "1", "This month", "L")}
      ${stat("Wallet Events", db.deposits.length, "Deposits recorded", "W")}
      ${stat("Service Events", db.orders.length, "Purchases recorded", "S")}
    </section>
    <section class="card section-gap">
      <div class="panel-title-row panel"><h2>Activity Logs</h2><span class="small-label">Most recent first</span></div>
      ${table(["S/N", "Event", "Description", "IP Address", "Created At"], rows)}
    </section>`
  );
}

function purchased() {
  const rows = db.orders.map((order, index) => [index + 1, order.kind, order.country || order.network, money(order.amount), `<span class="pill">${order.status}</span>`, order.createdAt]);
  return shell(
    "purchased",
    `
    ${pageHeader("Purchased Orders", "View everything bought from SMS rentals to SME services and invoices.", "Orders")}
    <section class="grid three-col">
      ${stat("Total Orders", db.orders.length, "Completed local orders", "O")}
      ${stat("SMS Orders", smsOrders().length, "Number rentals", "S")}
      ${stat("SME Orders", dataOrders().length, "Data purchases", "M")}
    </section>
    <section class="card section-gap">
      <div class="panel-title-row panel"><h2>Latest Orders</h2><span class="small-label">Live local data</span></div>
      ${table(["S/N", "Type", "Country / Network", "Amount", "Status", "Created At"], rows, "No orders yet.")}
    </section>`
  );
}

function contact() {
  const rows = db.tickets.map((ticket, index) => [index + 1, ticket.subject, ticket.priority, `<span class="pill neutral">${ticket.status}</span>`, ticket.createdAt]);
  return shell(
    "contact",
    `
    ${pageHeader("Contact Support", "Send a message to the support desk and keep track of your requests.", "Support")}
    <section class="grid two-col">
      <div class="card panel">
        <div class="panel-title-row"><h2>New Message</h2></div>
        <form class="form-grid" data-form="ticket">
          <div class="field"><label>Subject</label><input name="subject" placeholder="What do you need help with?" required /></div>
          <div class="field"><label>Priority</label><select name="priority"><option>Normal</option><option>High</option><option>Urgent</option></select></div>
          <div class="field full"><label>Message</label><textarea name="message" placeholder="Type your message" required></textarea></div>
          <div class="field full"><button class="btn" type="submit">Send Message</button></div>
        </form>
      </div>
      <aside class="card panel">
        <div class="panel-title-row"><h2>Support Details</h2></div>
        <div class="list">
          <div class="list-row"><span>Email</span><strong>support@wapxplus.test</strong></div>
          <div class="list-row"><span>Response</span><strong>Within 24 hours</strong></div>
          <div class="list-row"><span>Status</span><strong>Online</strong></div>
        </div>
      </aside>
    </section>
    <section class="card section-gap">
      <div class="panel-title-row panel"><h2>Tickets</h2><span class="small-label">Support history</span></div>
      ${table(["S/N", "Subject", "Priority", "Status", "Created At"], rows, "No support tickets yet.")}
    </section>`
  );
}

function billing() {
  const rows = db.invoices.map((invoice, index) => [index + 1, invoice.ref, money(invoice.amount), `<span class="pill neutral">${invoice.status}</span>`, invoice.createdAt]);
  return shell(
    "dashboard",
    `
    ${pageHeader("Billing", "Create and review invoices tied to wallet funding and service purchases.", "Quick Action")}
    <section class="grid two-col">
      <div class="card panel">
        <div class="panel-title-row"><h2>New Invoice</h2></div>
        <form class="form-grid" data-form="invoice">
          <div class="field"><label>Customer Name</label><input name="customer" value="${db.user.name}" /></div>
          <div class="field"><label>Amount</label><input name="amount" type="number" placeholder="0.00" min="1" required /></div>
          <div class="field full"><label>Description</label><input name="description" placeholder="Invoice description" required /></div>
          <div class="field full"><button class="btn" type="submit">Create Invoice</button></div>
        </form>
      </div>
      <aside class="card panel">
        <div class="panel-title-row"><h2>Billing Summary</h2></div>
        <div class="list">
          <div class="list-row"><span>Paid</span><strong>${money(db.user.deposited)}</strong></div>
          <div class="list-row"><span>Outstanding</span><strong>${money(db.invoices.reduce((sum, item) => sum + item.amount, 0))}</strong></div>
          <div class="list-row"><span>Invoices</span><strong>${db.invoices.length}</strong></div>
        </div>
      </aside>
    </section>
    <section class="card section-gap">
      <div class="panel-title-row panel"><h2>Invoices</h2><span class="small-label">Generated invoices</span></div>
      ${table(["S/N", "Invoice", "Amount", "Status", "Created At"], rows, "No invoices yet.")}
    </section>`
  );
}

function travel() {
  const rows = db.flights.map((flight, index) => [index + 1, `${flight.from} to ${flight.to}`, flight.passengers, `<span class="pill neutral">${flight.status}</span>`, flight.createdAt]);
  return shell(
    "dashboard",
    `
    ${pageHeader("Travel", "Create a flight request and keep the booking flow attached to your wallet.", "Quick Action")}
    <section class="grid two-col">
      <div class="card panel">
        <div class="panel-title-row"><h2>New Flight</h2></div>
        <form class="form-grid" data-form="flight">
          <div class="field"><label>From</label><input name="from" placeholder="Lagos" required /></div>
          <div class="field"><label>To</label><input name="to" placeholder="Abuja" required /></div>
          <div class="field"><label>Departure</label><input name="departure" type="date" required /></div>
          <div class="field"><label>Passengers</label><input name="passengers" type="number" value="1" min="1" required /></div>
          <div class="field full"><button class="btn" type="submit">Create Flight Request</button></div>
        </form>
      </div>
      <aside class="card panel">
        <div class="panel-title-row"><h2>Travel Wallet</h2></div>
        <div class="notice">Flight requests are saved as drafts until payment and confirmation are completed.</div>
      </aside>
    </section>
    <section class="card section-gap">
      <div class="panel-title-row panel"><h2>Flight Requests</h2><span class="small-label">Travel history</span></div>
      ${table(["S/N", "Route", "Passengers", "Status", "Created At"], rows, "No flight requests yet.")}
    </section>`
  );
}

function admin() {
  const smsRows = db.smsInventory.map((item, index) => [
    index + 1,
    item.service,
    item.country,
    item.number,
    money(item.price),
    `<span class="pill ${item.status === "available" ? "" : "neutral"}">${item.status}</span>`,
    `<button class="btn danger small" type="button" data-delete-sms="${item.id}">Delete</button>`,
  ]);
  const planRows = db.dataPlans.map((plan, index) => [
    index + 1,
    plan.network,
    plan.bundle,
    money(plan.price),
    plan.stock,
    `<span class="pill ${plan.stock > 0 && plan.status === "active" ? "" : "warn"}">${plan.status}</span>`,
    `<button class="btn danger small" type="button" data-delete-plan="${plan.id}">Delete</button>`,
  ]);

  const customerRows = (db.customers || []).map((customer, index) => [
    index + 1,
    customer.name,
    customer.email,
    customer.phone || "-",
    money(db.user.wallet),
    `<span class="pill">${customer.status}</span>`,
    customer.createdAt,
  ]);
  const orderRows = db.orders.map((order, index) => [
    index + 1,
    order.kind,
    order.service || order.network || "-",
    order.country || order.phone || "-",
    money(order.amount),
    `<span class="pill">${order.status}</span>`,
    order.createdAt,
  ]);
  const logRows = db.logs.map((log, index) => [index + 1, log.event, log.description, "127.0.0.1", log.createdAt]);

  return adminShell(
    `
    ${adminHeader("Store Control Center", "Manage sellable inventory, remove unavailable products, inspect customers, review purchases, and audit every wallet/service event.", '<button class="btn secondary" type="button" data-reset-demo>Reset Demo Data</button>')}
    <section id="overview" class="grid stats-grid">
      ${stat("SMS Available", availableSms().length, "Numbers customers can buy", "S")}
      ${stat("SMS Sold", db.smsInventory.filter((item) => item.status === "sold").length, "Purchased numbers", "X")}
      ${stat("Data Plans", db.dataPlans.length, "Plans in catalog", "D")}
      ${stat("Data Units", db.dataPlans.reduce((sum, plan) => sum + Number(plan.stock || 0), 0), "Available plan stock", "U")}
    </section>
    <section id="products" class="grid two-col section-gap">
      <div class="card panel">
        <div class="panel-title-row"><h2>Add SMS Number</h2><span class="pill neutral">Customer stock</span></div>
        <form class="form-grid" data-form="admin-sms">
          <div class="field"><label>Service</label><input name="service" placeholder="WhatsApp" required /></div>
          <div class="field"><label>Country</label><input name="country" placeholder="Nigeria" required /></div>
          <div class="field"><label>Number</label><input name="number" placeholder="+234 800 000 0000" required /></div>
          <div class="field"><label>Code</label><input name="code" placeholder="Waiting or 123456" /></div>
          <div class="field"><label>Price</label><input name="price" type="number" min="1" value="350" required /></div>
          <div class="field full"><button class="btn" type="submit">Add SMS Stock</button></div>
        </form>
      </div>
      <div class="card panel">
        <div class="panel-title-row"><h2>Add SME Data Plan</h2><span class="pill neutral">Data inventory</span></div>
        <form class="form-grid" data-form="admin-plan">
          <div class="field"><label>Network</label><input name="network" placeholder="MTN" required /></div>
          <div class="field"><label>Bundle</label><input name="bundle" placeholder="1GB - 30 Days" required /></div>
          <div class="field"><label>Price</label><input name="price" type="number" min="1" value="650" required /></div>
          <div class="field"><label>Stock Units</label><input name="stock" type="number" min="0" value="10" required /></div>
          <div class="field full"><button class="btn" type="submit">Add Data Plan</button></div>
        </form>
      </div>
    </section>
    <section class="card section-gap">
      <div class="panel-title-row panel"><h2>SMS Inventory</h2><span class="small-label">Available items can be purchased by customers</span></div>
      ${table(["S/N", "Service", "Country", "Number", "Price", "Status", "Action"], smsRows, "No SMS inventory yet.")}
    </section>
    <section class="card section-gap">
      <div class="panel-title-row panel"><h2>SME Data Inventory</h2><span class="small-label">Stock decreases after purchase</span></div>
      ${table(["S/N", "Network", "Bundle", "Price", "Stock", "Status", "Action"], planRows, "No data plans yet.")}
    </section>
    <section id="customers" class="card section-gap">
      <div class="panel-title-row panel"><h2>Customers</h2><span class="small-label">Customer accounts and wallet status</span></div>
      ${table(["S/N", "Name", "Email", "Phone", "Wallet", "Status", "Created At"], customerRows, "No customers yet.")}
    </section>
    <section id="orders" class="card section-gap">
      <div class="panel-title-row panel"><h2>Customer Orders</h2><span class="small-label">Every SMS and SME purchase</span></div>
      ${table(["S/N", "Type", "Product", "Country / Phone", "Amount", "Status", "Created At"], orderRows, "No customer orders yet.")}
    </section>
    <section id="logs" class="card section-gap">
      <div class="panel-title-row panel"><h2>Tools & Logs</h2><span class="small-label">Audit wallet changes, service attempts, account activity, and system notes</span></div>
      ${table(["S/N", "Event", "Description", "IP Address", "Created At"], logRows, "No activity logs yet.")}
    </section>`
  );
}

function auth(type) {
  const isRegister = type === "register";
  const isReset = type === "reset";
  const isAdmin = type === "admin-login";
  const title = isRegister ? "Create account" : isReset ? "Reset password" : isAdmin ? "Admin login" : "Welcome back";
  const subtitle = isAdmin
    ? "Enter the admin inventory desk. This demo opens directly after login."
    : isRegister
      ? "Set up your Savage customer account and start managing wallet services."
      : isReset
        ? "Enter your email and we will prepare a password reset link."
        : "Sign in to manage your wallet, services, orders, and support requests.";

  return `
    <div class="auth-body">
      <section class="auth-side">
        <a class="brand" href="index.html"><span class="brand-mark">S</span><span><strong>Savage</strong><span>${isAdmin ? "Admin Portal" : "Customer Portal"}</span></span></a>
        <div>
          <h1>Your store activity, wallet, inventory, and services in one calm workspace.</h1>
          <p>Track deposits, buy services, stock inventory, review orders, and contact support from a focused local prototype.</p>
        </div>
        <p>Copyright 2024 © Wapx PLUS +</p>
      </section>
      <main class="auth-panel-wrap">
        <section class="card auth-panel">
          <span class="brand-mark">S</span>
          <h2>${title}</h2>
          <p class="subtitle">${subtitle}</p>
          <form class="form-grid">
            ${isRegister ? '<div class="field full"><label>Full Name</label><input placeholder="User" /></div>' : ""}
            <div class="field full"><label>Email Address</label><input type="email" value="${isAdmin ? "admin@savage.test" : ""}" placeholder="you@example.com" /></div>
            ${!isReset ? '<div class="field full"><label>Password</label><input type="password" value="password" placeholder="Enter password" /></div>' : ""}
            ${isRegister ? '<div class="field full"><label>Confirm Password</label><input type="password" placeholder="Confirm password" /></div>' : ""}
            <div class="field full"><a class="btn" href="${isAdmin ? "admin.html" : "index.html"}">${isRegister ? "Create Account" : isReset ? "Send Reset Link" : "Login"}</a></div>
          </form>
          <div class="auth-links">
            ${
              isRegister
                ? '<span>Already have an account?</span><a href="login.html">Login</a>'
                : isReset
                  ? '<span>Remembered it?</span><a href="login.html">Back to login</a>'
                  : isAdmin
                    ? '<a href="login.html">Customer login</a><a href="index.html">Dashboard</a>'
                    : '<a href="forgot-password.html">Forgot password?</a><a href="register.html">Create account</a>'
            }
          </div>
        </section>
      </main>
    </div>`;
}

function showToast(message, tone = "success") {
  const toast = document.querySelector("[data-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${tone}`;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2800);
}

function updateSmsEstimate(form) {
  const service = form.elements.service?.value;
  const country = form.elements.country?.value;
  const quantity = Math.max(1, Number(form.elements.quantity?.value || 1));
  const matching = availableSms().filter((item) => item.service === service && item.country === country);
  const price = matching[0]?.price || 0;
  form.elements.estimate.value = matching.length ? `${money(price * quantity)} (${matching.length} available)` : "No matching stock";
}

function buySms(form) {
  const service = form.elements.service.value;
  const country = form.elements.country.value;
  const quantity = Math.max(1, Number(form.elements.quantity.value || 1));
  const stock = availableSms().filter((item) => item.service === service && item.country === country).slice(0, quantity);
  if (stock.length < quantity) return showToast("Not enough SMS inventory for that service and country.", "error");
  const total = stock.reduce((sum, item) => sum + Number(item.price), 0);
  if (db.user.wallet < total) return showToast(`Insufficient wallet balance. Top up at least ${money(total - db.user.wallet)}.`, "error");

  stock.forEach((item) => {
    item.status = "sold";
    db.orders.unshift({
      id: uid("ord"),
      kind: "SMS",
      service: item.service,
      country: item.country,
      number: item.number,
      code: item.code || "Waiting",
      amount: item.price,
      status: "Completed",
      createdAt: now(),
    });
  });
  db.user.wallet -= total;
  db.user.spent += total;
  db.updated = now();
  addLog("SMS Purchase", `Bought ${quantity} ${service} number(s) for ${money(total)}.`);
  saveDb(db);
  renderPage();
  showToast("SMS number purchased from available inventory.");
}

function buyData(form) {
  const plan = db.dataPlans.find((item) => item.id === form.elements.planId.value);
  const quantity = Math.max(1, Number(form.elements.quantity.value || 1));
  const phone = form.elements.phone.value.trim();
  if (!plan || plan.status !== "active") return showToast("Selected data plan is unavailable.", "error");
  if (!phone) return showToast("Enter the customer phone number.", "error");
  if (plan.stock < quantity) return showToast("Not enough SME data stock for that plan.", "error");
  const total = plan.price * quantity;
  if (db.user.wallet < total) return showToast(`Insufficient wallet balance. Top up at least ${money(total - db.user.wallet)}.`, "error");

  plan.stock -= quantity;
  if (plan.stock <= 0) plan.status = "out of stock";
  db.user.wallet -= total;
  db.user.spent += total;
  db.orders.unshift({
    id: uid("ord"),
    kind: "SME",
    network: plan.network,
    bundle: `${quantity} x ${plan.bundle}`,
    phone,
    amount: total,
    status: "Completed",
    createdAt: now(),
  });
  db.updated = now();
  addLog("SME Purchase", `Bought ${quantity} ${plan.network} ${plan.bundle} bundle(s) for ${money(total)}.`);
  saveDb(db);
  renderPage();
  showToast("Data purchase completed and stock was reduced.");
}

function topUp(form) {
  const amount = Number(form.elements.amount.value || 0);
  const method = form.elements.method.value;
  if (amount < 100) return showToast("Enter a top-up amount of at least ₦100.00.", "error");
  db.user.wallet += amount;
  db.user.deposited += amount;
  db.deposits.unshift({ id: uid("dep"), ref: `WAL-${Date.now()}`, amount, method, status: "Completed", createdAt: now() });
  db.updated = now();
  addLog("Wallet Top-up", `Completed wallet top-up of ${money(amount)}.`);
  saveDb(db);
  renderPage();
  showToast("Wallet credited.");
}

function addSms(form) {
  db.smsInventory.unshift({
    id: uid("sms"),
    service: form.elements.service.value.trim(),
    country: form.elements.country.value.trim(),
    number: form.elements.number.value.trim(),
    code: form.elements.code.value.trim() || "Waiting",
    price: Number(form.elements.price.value || 0),
    status: "available",
  });
  addLog("Admin Stock", "Added a new SMS number to customer inventory.");
  saveDb(db);
  renderPage();
  showToast("SMS inventory added.");
}

function addPlan(form) {
  const stock = Number(form.elements.stock.value || 0);
  db.dataPlans.unshift({
    id: uid("data"),
    network: form.elements.network.value.trim(),
    bundle: form.elements.bundle.value.trim(),
    price: Number(form.elements.price.value || 0),
    stock,
    status: stock > 0 ? "active" : "out of stock",
  });
  addLog("Admin Stock", "Added a new SME data plan to customer inventory.");
  saveDb(db);
  renderPage();
  showToast("Data plan added.");
}

function createTicket(form) {
  db.tickets.unshift({
    id: uid("tic"),
    subject: form.elements.subject.value.trim(),
    priority: form.elements.priority.value,
    message: form.elements.message.value.trim(),
    status: "Open",
    createdAt: now(),
  });
  addLog("Support Ticket", `Created support ticket: ${form.elements.subject.value.trim()}.`);
  saveDb(db);
  renderPage();
  showToast("Support ticket created.");
}

function createInvoice(form) {
  const amount = Number(form.elements.amount.value || 0);
  if (amount <= 0) return showToast("Enter an invoice amount.", "error");
  db.invoices.unshift({ id: uid("inv"), ref: `INV-${Date.now()}`, amount, status: "Draft", createdAt: now() });
  addLog("Invoice", `Created draft invoice for ${money(amount)}.`);
  saveDb(db);
  renderPage();
  showToast("Invoice created.");
}

function createFlight(form) {
  db.flights.unshift({
    id: uid("flt"),
    from: form.elements.from.value.trim(),
    to: form.elements.to.value.trim(),
    departure: form.elements.departure.value,
    passengers: form.elements.passengers.value,
    status: "Draft",
    createdAt: now(),
  });
  addLog("Flight Request", `Created flight request from ${form.elements.from.value.trim()} to ${form.elements.to.value.trim()}.`);
  saveDb(db);
  renderPage();
  showToast("Flight request saved.");
}

function bindPage() {
  const menu = document.querySelector("[data-menu]");
  if (menu) menu.addEventListener("click", () => document.body.classList.toggle("menu-open"));

  const smsForm = document.querySelector('[data-form="buy-sms"]');
  if (smsForm) {
    updateSmsEstimate(smsForm);
    smsForm.addEventListener("input", () => updateSmsEstimate(smsForm));
    smsForm.addEventListener("change", () => updateSmsEstimate(smsForm));
  }
}

function renderPage() {
  const root = document.querySelector("#app");
  const page = document.body.dataset.page || "dashboard";
  root.innerHTML = (renderers[page] || dashboard)();
  bindPage();
}

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-form]");
  if (!form) return;
  event.preventDefault();
  const type = form.dataset.form;
  if (type === "buy-sms") buySms(form);
  if (type === "buy-data") buyData(form);
  if (type === "top-up") topUp(form);
  if (type === "admin-sms") addSms(form);
  if (type === "admin-plan") addPlan(form);
  if (type === "ticket") createTicket(form);
  if (type === "invoice") createInvoice(form);
  if (type === "flight") createFlight(form);
});

document.addEventListener("click", (event) => {
  const link = event.target.closest(".nav-link");
  if (link) document.body.classList.remove("menu-open");

  const deleteSms = event.target.closest("[data-delete-sms]");
  if (deleteSms) {
    db.smsInventory = db.smsInventory.filter((item) => item.id !== deleteSms.dataset.deleteSms);
    addLog("Admin Stock", "Deleted an SMS inventory item.");
    saveDb(db);
    renderPage();
    showToast("SMS inventory deleted.");
  }

  const deletePlan = event.target.closest("[data-delete-plan]");
  if (deletePlan) {
    db.dataPlans = db.dataPlans.filter((item) => item.id !== deletePlan.dataset.deletePlan);
    addLog("Admin Stock", "Deleted a data plan.");
    saveDb(db);
    renderPage();
    showToast("Data plan deleted.");
  }

  if (event.target.closest("[data-reset-demo]")) {
    db = clone(defaults);
    saveDb(db);
    renderPage();
    showToast("Demo data reset.");
  }
});

const renderers = {
  dashboard,
  sms: smsServices,
  sme: smeServices,
  balance,
  logs,
  purchased,
  contact,
  billing,
  travel,
  admin,
  login: () => auth("login"),
  register: () => auth("register"),
  reset: () => auth("reset"),
  adminLogin: () => auth("admin-login"),
};

document.addEventListener("DOMContentLoaded", renderPage);
