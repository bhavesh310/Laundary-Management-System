const API = 'https://laundary-management-system-a14k.onrender.com/';  // Same origin

// ── Price config ──────────────────────────────────────────────────────────────
let PRICES = {
  shirt:50,pants:60,saree:120,suit:200,jacket:150,
  dress:100,kurta:70,lehenga:250,bedsheet:80,curtain:90,
  blanket:130,towel:30
};

// ── Navigation ────────────────────────────────────────────────────────────────
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  event?.target?.closest('.nav-btn')?.classList.add('active');
  if(id==='dashboard') loadDashboard();
  if(id==='orders') loadOrders();
  if(id==='prices') loadPrices();
  if(id==='create') { loadPrices(); if(!document.querySelectorAll('.garment-row').length) addGarmentRow(); }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, type=''){
  const t=document.getElementById('toast');
  const el=document.createElement('div');
  el.className=`toast-msg ${type}`;
  el.innerHTML=`${type==='success'?'✓':type==='error'?'✕':'ℹ'} ${msg}`;
  t.appendChild(el);
  setTimeout(()=>el.style.opacity='0',2800);
  setTimeout(()=>el.remove(),3100);
}

// ── API helpers ───────────────────────────────────────────────────────────────
async function api(path,opts={}){
  const r=await fetch(API+'/api'+path,{
    headers:{'Content-Type':'application/json'},
    ...opts
  });
  return r.json();
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function badge(status){
  const cls={RECEIVED:'badge-received',PROCESSING:'badge-processing',
              READY:'badge-ready',DELIVERED:'badge-delivered'};
  return `<span class="badge ${cls[status]||''}">${status}</span>`;
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
async function loadDashboard(){
  const d=await api('/dashboard');
  const db=d.dashboard;
  document.getElementById('stat-total').textContent=db.totalOrders;
  document.getElementById('stat-revenue').textContent='₹'+db.totalRevenue.toLocaleString('en-IN');
  document.getElementById('stat-today').textContent=db.todayOrders;
  document.getElementById('stat-today-rev').textContent='₹'+db.todayRevenue.toLocaleString('en-IN')+' today';
  document.getElementById('stat-pending').textContent=(db.ordersByStatus.RECEIVED||0)+(db.ordersByStatus.PROCESSING||0);
  document.getElementById('s-received').textContent=db.ordersByStatus.RECEIVED||0;
  document.getElementById('s-processing').textContent=db.ordersByStatus.PROCESSING||0;
  document.getElementById('s-ready').textContent=db.ordersByStatus.READY||0;
  document.getElementById('s-delivered').textContent=db.ordersByStatus.DELIVERED||0;

  // Top garments
  const maxCount=db.topGarments[0]?.count||1;
  document.getElementById('top-garments').innerHTML=db.topGarments.length?
    db.topGarments.map(g=>`
      <div class="top-garment-row">
        <div style="flex:1">
          <div style="font-weight:600;font-size:13px;text-transform:capitalize">${g.name}</div>
          <div class="garment-bar"><div class="garment-bar-fill" style="width:${Math.round(g.count/maxCount*100)}%"></div></div>
        </div>
        <div style="font-family:'DM Mono',monospace;font-size:13px;margin-left:12px">${g.count} pcs</div>
      </div>`).join('')
    :'<div class="empty" style="padding:20px"><div class="icon">📦</div><p>No data yet</p></div>';

  // Recent orders
  const tbody=document.querySelector('#recent-orders-table tbody');
  tbody.innerHTML=db.recentOrders.length?
    db.recentOrders.map(o=>`
      <tr>
        <td><span class="order-id">${o.id}</span></td>
        <td><span class="customer-name">${o.customerName}</span></td>
        <td>${badge(o.status)}</td>
        <td style="font-weight:700">₹${o.totalAmount}</td>
        <td><button class="btn btn-outline btn-sm" onclick="viewOrder('${o.id}')">View</button></td>
      </tr>`).join('')
    :'<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px">No orders yet</td></tr>';
}

// ── PRICES ────────────────────────────────────────────────────────────────────
async function loadPrices(){
  const d=await api('/prices');
  PRICES=d.prices;
  document.getElementById('price-grid').innerHTML=
    Object.entries(PRICES).map(([name,price])=>`
      <div style="padding:14px;border:1px solid var(--border);border-radius:10px;display:flex;justify-content:space-between;align-items:center;background:#fff">
        <div>
          <div style="font-weight:700;text-transform:capitalize;font-size:14px">${name}</div>
          <div style="font-size:11px;color:var(--text-muted)">per piece</div>
        </div>
        <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--teal)">₹${price}</div>
      </div>`).join('');
}

// ── CREATE ORDER ──────────────────────────────────────────────────────────────
let garmentIdCounter=0;

function addGarmentRow(name='',qty=1,priceOverride=''){
  const id=++garmentIdCounter;
  const garmentOptions=Object.keys(PRICES).map(g=>`<option value="${g}" ${g===name.toLowerCase()?'selected':''}>${g.charAt(0).toUpperCase()+g.slice(1)}</option>`).join('');
  const row=document.createElement('div');
  row.className='garment-row';
  row.id='grow-'+id;
  row.innerHTML=`
    <select onchange="updateGarmentPrice(${id})" id="g-name-${id}">
      <option value="">Select garment</option>
      ${garmentOptions}
    </select>
    <input type="number" min="1" value="${qty}" id="g-qty-${id}" oninput="updateBill()"/>
    <input type="number" min="0" placeholder="Auto" value="${priceOverride}" id="g-price-${id}" oninput="updateBill()"/>
    <span class="price-display" id="g-total-${id}">₹0</span>
    <button class="remove-btn" onclick="removeGarmentRow(${id})">✕</button>
  `;
  document.getElementById('garment-rows').appendChild(row);
  updateGarmentPrice(id);
}

function updateGarmentPrice(id){
  const nameEl=document.getElementById(`g-name-${id}`);
  const priceEl=document.getElementById(`g-price-${id}`);
  const name=nameEl?.value;
  if(name && !priceEl.value){
    priceEl.placeholder=PRICES[name]||50;
  }
  updateBill();
}

function removeGarmentRow(id){
  document.getElementById('grow-'+id)?.remove();
  updateBill();
}

function updateBill(){
  const rows=document.querySelectorAll('.garment-row');
  let total=0,itemCount=0;
  rows.forEach(row=>{
    const id=row.id.replace('grow-','');
    const qty=parseInt(document.getElementById(`g-qty-${id}`)?.value)||0;
    const name=document.getElementById(`g-name-${id}`)?.value;
    const priceInput=parseFloat(document.getElementById(`g-price-${id}`)?.value);
    const price=priceInput||(name?PRICES[name]||50:0);
    const lineTotal=qty*price;
    const totalEl=document.getElementById(`g-total-${id}`);
    if(totalEl) totalEl.textContent='₹'+lineTotal;
    total+=lineTotal;
    if(qty>0&&name) itemCount+=qty;
  });
  document.getElementById('bill-total').textContent='₹'+total.toLocaleString('en-IN');
  document.getElementById('bill-items-count').textContent=itemCount+' item'+(itemCount!==1?'s':'');
}

async function submitOrder(){
  const name=document.getElementById('c-name').value.trim();
  const phone=document.getElementById('c-phone').value.trim();
  const rows=document.querySelectorAll('.garment-row');
  const garments=[];
  rows.forEach(row=>{
    const id=row.id.replace('grow-','');
    const gname=document.getElementById(`g-name-${id}`)?.value;
    const qty=parseInt(document.getElementById(`g-qty-${id}`)?.value)||0;
    const priceInput=parseFloat(document.getElementById(`g-price-${id}`)?.value);
    const price=priceInput||(gname?PRICES[gname]||50:50);
    if(gname&&qty>0) garments.push({name:gname,quantity:qty,pricePerItem:price});
  });
  if(!name){toast('Customer name required','error');return;}
  if(!phone||!/^\d{10}$/.test(phone)){toast('Enter valid 10-digit phone','error');return;}
  if(!garments.length){toast('Add at least one garment','error');return;}

  const btn=document.getElementById('submit-btn');
  btn.innerHTML='<span class="loading"></span> Processing...';
  btn.disabled=true;

  const d=await api('/orders',{method:'POST',body:JSON.stringify({customerName:name,phoneNumber:phone,garments})});
  btn.innerHTML='✓ Place Order';btn.disabled=false;

  if(d.success){
    toast('Order '+d.order.id+' created!','success');
    showReceipt(d.order);
    resetForm();
  } else {
    toast(d.error||'Failed to create order','error');
  }
}

function resetForm(){
  document.getElementById('c-name').value='';
  document.getElementById('c-phone').value='';
  document.getElementById('garment-rows').innerHTML='';
  garmentIdCounter=0;
  addGarmentRow();
  updateBill();
}

// ── ORDERS LIST ───────────────────────────────────────────────────────────────
async function loadOrders(){
  const name=document.getElementById('f-name')?.value||'';
  const phone=document.getElementById('f-phone')?.value||'';
  const status=document.getElementById('f-status')?.value||'';
  const garment=document.getElementById('f-garment')?.value||'';
  let q=new URLSearchParams();
  if(name) q.set('name',name);
  if(phone) q.set('phone',phone);
  if(status) q.set('status',status);
  if(garment) q.set('garment',garment);

  const d=await api('/orders?'+q.toString());
  document.getElementById('orders-count').textContent=d.total+' order'+(d.total!==1?'s':'');
  const tbody=document.getElementById('orders-body');

  if(!d.orders.length){
    tbody.innerHTML=`<tr><td colspan="7"><div class="empty"><div class="icon">🧺</div><p>No orders found</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML=d.orders.map(o=>{
    const gSummary=o.garments.map(g=>`${g.quantity}× ${g.name}`).join(', ');
    return `<tr>
      <td><span class="order-id">${o.id}</span></td>
      <td>
        <div class="customer-name">${o.customerName}</div>
        <div class="customer-phone">${o.phoneNumber}</div>
      </td>
      <td style="max-width:180px;font-size:12px;color:var(--text-muted)">${gSummary}</td>
      <td style="font-weight:700;font-family:'Syne',sans-serif">₹${o.totalAmount.toLocaleString('en-IN')}</td>
      <td>${badge(o.status)}</td>
      <td style="font-family:'DM Mono',monospace;font-size:11px">${o.estimatedDelivery||'—'}</td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-outline btn-sm" onclick="viewOrder('${o.id}')">View</button>
          ${o.status!=='DELIVERED'?`<button class="btn btn-sm" style="background:var(--teal);color:#fff" onclick="openStatusModal('${o.id}','${o.status}')">Update</button>`:''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function clearFilters(){
  ['f-name','f-phone','f-status','f-garment'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.value='';
  });
  loadOrders();
}

// ── VIEW ORDER ────────────────────────────────────────────────────────────────
async function viewOrder(id){
  const d=await api('/orders/'+id);
  if(!d.success){toast('Order not found','error');return;}
  const o=d.order;
  document.getElementById('modal-order-id').textContent=o.id;
  document.getElementById('modal-body').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
      <div><div style="font-size:11px;color:var(--text-muted);font-family:'DM Mono',monospace;margin-bottom:4px">CUSTOMER</div><div style="font-weight:700">${o.customerName}</div><div style="font-size:12px;color:var(--text-muted)">${o.phoneNumber}</div></div>
      <div><div style="font-size:11px;color:var(--text-muted);font-family:'DM Mono',monospace;margin-bottom:4px">STATUS</div>${badge(o.status)}</div>
      <div><div style="font-size:11px;color:var(--text-muted);font-family:'DM Mono',monospace;margin-bottom:4px">TOTAL AMOUNT</div><div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--teal)">₹${o.totalAmount.toLocaleString('en-IN')}</div></div>
      <div><div style="font-size:11px;color:var(--text-muted);font-family:'DM Mono',monospace;margin-bottom:4px">EST. DELIVERY</div><div style="font-weight:600">${o.estimatedDelivery||'—'}</div></div>
    </div>
    <div style="margin-bottom:20px">
      <div style="font-size:11px;color:var(--text-muted);font-family:'DM Mono',monospace;margin-bottom:8px">GARMENTS</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr style="border-bottom:1px solid var(--border)">
          <th style="text-align:left;padding:6px 0;color:var(--text-muted);font-family:'DM Mono',monospace;font-size:11px">Item</th>
          <th style="text-align:right;padding:6px 0;color:var(--text-muted);font-family:'DM Mono',monospace;font-size:11px">Qty</th>
          <th style="text-align:right;padding:6px 0;color:var(--text-muted);font-family:'DM Mono',monospace;font-size:11px">Rate</th>
          <th style="text-align:right;padding:6px 0;color:var(--text-muted);font-family:'DM Mono',monospace;font-size:11px">Total</th>
        </tr>
        ${o.garments.map(g=>`<tr style="border-bottom:1px solid var(--border)"><td style="padding:8px 0;text-transform:capitalize">${g.name}</td><td style="text-align:right">${g.quantity}</td><td style="text-align:right">₹${g.pricePerItem}</td><td style="text-align:right;font-weight:700">₹${g.quantity*g.pricePerItem}</td></tr>`).join('')}
      </table>
    </div>
    <div>
      <div style="font-size:11px;color:var(--text-muted);font-family:'DM Mono',monospace;margin-bottom:8px">STATUS HISTORY</div>
      <div class="timeline">
        ${o.statusHistory.map(h=>`
          <div class="tl-item">
            <div class="tl-dot ${h.status===o.status?'current':'done'}"></div>
            <div class="tl-info">
              <div class="tl-status">${h.status}</div>
              <div class="tl-time">${new Date(h.timestamp).toLocaleString('en-IN')}${h.note?' — '+h.note:''}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;
  openModal('modal-detail');
}

// ── STATUS UPDATE ─────────────────────────────────────────────────────────────
function openStatusModal(orderId, currentStatus){
  const flow=['RECEIVED','PROCESSING','READY','DELIVERED'];
  const currentIdx=flow.indexOf(currentStatus);
  const next=flow.slice(currentIdx+1);

  document.getElementById('modal-status-body').innerHTML=`
    <div style="margin-bottom:16px">
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">Current: ${badge(currentStatus)}</div>
    </div>
    <div style="margin-bottom:16px">
      <label style="display:block;margin-bottom:6px">New Status</label>
      <select id="new-status" style="width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:8px;font-size:14px">
        ${next.map(s=>`<option value="${s}">${s}</option>`).join('')}
      </select>
    </div>
    <div style="margin-bottom:20px">
      <label style="display:block;margin-bottom:6px">Note (optional)</label>
      <input type="text" id="status-note" placeholder="e.g. Ready for pickup" style="width:100%"/>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end">
      <button class="btn btn-outline btn-sm" onclick="closeModal('modal-status')">Cancel</button>
      <button class="btn btn-success btn-sm" onclick="updateStatus('${orderId}')">Update Status</button>
    </div>
  `;
  openModal('modal-status');
}

async function updateStatus(orderId){
  const status=document.getElementById('new-status').value;
  const note=document.getElementById('status-note').value;
  const d=await api('/orders/'+orderId+'/status',{method:'PATCH',body:JSON.stringify({status,note})});
  if(d.success){
    toast('Status updated to '+status,'success');
    closeModal('modal-status');
    loadOrders();
  } else {
    toast(d.error||'Update failed','error');
  }
}

// ── RECEIPT ───────────────────────────────────────────────────────────────────
function showReceipt(order){
  document.getElementById('receipt-body').innerHTML=`
    <div class="receipt">
      <div class="receipt-header">
        <div class="receipt-title">🧺 CleanTrack</div>
        <div class="receipt-id">${order.id}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${new Date(order.createdAt).toLocaleString('en-IN')}</div>
      </div>
      <div class="receipt-row"><span>Customer</span><span>${order.customerName}</span></div>
      <div class="receipt-row"><span>Phone</span><span>${order.phoneNumber}</span></div>
      <hr class="receipt-divider"/>
      ${order.garments.map(g=>`<div class="receipt-row"><span style="text-transform:capitalize">${g.name} × ${g.quantity}</span><span>₹${g.quantity*g.pricePerItem}</span></div>`).join('')}
      <hr class="receipt-divider"/>
      <div class="receipt-row receipt-total"><span>TOTAL</span><span>₹${order.totalAmount.toLocaleString('en-IN')}</span></div>
      <div class="receipt-delivery">📅 Estimated Delivery: ${order.estimatedDelivery}</div>
    </div>
  `;
  openModal('modal-receipt');
}

// ── MODAL HELPERS ─────────────────────────────────────────────────────────────
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-overlay').forEach(m=>{
  m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');});
});

// ── INIT ──────────────────────────────────────────────────────────────────────
loadDashboard();
loadPrices();
// Pre-add a garment row on create page
setTimeout(()=>{ addGarmentRow(); },100);
