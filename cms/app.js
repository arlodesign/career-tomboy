// ─── State ────────────────────────────────────────────────────────────────────
let gigs = [];
let videos = { featured: {}, videos: [] };
let songs = [];
let members = [];

let editGigIdx = null;
let editVideoIdx = null;
let editSongIdx = null;
let editMemberIdx = null;

// ─── Utility ──────────────────────────────────────────────────────────────────
async function api(method, path, body) {
    const res = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

function esc(s) {
    if (s == null) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function nullish(val) {
    const s = val?.trim();
    return s === '' ? null : s || null;
}

function fmtDate(d) {
    if (!d) return '—';
    const dt = new Date(d + (d.includes('T') ? '' : 'T00:00:00'));
    return dt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: d.includes('T') ? 'numeric' : undefined,
        minute: d.includes('T') ? '2-digit' : undefined,
    });
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function showTab(name, e) {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('nav button').forEach((b) => b.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
    e.currentTarget.classList.add('active');
}

// ─── Error toast ──────────────────────────────────────────────────────────────
let toastTimer;

function showError(msg) {
    const toast = document.getElementById('error-toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 6000);
}

window.addEventListener('unhandledrejection', (e) => {
    showError('Error: ' + (e.reason?.message || String(e.reason)));
    e.preventDefault();
});

// ─── Modals ───────────────────────────────────────────────────────────────────
function openModal(id) {
    document.getElementById(id).classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach((el) => {
    el.addEventListener('click', (e) => {
        if (e.target === el) el.classList.remove('open');
    });
});

// ─── Gigs ─────────────────────────────────────────────────────────────────────
async function loadGigs() {
    const data = await api('GET', '/api/gigs');
    gigs = data.gigs || [];
    renderGigs();
}

function renderGigs() {
    const tbody = document.getElementById('gigs-body');
    if (!gigs.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No gigs yet.</td></tr>';
        return;
    }
    tbody.innerHTML = gigs
        .map(
            (g, i) => `
<tr>
  <td>${esc(fmtDate(g.date))}</td>
  <td>${esc(g.venue)}</td>
  <td>${esc(g.supporting) || '<span style="color:var(--muted)">—</span>'}</td>
  <td><span class="badge ${g.isPrivate ? 'badge-yes' : 'badge-no'}">${g.isPrivate ? 'Yes' : 'No'}</span></td>
  <td><div class="actions">
    <button class="btn btn-secondary btn-sm" onclick="openGigModal(${i})">Edit</button>
    <button class="btn btn-danger btn-sm" onclick="deleteGig(${i})">Delete</button>
  </div></td>
</tr>`,
        )
        .join('');
}

async function saveGigs() {
    await api('PUT', '/api/gigs', { gigs });
}

function openGigModal(idx) {
    editGigIdx = idx ?? null;
    const g = idx != null ? gigs[idx] : {};
    document.getElementById('gig-modal-title').textContent = idx != null ? 'Edit Gig' : 'Add Gig';
    let dateVal = '';
    if (g.date) {
        const d = g.date.includes('T') ? g.date : g.date + 'T00:00';
        dateVal = d.slice(0, 16); // yyyy-MM-ddTHH:mm
    }
    document.getElementById('g-date').value = dateVal;
    document.getElementById('g-venue').value = g.venue || '';
    document.getElementById('g-address').value = g.address || '';
    document.getElementById('g-ticketUrl').value = g.ticketUrl || '';
    document.getElementById('g-supporting').value = g.supporting || '';
    document.getElementById('g-notes').value = g.notes || '';
    document.getElementById('g-isPrivate').checked = !!g.isPrivate;
    openModal('gig-modal');
}

async function saveGig(event) {
    event.preventDefault();
    const dateRaw = document.getElementById('g-date').value;
    // Keep time if user picked a time, otherwise store date only
    let date = dateRaw;
    if (date.endsWith('T00:00')) {
        date = date.slice(0, 10);
    }
    const gig = {
        date,
        venue: document.getElementById('g-venue').value.trim(),
        address: nullish(document.getElementById('g-address').value),
        ticketUrl: nullish(document.getElementById('g-ticketUrl').value),
        supporting: nullish(document.getElementById('g-supporting').value),
        notes: nullish(document.getElementById('g-notes').value),
        isPrivate: document.getElementById('g-isPrivate').checked,
    };
    if (editGigIdx != null) gigs[editGigIdx] = gig;
    else gigs.push(gig);
    await saveGigs();
    renderGigs();
    closeModal('gig-modal');
}

async function deleteGig(idx) {
    if (!confirm(`Delete "${gigs[idx].venue}" on ${fmtDate(gigs[idx].date)}?`)) return;
    gigs.splice(idx, 1);
    await saveGigs();
    renderGigs();
}

// ─── Videos ───────────────────────────────────────────────────────────────────
async function loadVideos() {
    videos = await api('GET', '/api/videos');
    renderFeatured();
    renderVideos();
}

function renderFeatured() {
    const f = videos.featured || {};
    document.getElementById('featured-title').textContent = f.title || '(no title)';
    document.getElementById('featured-desc').textContent = f.description || '';
    document.getElementById('featured-id').textContent = f.youtubeId ? 'ID: ' + f.youtubeId : '';
}

function renderVideos() {
    const tbody = document.getElementById('videos-body');
    const list = videos.videos || [];
    if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">No additional videos.</td></tr>';
        return;
    }
    tbody.innerHTML = list
        .map(
            (v, i) => `
<tr draggable="true" data-idx="${i}">
  <td><span class="drag-handle" title="Drag to reorder">⠿</span></td>
  <td><code>${esc(v.youtubeId)}</code></td>
  <td>${esc(v.title)}</td>
  <td style="color:var(--muted)">${esc(v.description)}</td>
  <td><div class="actions">
    <button class="btn btn-secondary btn-sm" onclick="openVideoModal(${i})">Edit</button>
    <button class="btn btn-danger btn-sm" onclick="deleteVideo(${i})">Delete</button>
  </div></td>
</tr>`,
        )
        .join('');
    initVideoDrag();
}

let dragSrcIdx = null;

function initVideoDrag() {
    const tbody = document.getElementById('videos-body');
    tbody.querySelectorAll('tr[draggable]').forEach((row) => {
        row.addEventListener('dragstart', (e) => {
            dragSrcIdx = parseInt(row.dataset.idx, 10);
            row.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        row.addEventListener('dragend', () => {
            dragSrcIdx = null;
            row.classList.remove('dragging');
            tbody.querySelectorAll('tr').forEach((r) => r.classList.remove('drag-over'));
        });
        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            tbody.querySelectorAll('tr').forEach((r) => r.classList.remove('drag-over'));
            row.classList.add('drag-over');
        });
        row.addEventListener('drop', async (e) => {
            e.preventDefault();
            const targetIdx = parseInt(row.dataset.idx, 10);
            if (dragSrcIdx === targetIdx) return;
            const [moved] = videos.videos.splice(dragSrcIdx, 1);
            videos.videos.splice(targetIdx, 0, moved);
            await saveVideos();
            renderVideos();
        });
    });
}

async function saveVideos() {
    await api('PUT', '/api/videos', videos);
}

function openFeaturedModal() {
    const f = videos.featured || {};
    document.getElementById('fv-id').value = f.youtubeId || '';
    document.getElementById('fv-title').value = f.title || '';
    document.getElementById('fv-desc').value = f.description || '';
    openModal('featured-modal');
}

async function saveFeatured(event) {
    event.preventDefault();
    videos.featured = {
        youtubeId: document.getElementById('fv-id').value.trim(),
        title: document.getElementById('fv-title').value.trim(),
        description: document.getElementById('fv-desc').value.trim(),
    };
    await saveVideos();
    renderFeatured();
    closeModal('featured-modal');
}

function openVideoModal(idx) {
    editVideoIdx = idx ?? null;
    const v = idx != null ? videos.videos[idx] : {};
    document.getElementById('video-modal-title').textContent =
        idx != null ? 'Edit Video' : 'Add Video';
    document.getElementById('v-id').value = v.youtubeId || '';
    document.getElementById('v-title').value = v.title || '';
    document.getElementById('v-desc').value = v.description || '';
    openModal('video-modal');
}

async function saveVideo(event) {
    event.preventDefault();
    const v = {
        youtubeId: document.getElementById('v-id').value.trim(),
        title: document.getElementById('v-title').value.trim(),
        description: document.getElementById('v-desc').value.trim(),
    };
    if (!videos.videos) videos.videos = [];
    if (editVideoIdx != null) videos.videos[editVideoIdx] = v;
    else videos.videos.push(v);
    await saveVideos();
    renderVideos();
    closeModal('video-modal');
}

async function deleteVideo(idx) {
    if (!confirm(`Delete video "${videos.videos[idx].title}"?`)) return;
    videos.videos.splice(idx, 1);
    await saveVideos();
    renderVideos();
}

// ─── Songs ────────────────────────────────────────────────────────────────────
function sortKey(artist) {
    return artist.replace(/^the\s+/i, '').toLowerCase();
}

async function loadSongs() {
    songs = await api('GET', '/api/songs');
    renderSongs();
}

function renderSongs() {
    const q = document.getElementById('song-search').value.toLowerCase();
    let list = [...songs].sort((a, b) => {
        const ak = sortKey(a.artist),
            bk = sortKey(b.artist);
        return ak !== bk
            ? ak.localeCompare(bk)
            : a.title.toLowerCase().localeCompare(b.title.toLowerCase());
    });
    if (q)
        list = list.filter(
            (s) => s.artist.toLowerCase().includes(q) || s.title.toLowerCase().includes(q),
        );

    document.getElementById('song-count').textContent = `(${list.length} of ${songs.length})`;
    const tbody = document.getElementById('songs-body');
    if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty">No songs found.</td></tr>';
        return;
    }
    tbody.innerHTML = list
        .map((s) => {
            const i = songs.indexOf(s);
            return `<tr>
  <td>${esc(s.artist)}</td>
  <td>${esc(s.title)}</td>
  <td><div class="actions">
    <button class="btn btn-secondary btn-sm" onclick="openSongModal(${i})">Edit</button>
    <button class="btn btn-danger btn-sm" onclick="deleteSong(${i})">Delete</button>
  </div></td>
</tr>`;
        })
        .join('');
}

async function saveSongs() {
    await api('PUT', '/api/songs', songs);
}

function openSongModal(idx) {
    editSongIdx = idx ?? null;
    const s = idx != null ? songs[idx] : {};
    document.getElementById('song-modal-title').textContent =
        idx != null ? 'Edit Song' : 'Add Song';
    document.getElementById('s-artist').value = s.artist || '';
    document.getElementById('s-title').value = s.title || '';
    openModal('song-modal');
}

async function saveSong(event) {
    event.preventDefault();
    const s = {
        artist: document.getElementById('s-artist').value.trim(),
        title: document.getElementById('s-title').value.trim(),
    };
    if (editSongIdx != null) songs[editSongIdx] = s;
    else songs.push(s);
    await saveSongs();
    renderSongs();
    closeModal('song-modal');
}

async function deleteSong(idx) {
    if (!confirm(`Delete "${songs[idx].title}" by ${songs[idx].artist}?`)) return;
    songs.splice(idx, 1);
    await saveSongs();
    renderSongs();
}

// ─── Members ──────────────────────────────────────────────────────────────────
async function loadMembers() {
    members = await api('GET', '/api/members');
    renderMembers();
}

function renderMembers() {
    const tbody = document.getElementById('members-body');
    if (!members.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">No members yet.</td></tr>';
        return;
    }
    tbody.innerHTML = members
        .map(
            (m, i) => `
<tr>
  <td>${esc(m.name)}</td>
  <td style="color:var(--muted)">${esc(m.role)}</td>
  <td style="color:var(--muted);font-size:0.82rem"><code>${esc(m.photo)}</code></td>
  <td><div class="actions">
    <button class="btn btn-secondary btn-sm" onclick="openMemberModal(${i})">Edit</button>
    <button class="btn btn-danger btn-sm" onclick="deleteMember(${i})">Delete</button>
  </div></td>
</tr>`,
        )
        .join('');
}

async function saveMembers() {
    await api('PUT', '/api/members', members);
}

function openMemberModal(idx) {
    editMemberIdx = idx ?? null;
    const m = idx != null ? members[idx] : {};
    document.getElementById('member-modal-title').textContent =
        idx != null ? 'Edit Member' : 'Add Member';
    document.getElementById('m-name').value = m.name || '';
    document.getElementById('m-role').value = m.role || '';
    document.getElementById('m-photo').value = m.photo || '';
    document.getElementById('m-bio').value = m.bio || '';
    openModal('member-modal');
}

async function saveMember(event) {
    event.preventDefault();
    const m = {
        name: document.getElementById('m-name').value.trim(),
        role: document.getElementById('m-role').value.trim(),
        photo: document.getElementById('m-photo').value.trim(),
        bio: document.getElementById('m-bio').value.trim(),
    };
    if (editMemberIdx != null) members[editMemberIdx] = m;
    else members.push(m);
    await saveMembers();
    renderMembers();
    closeModal('member-modal');
}

async function deleteMember(idx) {
    if (!confirm(`Delete member "${members[idx].name}"?`)) return;
    members.splice(idx, 1);
    await saveMembers();
    renderMembers();
}

// ─── Publish ──────────────────────────────────────────────────────────────────
async function publish() {
    const message = document.getElementById('commit-msg').value.trim() || 'chore: update content';
    const btn = document.getElementById('publish-btn');
    const dot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const output = document.getElementById('output-box');

    btn.disabled = true;
    dot.className = 'status-dot dot-running';
    statusText.textContent = 'Publishing…';
    output.textContent = '';

    const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
    });

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    let success = false;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop();
        for (const part of parts) {
            if (!part.startsWith('data: ')) continue;
            const line = part.slice(6);
            if (line === '__DONE__') {
                success = true;
                continue;
            }
            output.textContent += line + '\n';
            output.scrollTop = output.scrollHeight;
        }
    }

    btn.disabled = false;
    if (success) {
        dot.className = 'status-dot dot-ok';
        statusText.textContent = 'Done';
    } else {
        dot.className = 'status-dot dot-err';
        statusText.textContent = 'Error';
    }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
loadGigs();
loadVideos();
loadSongs();
loadMembers();
