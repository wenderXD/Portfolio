/* ── Portfolio admin ──────────────────────────────
   Loaded on demand by index.html (type "admin", or open /#admin), so none of
   this ships to visitors. The password only unlocks this UI; every write is
   re-checked against ADMIN_PASSWORD by the /api routes. */
(function () {
  var P = window.__pf;
  if (!P) return;
  var isVideoSrc = P.isVideoSrc;
  function loadCustomProjects() { return P.projects(); }

  /* Vercel Blob client-upload helper: lets large files (videos) upload
     directly from the browser to Blob storage, bypassing the ~4.5MB
     serverless function body limit. */
  import('https://esm.sh/@vercel/blob@0.27.0/client')
    .then(function (m) { window.__blobUpload = m.upload; })
    .catch(function () { /* uploadFile falls back to /api/upload */ });

  var style = document.createElement('style');
  style.textContent = "    /* Case study editor (admin) */\n    .cs-ed-list { display: flex; flex-direction: column; gap: 10px; }\n    .cs-ed-card {\n      border: 1px solid rgba(0,0,0,.1); border-radius: 4px; background: #fafafa;\n      padding: 12px; display: flex; flex-direction: column; gap: 10px;\n    }\n    .cs-ed-top { display: flex; gap: 6px; align-items: center; }\n    .cs-ed-top .adm-input { flex: 1; }\n    .cs-ed-num { font-family: var(--font-ui); font-size: 9px; color: var(--accent); letter-spacing: .1em; width: 18px; }\n    .cs-ed-mini {\n      font-family: var(--font-ui); font-size: 9px; line-height: 1;\n      padding: 6px 7px; background: #fff; border: 1px solid rgba(0,0,0,.12); border-radius: 3px;\n      color: rgba(0,0,0,.55); cursor: none;\n    }\n    .cs-ed-mini:hover { border-color: var(--accent); color: var(--accent); }\n    .cs-ed-mini.danger:hover { border-color: #c44; color: #c44; }\n    .cs-ed-media { display: flex; flex-wrap: wrap; gap: 5px; }\n    .cs-ed-media button {\n      width: 44px; height: 44px; padding: 0; border-radius: 3px; overflow: hidden;\n      border: 2px solid transparent; background: #eee; cursor: none;\n    }\n    .cs-ed-media button.sel { border-color: var(--accent); }\n    .cs-ed-media img, .cs-ed-media video { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }\n    .cs-ed-canvas { position: relative; align-self: flex-start; cursor: crosshair; }\n    .cs-ed-canvas img, .cs-ed-canvas video { display: block; max-width: 100%; max-height: 320px; pointer-events: none; }\n    .cs-ed-canvas .cs-pin { width: 20px; height: 20px; font-size: 9px; cursor: grab; }\n    .cs-ed-canvas .cs-pin::after { display: none; }\n    .cs-ed-pins { display: flex; flex-direction: column; gap: 6px; }\n    .cs-ed-pin { display: flex; gap: 6px; align-items: flex-start; }\n    .cs-ed-pin .cs-dot { width: 18px; height: 18px; font-size: 9px; margin-top: 6px; }\n    .cs-ed-pin textarea.adm-input { flex: 1; min-height: 44px; }\n    .cs-ed-json textarea.adm-input { min-height: 120px; font-size: 10px; }\n    .cs-ed-json summary { font-family: var(--font-ui); font-size: 9px; letter-spacing: .15em; text-transform: uppercase; color: rgba(0,0,0,.45); cursor: none; }\n\n    /* ─── Password prompt ────────────────────── */\n    .pw-prompt {\n      position: fixed; inset: 0; z-index: 400;\n      background: rgba(10,10,24,.5); backdrop-filter: blur(6px);\n      display: flex; align-items: center; justify-content: center;\n      opacity: 0; pointer-events: none; transition: opacity .25s ease;\n    }\n    .pw-prompt.open { opacity: 1; pointer-events: all; }\n    .pw-box {\n      background: #fff; border-radius: 6px; padding: 32px 32px 28px;\n      width: min(360px, 92vw);\n      box-shadow: 0 16px 60px rgba(0,0,0,.18);\n      transform: translateY(12px); transition: transform .25s cubic-bezier(.4,0,.2,1);\n    }\n    .pw-prompt.open .pw-box { transform: translateY(0); }\n    .pw-title {\n      font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: .06em;\n      color: var(--text); margin-bottom: 4px;\n    }\n    .pw-sub {\n      font-family: var(--font-ui); font-size: 8px; letter-spacing: .2em;\n      text-transform: uppercase; color: rgba(0,0,0,.3); margin-bottom: 20px;\n    }\n    .pw-input {\n      width: 100%; font-family: var(--font-text); font-size: 13px;\n      color: var(--text); background: #fafafa;\n      border: 1px solid rgba(0,0,0,.1); border-radius: 3px;\n      padding: 10px 12px; outline: none; transition: border-color .15s;\n      letter-spacing: .1em;\n    }\n    .pw-input:focus { border-color: var(--accent); background: #fff; }\n    .pw-error {\n      font-family: var(--font-ui); font-size: 8px; letter-spacing: .1em;\n      color: #c44; margin-top: 8px; min-height: 14px;\n    }\n    .pw-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }\n    .pw-cancel {\n      font-family: var(--font-ui); font-size: 9px; letter-spacing: .2em;\n      text-transform: uppercase; padding: 9px 18px;\n      background: none; border: 1px solid rgba(0,0,0,.1); border-radius: 3px;\n      color: rgba(0,0,0,.4); cursor: none; transition: all .15s;\n    }\n    .pw-cancel:hover { border-color: rgba(0,0,0,.25); color: var(--text); }\n    .pw-enter {\n      font-family: var(--font-ui); font-size: 9px; letter-spacing: .2em;\n      text-transform: uppercase; padding: 9px 22px;\n      background: var(--accent); border: none; border-radius: 3px;\n      color: #fff; cursor: none; transition: opacity .15s;\n    }\n    .pw-enter:hover { opacity: .85; }\n\n    /* ─── Admin Panel ─────────────────────────── */\n    .adm {\n      position: fixed; inset: 0; z-index: 300;\n      background: rgba(10,10,24,.55); backdrop-filter: blur(6px);\n      display: flex; align-items: center; justify-content: center;\n      opacity: 0; pointer-events: none;\n      transition: opacity .3s ease;\n    }\n    .adm.open { opacity: 1; pointer-events: all; }\n\n    .adm-box {\n      background: #fff;\n      width: min(640px, 94vw); max-height: 88vh;\n      border-radius: 6px; overflow: hidden;\n      box-shadow: 0 24px 80px rgba(0,0,0,.22);\n      display: flex; flex-direction: column;\n      transform: translateY(16px);\n      transition: transform .3s cubic-bezier(.4,0,.2,1);\n    }\n    .adm.open .adm-box { transform: translateY(0); }\n\n    .adm-hd {\n      padding: 22px 28px 18px;\n      border-bottom: 1px solid rgba(0,0,0,.07);\n      display: flex; align-items: center; justify-content: space-between;\n      flex-shrink: 0;\n    }\n    .adm-hd-title {\n      font-family: 'Bebas Neue', sans-serif;\n      font-size: 22px; letter-spacing: .06em; color: var(--text);\n    }\n    .adm-hd-sub {\n      font-family: var(--font-ui);\n      font-size: 8px; letter-spacing: .18em; color: rgba(0,0,0,.3);\n      text-transform: uppercase; margin-top: 2px;\n    }\n    .adm-x {\n      background: none; border: none; cursor: none;\n      font-size: 18px; color: rgba(0,0,0,.3); line-height: 1;\n      transition: color .15s; padding: 4px;\n    }\n    .adm-x:hover { color: var(--text); }\n\n    .adm-body { flex: 1; overflow-y: auto; padding: 24px 28px; }\n    .adm-body::-webkit-scrollbar { width: 0; }\n\n    .adm-section-title {\n      font-family: var(--font-ui);\n      font-size: 8px; letter-spacing: .35em; text-transform: uppercase;\n      color: rgba(0,0,0,.3); margin-bottom: 10px;\n    }\n\n    .adm-proj-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 28px; }\n    .adm-proj-row {\n      display: flex; align-items: center; gap: 10px;\n      padding: 10px 14px; border: 1px solid rgba(0,0,0,.07); border-radius: 4px;\n      background: #fafafa;\n    }\n    .adm-proj-row-name {\n      flex: 1;\n      font-family: var(--font-ui);\n      font-size: 11px; color: var(--text);\n    }\n    .adm-proj-row-tags {\n      font-family: var(--font-ui);\n      font-size: 8px; letter-spacing: .1em; color: rgba(0,0,0,.3);\n      text-transform: uppercase;\n    }\n    .adm-del-btn {\n      background: none; border: 1px solid rgba(209,64,64,.25); border-radius: 3px;\n      color: #c44; padding: 4px 9px; cursor: none;\n      font-family: var(--font-ui); font-size: 7px; letter-spacing: .1em;\n      transition: all .15s; flex-shrink: 0;\n    }\n    .adm-del-btn:hover { background: rgba(209,64,64,.06); border-color: #c44; }\n    .adm-edit-btn {\n      background: none; border: 1px solid rgba(45,91,227,.2); border-radius: 3px;\n      color: var(--accent); padding: 4px 9px; cursor: none;\n      font-family: var(--font-ui); font-size: 7px; letter-spacing: .1em;\n      transition: all .15s; flex-shrink: 0;\n    }\n    .adm-edit-btn:hover { background: var(--dim); border-color: var(--accent); }\n    .adm-edit-banner {\n      background: rgba(45,91,227,.05); border: 1px solid rgba(45,91,227,.15);\n      border-radius: 4px; padding: 8px 12px; margin-bottom: 10px;\n      display: flex; align-items: center; justify-content: space-between;\n      animation: fadeIn .2s ease;\n    }\n    .adm-edit-banner-text {\n      font-family: var(--font-ui);\n      font-size: 9px; letter-spacing: .12em; color: var(--accent);\n    }\n    .adm-edit-discard {\n      font-family: var(--font-ui); font-size: 8px; letter-spacing: .15em;\n      text-transform: uppercase; color: rgba(0,0,0,.3);\n      background: none; border: none; cursor: none; padding: 2px 6px;\n      transition: color .15s;\n    }\n    .adm-edit-discard:hover { color: var(--text); }\n\n    .adm-storage { padding: 4px 0 16px; }\n    .adm-storage-row {\n      display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap;\n    }\n    .adm-storage-chip {\n      font-family: var(--font-ui); font-size: 9px; letter-spacing: .18em;\n      text-transform: uppercase; padding: 6px 10px; border-radius: 3px;\n      background: rgba(0,0,0,.05); color: rgba(0,0,0,.5);\n      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px;\n    }\n    .adm-storage-chip.ok { background: rgba(45,91,227,.08); color: var(--accent); }\n    .adm-storage-btn {\n      font-family: var(--font-ui); font-size: 9px; letter-spacing: .2em;\n      text-transform: uppercase; padding: 7px 14px;\n      background: none; border: 1px solid rgba(0,0,0,.12); border-radius: 3px;\n      color: rgba(0,0,0,.55); cursor: none; transition: all .15s;\n    }\n    .adm-storage-btn:hover { border-color: var(--accent); color: var(--accent); }\n    .adm-storage-hint {\n      font-family: var(--font-ui); font-size: 8px; letter-spacing: .08em;\n      color: rgba(0,0,0,.38); line-height: 1.7; margin-top: 4px;\n    }\n\n    .adm-divider { height: 1px; background: rgba(0,0,0,.07); margin-bottom: 24px; }\n\n    /* ─── Photo Upload Zone ─────────────── */\n    .photo-zone {\n      border: 1.5px dashed rgba(45,91,227,.25); border-radius: 5px;\n      background: rgba(45,91,227,.03);\n      padding: 20px 16px 14px;\n      display: flex; flex-direction: column; align-items: center; gap: 10px;\n      cursor: pointer; transition: border-color .18s, background .18s;\n    }\n    .photo-zone:hover, .photo-zone.drag-over {\n      border-color: var(--accent); background: rgba(45,91,227,.07);\n    }\n    .photo-zone-label {\n      font-family: var(--font-ui);\n      font-size: 9px; letter-spacing: .2em; text-transform: uppercase;\n      color: rgba(0,0,0,.35); text-align: center; pointer-events: none;\n    }\n    .photo-zone-label span { color: var(--accent); }\n    .photo-zone-sub {\n      font-family: var(--font-ui);\n      font-size: 8px; color: rgba(0,0,0,.22); letter-spacing: .06em;\n      pointer-events: none;\n    }\n    .photo-thumbs {\n      display: flex; flex-wrap: wrap; gap: 7px;\n      width: 100%; margin-top: 4px;\n    }\n    .photo-thumb {\n      position: relative; width: 72px; height: 54px;\n      border-radius: 3px; overflow: hidden;\n      border: 1px solid rgba(0,0,0,.1);\n      flex-shrink: 0;\n    }\n    .photo-thumb img, .photo-thumb video { width: 100%; height: 100%; object-fit: cover; display: block; }\n    .photo-thumb-vid {\n      position: absolute; left: 4px; bottom: 4px;\n      width: 16px; height: 16px; border-radius: 50%;\n      background: rgba(0,0,0,.55); color: #fff;\n      font-size: 7px; line-height: 16px; text-align: center;\n      pointer-events: none;\n    }\n    .photo-thumb-rm {\n      position: absolute; top: 3px; right: 3px;\n      width: 16px; height: 16px; border-radius: 50%;\n      background: rgba(0,0,0,.55); border: none;\n      color: #fff; font-size: 9px; line-height: 16px; text-align: center;\n      cursor: pointer; display: flex; align-items: center; justify-content: center;\n      padding: 0;\n    }\n    .photo-thumb-rm:hover { background: #c44; }\n\n    .adm-form { display: flex; flex-direction: column; gap: 14px; }\n    .adm-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }\n    .adm-field { display: flex; flex-direction: column; gap: 5px; }\n    .adm-field.full { grid-column: 1 / -1; }\n    .adm-label {\n      font-family: var(--font-ui);\n      font-size: 8px; letter-spacing: .2em; text-transform: uppercase;\n      color: rgba(0,0,0,.4);\n    }\n    .adm-input {\n      font-family: var(--font-text); font-size: 11px; color: var(--text);\n      background: #fafafa; border: 1px solid rgba(0,0,0,.1); border-radius: 3px;\n      padding: 8px 10px; outline: none; transition: border-color .15s;\n    }\n    .adm-input:focus { border-color: var(--accent); background: #fff; }\n    textarea.adm-input {\n      font-family: var(--font-text); font-size: 11px; line-height: 1.6;\n      resize: vertical; min-height: 84px;\n    }\n    .adm-hint {\n      font-family: var(--font-ui); font-size: 8px;\n      color: rgba(0,0,0,.28); letter-spacing: .05em;\n    }\n    #cs-ed-json-msg { font-family: var(--font-text); font-size: 12px; color: var(--accent); letter-spacing: 0; }\n    #cs-ed-json-msg.err { color: #c44; }\n    .adm-check-row { display: flex; gap: 18px; }\n    .adm-check-label {\n      display: flex; align-items: center; gap: 7px; cursor: none;\n      font-family: var(--font-ui); font-size: 9px; color: rgba(0,0,0,.5);\n    }\n    .adm-check-label input { accent-color: var(--accent); cursor: none; }\n\n    .adm-ft {\n      padding: 16px 28px;\n      border-top: 1px solid rgba(0,0,0,.07);\n      display: flex; justify-content: flex-end; gap: 10px;\n      flex-shrink: 0;\n    }\n    .adm-cancel {\n      font-family: var(--font-ui); font-size: 9px; letter-spacing: .2em;\n      text-transform: uppercase; padding: 9px 20px;\n      background: none; border: 1px solid rgba(0,0,0,.1); border-radius: 3px;\n      color: rgba(0,0,0,.4); cursor: none; transition: all .15s;\n    }\n    .adm-cancel:hover { border-color: rgba(0,0,0,.25); color: var(--text); }\n    .adm-save {\n      font-family: var(--font-ui); font-size: 9px; letter-spacing: .2em;\n      text-transform: uppercase; padding: 9px 24px;\n      background: var(--accent); border: none; border-radius: 3px;\n      color: #fff; cursor: none; transition: opacity .15s;\n    }\n    .adm-save:hover { opacity: .85; }\n\n    /* ─── Proto upload zone (admin) ─────── */\n    .proto-zone-wrap {\n      border: 1.5px dashed rgba(45,91,227,.25); border-radius: 5px;\n      background: rgba(45,91,227,.03);\n      padding: 12px 16px;\n      display: flex; align-items: center; justify-content: space-between; gap: 10px;\n      cursor: pointer; transition: border-color .18s, background .18s;\n    }\n    .proto-zone-wrap:hover, .proto-zone-wrap.drag-over {\n      border-color: var(--accent); background: rgba(45,91,227,.07);\n    }\n    .proto-zone-label {\n      font-family: var(--font-ui);\n      font-size: 9px; letter-spacing: .2em; text-transform: uppercase;\n      color: rgba(0,0,0,.35); pointer-events: none;\n    }\n    .proto-zone-label span { color: var(--accent); }\n    .proto-file-chip {\n      display: none; align-items: center; gap: 8px;\n      font-family: var(--font-ui);\n      font-size: 9px; color: var(--accent);\n      background: rgba(45,91,227,.08); border: 1px solid rgba(45,91,227,.2);\n      border-radius: 3px; padding: 4px 10px; flex-shrink: 0;\n    }\n    .proto-file-rm {\n      background: none; border: none; color: rgba(0,0,0,.4);\n      font-size: 10px; line-height: 1; cursor: pointer; padding: 0;\n      transition: color .15s;\n    }\n    .proto-file-rm:hover { color: #c44; }\n\n";
  document.head.appendChild(style);
  var host = document.createElement('div');
  host.innerHTML = "<!-- ══════════ PASSWORD PROMPT ══════════ -->\n<div id=\"pw-prompt\" class=\"pw-prompt\" aria-hidden=\"true\">\n  <div class=\"pw-box\">\n    <div class=\"pw-title\">Admin Access</div>\n    <div class=\"pw-sub\">Enter password to manage projects</div>\n    <input class=\"pw-input\" id=\"pw-input\" type=\"password\" placeholder=\"Password\" autocomplete=\"off\">\n    <div class=\"pw-error\" id=\"pw-error\"></div>\n    <div class=\"pw-actions\">\n      <button class=\"pw-cancel\" id=\"pw-cancel\">Cancel</button>\n      <button class=\"pw-enter\" id=\"pw-enter\">Enter</button>\n    </div>\n  </div>\n</div>\n\n<!-- ══════════ ADMIN PANEL ══════════ -->\n<div id=\"adm\" class=\"adm\" aria-hidden=\"true\">\n  <div class=\"adm-box\">\n    <div class=\"adm-hd\">\n      <div>\n        <div class=\"adm-hd-title\">Manage Projects</div>\n        <div class=\"adm-hd-sub\">Add or remove portfolio entries</div>\n      </div>\n      <button class=\"adm-x\" id=\"adm-close\">✕</button>\n    </div>\n    <div class=\"adm-body\">\n      <div class=\"adm-section-title\">Backup</div>\n      <div class=\"adm-storage\">\n        <div class=\"adm-storage-row\">\n          <button class=\"adm-storage-btn\" id=\"st-export\">Export JSON</button>\n          <button class=\"adm-storage-btn\" id=\"st-import\" type=\"button\">Import JSON</button>\n          <input type=\"file\" id=\"st-import-file\" accept=\"application/json,.json\" style=\"display:none\">\n        </div>\n        <div class=\"adm-storage-hint\">Export downloads a backup of every project. Import replaces the whole list with a JSON file (same format as Export) — export a backup first.</div>\n      </div>\n      <div class=\"adm-divider\"></div>\n      <div class=\"adm-section-title\">Current Projects</div>\n      <div class=\"adm-proj-list\" id=\"adm-proj-list\"></div>\n      <div class=\"adm-divider\"></div>\n      <div class=\"adm-section-title\" id=\"adm-form-title\">Add New Project</div>\n      <div class=\"adm-edit-banner\" id=\"adm-edit-banner\" style=\"display:none\">\n        <span class=\"adm-edit-banner-text\" id=\"adm-edit-banner-text\">Editing: —</span>\n        <button class=\"adm-edit-discard\" id=\"adm-edit-discard\">Discard</button>\n      </div>\n      <div class=\"adm-form\" id=\"adm-form\">\n        <div class=\"adm-row\">\n          <div class=\"adm-field\">\n            <label class=\"adm-label\" for=\"af-title\">Title</label>\n            <input class=\"adm-input\" id=\"af-title\" type=\"text\" placeholder=\"e.g. TradeFlow\">\n          </div>\n          <div class=\"adm-field\">\n            <label class=\"adm-label\" for=\"af-tags\">Tags</label>\n            <input class=\"adm-input\" id=\"af-tags\" type=\"text\" placeholder=\"e.g. DeFi · Web · Mobile\">\n          </div>\n        </div>\n        <div class=\"adm-field full\">\n          <label class=\"adm-label\" for=\"af-desc\">Description</label>\n          <input class=\"adm-input\" id=\"af-desc\" type=\"text\" placeholder=\"Short project description\">\n        </div>\n        <div class=\"adm-field full\">\n          <label class=\"adm-label\">Main Photos & Videos <span style=\"font-size:7px;color:rgba(0,0,0,.28);text-transform:none;letter-spacing:.04em\">· shown in carousel · paste Ctrl+V</span></label>\n          <div class=\"photo-zone\" id=\"photo-zone-main\">\n            <div class=\"photo-zone-label\">Drop or <span>click to browse</span></div>\n            <div class=\"photo-zone-sub\">PNG · JPG · WEBP · MP4 · WEBM · paste from clipboard</div>\n            <div class=\"photo-thumbs\" id=\"photo-thumbs-main\"></div>\n          </div>\n          <input type=\"file\" id=\"af-photos-main\" accept=\"image/*,video/*\" multiple style=\"display:none\">\n        </div>\n        <div class=\"adm-field full\">\n          <label class=\"adm-label\">Additional Photos & Videos <span style=\"font-size:7px;color:rgba(0,0,0,.28);text-transform:none;letter-spacing:.04em\">· expandable section · paste Ctrl+V</span></label>\n          <div class=\"photo-zone\" id=\"photo-zone-extra\">\n            <div class=\"photo-zone-label\">Drop or <span>click to browse</span></div>\n            <div class=\"photo-zone-sub\">PNG · JPG · WEBP · MP4 · WEBM · paste from clipboard</div>\n            <div class=\"photo-thumbs\" id=\"photo-thumbs-extra\"></div>\n          </div>\n          <input type=\"file\" id=\"af-photos-extra\" accept=\"image/*,video/*\" multiple style=\"display:none\">\n        </div>\n        <div class=\"adm-field full\">\n          <label class=\"adm-label\" for=\"af-figma\">Figma URL (optional)</label>\n          <input class=\"adm-input\" id=\"af-figma\" type=\"url\" placeholder=\"https://www.figma.com/design/...\">\n        </div>\n\n        <div class=\"adm-divider\" style=\"margin: 6px 0 4px\"></div>\n        <div class=\"adm-section-title\" style=\"margin-bottom: 0\">HTML Prototype <span style=\"font-size:7px;color:rgba(0,0,0,.28);text-transform:none;letter-spacing:.04em\">· optional · interactive prototype shown in Prototype tab</span></div>\n\n        <div class=\"adm-field full\">\n          <label class=\"adm-label\">Upload .html File</label>\n          <div class=\"proto-zone-wrap\" id=\"proto-zone\">\n            <div class=\"proto-zone-label\" id=\"proto-zone-label\">Drop or <span>click to browse</span> — .html file</div>\n            <div class=\"proto-file-chip\" id=\"proto-file-chip\">\n              <span id=\"proto-file-name\">prototype.html</span>\n              <button class=\"proto-file-rm\" id=\"proto-file-rm\" type=\"button\">✕</button>\n            </div>\n          </div>\n          <input type=\"file\" id=\"af-proto-file\" accept=\".html,text/html\" style=\"display:none\">\n        </div>\n        <div class=\"adm-field full\">\n          <label class=\"adm-label\" for=\"af-proto-url\">— or Prototype URL <span style=\"font-size:7px;color:rgba(0,0,0,.28);text-transform:none;letter-spacing:.04em\">· direct link to a hosted .html prototype</span></label>\n          <input class=\"adm-input\" id=\"af-proto-url\" type=\"url\" placeholder=\"https://...\">\n        </div>\n\n        <div class=\"adm-divider\" style=\"margin: 6px 0 4px\"></div>\n        <div class=\"adm-section-title\" style=\"margin-bottom: 0\">Project Details <span style=\"font-size:7px;color:rgba(0,0,0,.28);text-transform:none;letter-spacing:.04em\">· optional · shown in About tab</span></div>\n\n        <div class=\"adm-row\">\n          <div class=\"adm-field\">\n            <label class=\"adm-label\" for=\"af-year\">Year</label>\n            <input class=\"adm-input\" id=\"af-year\" type=\"text\" placeholder=\"e.g. 2024\">\n          </div>\n          <div class=\"adm-field\">\n            <label class=\"adm-label\" for=\"af-duration\">Duration</label>\n            <input class=\"adm-input\" id=\"af-duration\" type=\"text\" placeholder=\"e.g. 3 months\">\n          </div>\n        </div>\n        <div class=\"adm-field full\">\n          <label class=\"adm-label\" for=\"af-role\">Role</label>\n          <input class=\"adm-input\" id=\"af-role\" type=\"text\" placeholder=\"e.g. Lead UI/UX Designer\">\n        </div>\n        <div class=\"adm-field full\">\n          <label class=\"adm-label\" for=\"af-tools\">Tools <span style=\"font-size:7px;color:rgba(0,0,0,.28);text-transform:none;letter-spacing:.04em\">· comma or · separated</span></label>\n          <input class=\"adm-input\" id=\"af-tools\" type=\"text\" placeholder=\"e.g. Figma, FigJam, Principle\">\n        </div>\n        <div class=\"adm-field full\">\n          <label class=\"adm-label\" for=\"af-goals\">Goals</label>\n          <textarea class=\"adm-input\" id=\"af-goals\" rows=\"4\" placeholder=\"What was this project trying to achieve?\"></textarea>\n        </div>\n        <div class=\"adm-field full\">\n          <label class=\"adm-label\" for=\"af-workflow\">Workflow / Process</label>\n          <textarea class=\"adm-input\" id=\"af-workflow\" rows=\"4\" placeholder=\"How did you approach it? Research, iterations, decisions...\"></textarea>\n        </div>\n        <div class=\"adm-field full\">\n          <label class=\"adm-label\" for=\"af-outcomes\">Outcomes</label>\n          <textarea class=\"adm-input\" id=\"af-outcomes\" rows=\"4\" placeholder=\"Results, learnings, or impact\"></textarea>\n        </div>\n\n        <div class=\"adm-divider\" style=\"margin: 6px 0 4px\"></div>\n        <div class=\"adm-section-title\" style=\"margin-bottom: 0\">Case Study <span style=\"font-size:7px;color:rgba(0,0,0,.28);text-transform:none;letter-spacing:.04em\">· optional · chapters shown in Case study tab · click a screen to drop a note pin, drag to move</span></div>\n\n        <div class=\"adm-field full\">\n          <label class=\"adm-label\" for=\"af-cs-label\">Label</label>\n          <input class=\"adm-input\" id=\"af-cs-label\" type=\"text\" placeholder=\"e.g. Self-initiated concept · not affiliated with Hyperliquid\">\n        </div>\n        <div class=\"cs-ed-list\" id=\"cs-ed-list\"></div>\n        <div class=\"adm-check-row\">\n          <button class=\"adm-storage-btn\" type=\"button\" id=\"cs-ed-add\">+ Add chapter</button>\n        </div>\n        <details class=\"cs-ed-json\">\n          <summary>Paste case study JSON</summary>\n          <div class=\"adm-field full\" style=\"margin-top:8px\">\n            <textarea class=\"adm-input\" id=\"cs-ed-json\" placeholder='{\"csLabel\": \"...\", \"caseStudy\": [{\"title\": \"...\", \"body\": \"...\", \"media\": \"https://...\", \"pins\": [{\"x\": 50, \"y\": 40, \"text\": \"...\"}]}]}'></textarea>\n            <div class=\"adm-check-row\" style=\"margin-top:6px\">\n              <button class=\"adm-storage-btn\" type=\"button\" id=\"cs-ed-json-load\">Load into form</button>\n              <span class=\"adm-hint\" id=\"cs-ed-json-msg\"></span>\n            </div>\n          </div>\n        </details>\n      </div>\n    </div>\n    <div class=\"adm-ft\">\n      <button class=\"adm-cancel\" id=\"adm-cancel\">Cancel</button>\n      <button class=\"adm-save\" id=\"adm-save\">Add Project</button>\n    </div>\n  </div>\n</div>\n\n";
  while (host.firstChild) document.body.appendChild(host.firstChild);

  /* ── Persistent storage (backend API) ── */
  var PW_KEY = 'portfolio_pw';
  function getAdminPw()   { try { return sessionStorage.getItem(PW_KEY) || ''; } catch (e) { return ''; } }
  function setAdminPw(p)  { try { sessionStorage.setItem(PW_KEY, p); } catch (e) {} }
  function clearAdminPw() { try { sessionStorage.removeItem(PW_KEY); } catch (e) {} }

  function saveCustomProjects(arr) {
    return fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: getAdminPw(), projects: arr }),
    }).then(function (r) {
      if (r.status === 401) {
        clearAdminPw();
        alert('Admin session invalid. Close and re-open admin, then re-enter password.');
        return false;
      }
      if (!r.ok) {
        return r.text().then(function (t) {
          alert('Save failed: HTTP ' + r.status + '\n' + t);
          return false;
        });
      }
      P.setCache(arr);
      return true;
    }).catch(function (e) {
      alert('Network error: ' + (e && e.message || e));
      return false;
    });
  }

  function uploadImage(dataURL) {
    return fetch(dataURL).then(function (r) { return r.blob(); }).then(function (blob) {
      var ext = ((blob.type || '').split('/')[1] || 'bin').split(';')[0];
      return fetch('/api/upload?ext=' + encodeURIComponent(ext), {
        method: 'POST',
        headers: {
          'Content-Type': blob.type || 'application/octet-stream',
          'x-admin-password': getAdminPw(),
        },
        body: blob,
      });
    }).then(function (r) {
      if (!r.ok) {
        return r.text().then(function (t) { throw new Error('upload ' + r.status + ' ' + t); });
      }
      return r.json();
    }).then(function (j) { return j.url; });
  }

  /* Upload an arbitrary file (e.g. video) straight to blob storage, no compression.
     Large files use Vercel Blob's client-direct upload (browser → Blob) to avoid
     the serverless function's ~4.5MB request-body limit. Falls back to the regular
     server route only if the client SDK failed to load. */
  function uploadFile(file) {
    var ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6) || 'bin';
    if (window.__blobUpload) {
      var name = 'videos/' + Date.now() + '-' + Math.random().toString(36).slice(2, 10) + '.' + ext;
      return window.__blobUpload(name, file, {
        access: 'public',
        contentType: file.type || undefined,
        handleUploadUrl: '/api/blob-upload',
        clientPayload: getAdminPw(),
      }).then(function (blob) { return blob.url; });
    }
    return fetch('/api/upload?ext=' + encodeURIComponent(ext), {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'x-admin-password': getAdminPw(),
      },
      body: file,
    }).then(function (r) {
      if (!r.ok) {
        return r.text().then(function (t) { throw new Error('upload ' + r.status + ' ' + t); });
      }
      return r.json();
    }).then(function (j) { return j.url; });
  }

  /* ══════════ ADMIN ══════════ */
  var adm      = document.getElementById('adm');
  var pwPrompt = document.getElementById('pw-prompt');
  var pwInput  = document.getElementById('pw-input');
  var pwError  = document.getElementById('pw-error');
  var editingId = null;

  function openAdm()  { renderAdmList(); adm.classList.add('open'); adm.setAttribute('aria-hidden','false'); }
  function closeAdm() { adm.classList.remove('open'); adm.setAttribute('aria-hidden','true'); clearForm(); }
  function openPw()   {
    pwInput.value = ''; pwError.textContent = '';
    pwPrompt.classList.add('open'); pwPrompt.setAttribute('aria-hidden','false');
    setTimeout(function () { pwInput.focus(); }, 120);
  }
  function closePw()  {
    pwPrompt.classList.remove('open'); pwPrompt.setAttribute('aria-hidden','true');
    pwInput.value = ''; pwError.textContent = '';
  }
  function checkPassword() {
    var pw = pwInput.value;
    if (!pw) { pwError.textContent = 'Enter a password'; pwInput.focus(); return; }
    pwError.textContent = 'Checking…';
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    }).then(function (r) {
      if (r.ok) {
        setAdminPw(pw);
        closePw();
        openAdm();
      } else {
        pwError.textContent = 'Incorrect password';
        pwInput.value = ''; pwInput.focus();
      }
    }).catch(function () {
      pwError.textContent = 'Network error — is the backend deployed?';
      pwInput.focus();
    });
  }

  document.getElementById('pw-cancel').addEventListener('click', closePw);
  document.getElementById('pw-enter').addEventListener('click', checkPassword);
  pwInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') checkPassword();
    if (e.key === 'Escape') closePw();
  });
  pwPrompt.addEventListener('click', function (e) { if (e.target === pwPrompt) closePw(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && adm.classList.contains('open')) closeAdm();
  });
  document.getElementById('adm-close').addEventListener('click', closeAdm);
  document.getElementById('adm-cancel').addEventListener('click', closeAdm);
  adm.addEventListener('click', function (e) { if (e.target === adm) closeAdm(); });

  /* ── Projects list ───────────────────── */
  function renderAdmList() {
    var list = document.getElementById('adm-proj-list');
    list.innerHTML = '';
    var custom = loadCustomProjects();
    if (!custom.length) {
      list.innerHTML = '<div style="font-family:var(--font-ui);font-size:9px;color:rgba(0,0,0,.25);letter-spacing:.12em;padding:6px 0">No projects yet</div>';
      return;
    }
    custom.forEach(function (p) {
      var row = document.createElement('div');
      row.className = 'adm-proj-row' + (editingId === p.id ? ' editing' : '');
      row.innerHTML =
        '<span class="adm-proj-row-name">' + p.title + '</span>' +
        '<span class="adm-proj-row-tags">' + p.tags + '</span>' +
        '<button class="adm-edit-btn" data-id="' + p.id + '">Edit</button>' +
        '<button class="adm-del-btn"  data-id="' + p.id + '">Delete</button>';
      list.appendChild(row);
    });
    list.querySelectorAll('.adm-edit-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { openEditProject(btn.getAttribute('data-id')); });
    });
    list.querySelectorAll('.adm-del-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        if (editingId === id) clearForm();
        var p = loadCustomProjects().find(function (x) { return x.id === id; });
        if (!p || !confirm('Delete "' + p.title + '"? This cannot be undone.')) return;
        /* Was: rebuilt from the cache before the save had finished, so the
           list only changed after a reload. */
        saveCustomProjects(loadCustomProjects().filter(function (x) { return x.id !== id; })).then(function (ok) {
          if (!ok) return;
          P.refresh();
          renderAdmList();
        });
      });
    });
  }

  /* ── Edit existing project ───────────── */
  function openEditProject(id) {
    var p = loadCustomProjects().find(function (x) { return x.id === id; });
    if (!p) return;
    editingId = id;
    document.getElementById('af-title').value    = p.title    || '';
    document.getElementById('af-desc').value     = p.desc     || '';
    document.getElementById('af-tags').value     = p.tags     || '';
    document.getElementById('af-figma').value    = p.figmaUrl || '';
    document.getElementById('af-proto-url').value = p.protoUrl || '';
    document.getElementById('af-year').value     = p.year     || '';
    document.getElementById('af-duration').value = p.duration || '';
    document.getElementById('af-role').value     = p.role     || '';
    document.getElementById('af-tools').value    = p.tools    || '';
    document.getElementById('af-goals').value    = p.goals    || '';
    document.getElementById('af-workflow').value = p.workflow || '';
    document.getElementById('af-outcomes').value = p.outcomes || '';
    document.getElementById('proto-file-chip').style.display = 'none';
    document.getElementById('proto-zone-label').style.display = '';
    pendingMainPhotos.length  = 0;
    pendingExtraPhotos.length = 0;
    Array.prototype.push.apply(pendingMainPhotos,  p.photos      || []);
    Array.prototype.push.apply(pendingExtraPhotos, p.extraPhotos || []);
    document.getElementById('af-cs-label').value = p.csLabel || '';
    csEdit = csClone(p.caseStudy);
    renderMainThumbs(); renderExtraThumbs();
    document.getElementById('adm-form-title').textContent      = 'Edit Project';
    document.getElementById('adm-edit-banner').style.display   = '';
    document.getElementById('adm-edit-banner-text').textContent = 'Editing: ' + p.title;
    document.getElementById('adm-save').textContent            = 'Update Project';
    renderAdmList();
    document.getElementById('adm-form').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ── Photo upload zones ──────────────── */
  var pendingMainPhotos  = [];
  var pendingExtraPhotos = [];
  var activeZone = 'main';

  function setupZone(zoneId, inputId, arr, renderFn) {
    var zone  = document.getElementById(zoneId);
    var input = document.getElementById(inputId);
    zone.addEventListener('mouseenter', function () { activeZone = zoneId; });
    zone.addEventListener('click', function (e) {
      if (e.target.classList.contains('photo-thumb-rm')) return;
      activeZone = zoneId; input.click();
    });
    input.addEventListener('change', function () {
      readFilesInto(arr, Array.from(input.files), renderFn);
      input.value = '';
    });
    zone.addEventListener('dragover',  function (e) { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', function ()  { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault(); zone.classList.remove('drag-over'); activeZone = zoneId;
      readFilesInto(arr, Array.from(e.dataTransfer.files).filter(function (f) {
        return f.type.startsWith('image/') || f.type.startsWith('video/');
      }), renderFn);
    });
  }

  setupZone('photo-zone-main',  'af-photos-main',  pendingMainPhotos,  renderMainThumbs);
  setupZone('photo-zone-extra', 'af-photos-extra', pendingExtraPhotos, renderExtraThumbs);

  /* ── HTML Prototype upload zone ──────── */
  (function () {
    var zone    = document.getElementById('proto-zone');
    var input   = document.getElementById('af-proto-file');
    var chip    = document.getElementById('proto-file-chip');
    var nameEl  = document.getElementById('proto-file-name');
    var rmBtn   = document.getElementById('proto-file-rm');
    var label   = document.getElementById('proto-zone-label');
    var urlInput = document.getElementById('af-proto-url');

    function isHtml(f) { return f && (f.name.toLowerCase().endsWith('.html') || f.type === 'text/html'); }

    function showChip(filename) {
      nameEl.textContent = filename;
      chip.style.display = 'inline-flex';
      label.style.display = 'none';
    }
    function hideChip() {
      chip.style.display = 'none';
      label.style.display = '';
    }

    zone.addEventListener('click', function (e) {
      if (e.target === rmBtn || rmBtn.contains(e.target)) return;
      input.click();
    });
    zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', function () { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop', function (e) {
      e.preventDefault(); zone.classList.remove('drag-over');
      var file = Array.from(e.dataTransfer.files).find(isHtml);
      if (file) uploadProtoFile(file);
    });
    input.addEventListener('change', function () {
      if (input.files[0] && isHtml(input.files[0])) uploadProtoFile(input.files[0]);
      input.value = '';
    });
    rmBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      hideChip();
      urlInput.value = '';
    });

    function uploadProtoFile(file) {
      var btn = document.getElementById('adm-save');
      var prevText = btn.textContent;
      btn.disabled = true; btn.style.opacity = '0.6'; btn.style.pointerEvents = 'none';
      btn.textContent = 'Uploading HTML…';
      var reader = new FileReader();
      reader.onload = function (ev) {
        var htmlBlob = new Blob([ev.target.result], { type: 'text/html' });
        fetch('/api/upload?ext=html', {
          method: 'POST',
          headers: { 'Content-Type': 'text/html', 'x-admin-password': getAdminPw() },
          body: htmlBlob,
        }).then(function (r) {
          if (!r.ok) return r.text().then(function (t) { throw new Error('HTTP ' + r.status + ': ' + t); });
          return r.json();
        }).then(function (j) {
          urlInput.value = j.url;
          showChip(file.name);
        }).catch(function (e) {
          alert('HTML upload failed: ' + (e && e.message || e));
        }).then(function () {
          btn.disabled = false; btn.style.opacity = ''; btn.style.pointerEvents = '';
          btn.textContent = prevText;
        });
      };
      reader.onerror = function () {
        btn.disabled = false; btn.style.opacity = ''; btn.style.pointerEvents = '';
        btn.textContent = prevText;
      };
      reader.readAsText(file, 'utf-8');
    }
  })();

  function compressImage(dataURL, callback) {
    var MAX = 1800;        // max dimension on longest side
    var QUALITY = 0.9;
    var img = new Image();
    img.onload = function () {
      var w = img.width, h = img.height;
      var scale = Math.min(1, MAX / Math.max(w, h));
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
      var canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, w, h);      // preserve alpha
      ctx.drawImage(img, 0, 0, w, h);
      try {
        // WebP supports alpha and compresses well — fall back to PNG if unsupported.
        var out = canvas.toDataURL('image/webp', QUALITY);
        if (!out || out.indexOf('data:image/webp') !== 0) {
          out = canvas.toDataURL('image/png');
        }
        callback(out);
      } catch (e) { callback(dataURL); }
    };
    img.onerror = function () { callback(dataURL); };
    img.src = dataURL;
  }

  /* ── Upload state (disables Save while compressing) ── */
  var pendingUploads = 0;
  function setUploadingState() {
    var btn = document.getElementById('adm-save');
    if (!btn) return;
    if (pendingUploads > 0) {
      btn.disabled = true;
      btn.style.opacity = '0.6';
      btn.style.pointerEvents = 'none';
      btn.textContent = 'Processing ' + pendingUploads + ' image' + (pendingUploads > 1 ? 's' : '') + '...';
    } else {
      btn.disabled = false;
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
      btn.textContent = editingId ? 'Update Project' : 'Add Project';
    }
  }

  function readFilesInto(arr, files, renderFn) {
    files.forEach(function (file) {
      /* Videos: upload the raw file (no compression / canvas re-encode). */
      if ((file.type && file.type.startsWith('video/')) || isVideoSrc(file.name)) {
        pendingUploads++;
        setUploadingState();
        uploadFile(file).then(function (url) {
          arr.push(url);
          renderFn();
        }).catch(function (e) {
          console.warn('Upload failed:', e);
          alert('Video upload failed: ' + (e && e.message || e));
        }).then(function () {
          pendingUploads--;
          setUploadingState();
        });
        return;
      }
      var reader = new FileReader();
      pendingUploads++;
      setUploadingState();
      reader.onload = function (ev) {
        compressImage(ev.target.result, function (compressed) {
          uploadImage(compressed).then(function (url) {
            arr.push(url);
            renderFn();
          }).catch(function (e) {
            console.warn('Upload failed:', e);
            alert('Image upload failed: ' + (e && e.message || e));
          }).then(function () {
            pendingUploads--;
            setUploadingState();
          });
        });
      };
      reader.onerror = function () { pendingUploads--; setUploadingState(); };
      reader.readAsDataURL(file);
    });
  }

  function renderMainThumbs()  { renderThumbs('photo-thumbs-main',  pendingMainPhotos,  renderMainThumbs);  renderCsEditor(); }
  function renderExtraThumbs() { renderThumbs('photo-thumbs-extra', pendingExtraPhotos, renderExtraThumbs); renderCsEditor(); }

  /* ── Case study editor ───────────────── */
  var csEdit = [];   /* [{ title, body, media, pins: [{ x, y, text }] }] */

  function csClone(arr) { return JSON.parse(JSON.stringify(Array.isArray(arr) ? arr : [])); }
  function csMediaPool() {
    return pendingMainPhotos.concat(pendingExtraPhotos).filter(function (s, i, a) { return a.indexOf(s) === i; });
  }
  function csMediaEl(src, ctrl) {
    var el;
    if (isVideoSrc(src)) {
      el = document.createElement('video');
      el.src = src; el.muted = true; el.preload = 'metadata'; el.playsInline = true;
      if (ctrl) { el.loop = true; el.autoplay = true; }
    } else {
      el = document.createElement('img'); el.src = src; el.alt = '';
    }
    return el;
  }
  function csBtn(label, title, fn, danger) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'cs-ed-mini' + (danger ? ' danger' : '');
    b.textContent = label; b.title = title;
    b.addEventListener('click', fn);
    return b;
  }

  function renderCsEditor() {
    var list = document.getElementById('cs-ed-list');
    if (!list || !csEdit) return;
    list.innerHTML = '';
    var pool = csMediaPool();

    csEdit.forEach(function (c, i) {
      c.pins = Array.isArray(c.pins) ? c.pins : [];
      var card = document.createElement('div'); card.className = 'cs-ed-card';

      var top = document.createElement('div'); top.className = 'cs-ed-top';
      var num = document.createElement('span'); num.className = 'cs-ed-num'; num.textContent = String(i + 1).padStart(2, '0');
      var title = document.createElement('input');
      title.className = 'adm-input'; title.type = 'text'; title.placeholder = 'Chapter title, e.g. The problem';
      title.value = c.title || '';
      title.addEventListener('input', function () { c.title = title.value; });
      top.appendChild(num); top.appendChild(title);
      top.appendChild(csBtn('↑', 'Move up', function () {
        if (i > 0) { csEdit.splice(i - 1, 0, csEdit.splice(i, 1)[0]); renderCsEditor(); }
      }));
      top.appendChild(csBtn('↓', 'Move down', function () {
        if (i < csEdit.length - 1) { csEdit.splice(i + 1, 0, csEdit.splice(i, 1)[0]); renderCsEditor(); }
      }));
      top.appendChild(csBtn('✕', 'Delete chapter', function () { csEdit.splice(i, 1); renderCsEditor(); }, true));
      card.appendChild(top);

      var body = document.createElement('textarea');
      body.className = 'adm-input'; body.rows = 4;
      body.placeholder = 'What was the problem here, what did you decide, and why?';
      body.value = c.body || '';
      body.addEventListener('input', function () { c.body = body.value; });
      card.appendChild(body);

      /* Screen picker — any photo or video already attached to the project. */
      var pick = document.createElement('div'); pick.className = 'cs-ed-media';
      if (c.media && pool.indexOf(c.media) < 0) pool = pool.concat([c.media]);
      pool.forEach(function (src) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = src === c.media ? 'sel' : '';
        b.title = 'Use this screen';
        b.appendChild(csMediaEl(src, false));
        b.addEventListener('click', function () {
          if (c.media !== src) { c.media = src; c.pins = []; }
          renderCsEditor();
        });
        pick.appendChild(b);
      });
      if (!pool.length) {
        var none = document.createElement('span'); none.className = 'adm-hint';
        none.textContent = 'Add photos above first, then pick one for this chapter.';
        pick.appendChild(none);
      }
      card.appendChild(pick);

      if (c.media) {
        var canvas = document.createElement('div'); canvas.className = 'cs-ed-canvas';
        canvas.appendChild(csMediaEl(c.media, true));
        c.pins.forEach(function (pin, j) {
          var dot = document.createElement('span');
          dot.className = 'cs-pin'; dot.textContent = j + 1;
          dot.style.left = pin.x + '%'; dot.style.top = pin.y + '%';
          dot.addEventListener('pointerdown', function (e) {
            e.preventDefault(); e.stopPropagation();
            dot.setPointerCapture(e.pointerId);
            function move(ev) {
              var r = canvas.getBoundingClientRect();
              pin.x = Math.round(Math.max(0, Math.min(100, (ev.clientX - r.left) / r.width  * 100)) * 10) / 10;
              pin.y = Math.round(Math.max(0, Math.min(100, (ev.clientY - r.top)  / r.height * 100)) * 10) / 10;
              dot.style.left = pin.x + '%'; dot.style.top = pin.y + '%';
            }
            function up() { dot.removeEventListener('pointermove', move); dot.removeEventListener('pointerup', up); }
            dot.addEventListener('pointermove', move);
            dot.addEventListener('pointerup', up);
          });
          canvas.appendChild(dot);
        });
        canvas.addEventListener('click', function (e) {
          if (e.target.classList.contains('cs-pin')) return;
          var r = canvas.getBoundingClientRect();
          c.pins.push({
            x: Math.round((e.clientX - r.left) / r.width  * 1000) / 10,
            y: Math.round((e.clientY - r.top)  / r.height * 1000) / 10,
            text: ''
          });
          renderCsEditor();
          var areas = document.querySelectorAll('#cs-ed-list .cs-ed-card')[i].querySelectorAll('.cs-ed-pin textarea');
          if (areas.length) areas[areas.length - 1].focus();
        });
        card.appendChild(canvas);

        var pinsWrap = document.createElement('div'); pinsWrap.className = 'cs-ed-pins';
        c.pins.forEach(function (pin, j) {
          var row = document.createElement('div'); row.className = 'cs-ed-pin';
          var d = document.createElement('span'); d.className = 'cs-dot'; d.textContent = j + 1;
          var ta = document.createElement('textarea');
          ta.className = 'adm-input'; ta.rows = 2; ta.placeholder = 'Note for pin ' + (j + 1) + ': what decision does this point at?';
          ta.value = pin.text || '';
          ta.addEventListener('input', function () { pin.text = ta.value; });
          row.appendChild(d); row.appendChild(ta);
          row.appendChild(csBtn('✕', 'Remove pin', function () { c.pins.splice(j, 1); renderCsEditor(); }, true));
          pinsWrap.appendChild(row);
        });
        card.appendChild(pinsWrap);
      }
      list.appendChild(card);
    });
  }

  document.getElementById('cs-ed-add').addEventListener('click', function () {
    var pool = csMediaPool();
    var used = csEdit.map(function (c) { return c.media; });
    var next = pool.find(function (s) { return used.indexOf(s) < 0; }) || pool[0] || '';
    csEdit.push({ title: '', body: '', media: next, pins: [] });
    renderCsEditor();
    var titles = document.querySelectorAll('#cs-ed-list .cs-ed-top input');
    if (titles.length) titles[titles.length - 1].focus();
  });

  /* Reads the paste box into the editor. Returns true when there was nothing
     to load or it loaded; false (with a visible message) when it can't. */
  function loadCsJson() {
    var box = document.getElementById('cs-ed-json');
    var msg = document.getElementById('cs-ed-json-msg');
    var raw = box.value.trim();
    if (!raw) return true;
    try {
      var data = JSON.parse(raw);
      /* The combined preview file is an array of whole projects: take ours. */
      if (Array.isArray(data) && data.length && data[0] && data[0].id !== undefined) {
        var mine = data.find(function (p) { return p.id === editingId; });
        if (!mine) throw new Error('this file has no case study for the project you are editing');
        data = mine;
      }
      var chapters = Array.isArray(data) ? data : data.caseStudy;
      if (!Array.isArray(chapters)) throw new Error('expected a "caseStudy" list');
      csEdit = csClone(chapters);
      if (!Array.isArray(data) && typeof data.csLabel === 'string') document.getElementById('af-cs-label').value = data.csLabel;
      renderCsEditor();
      box.value = '';
      msg.classList.remove('err');
      msg.textContent = 'Loaded ' + csEdit.length + ' chapters.';
      return true;
    } catch (e) {
      var details = msg.closest('details');
      if (details) details.open = true;
      msg.classList.add('err');
      msg.textContent = "Couldn't read the pasted JSON (" + e.message + '). Copy the whole file and paste again.';
      msg.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return false;
    }
  }
  document.getElementById('cs-ed-json-load').addEventListener('click', loadCsJson);

  function renderThumbs(containerId, arr, refreshFn) {
    var el = document.getElementById(containerId);
    el.innerHTML = '';
    arr.forEach(function (src, idx) {
      var wrap = document.createElement('div'); wrap.className = 'photo-thumb';
      if (isVideoSrc(src)) {
        var vid = document.createElement('video');
        vid.src = src; vid.muted = true; vid.preload = 'metadata';
        vid.playsInline = true; vid.setAttribute('playsinline', '');
        wrap.appendChild(vid);
        var badge = document.createElement('span'); badge.className = 'photo-thumb-vid'; badge.textContent = '▶';
        wrap.appendChild(badge);
      } else {
        var img = document.createElement('img'); img.src = src;
        wrap.appendChild(img);
      }
      var rm = document.createElement('button'); rm.className = 'photo-thumb-rm'; rm.textContent = '✕';
      rm.addEventListener('click', function (e) {
        e.stopPropagation(); arr.splice(idx, 1); refreshFn();
      });
      wrap.appendChild(rm); el.appendChild(wrap);
    });
  }

  /* ── Paste images ────────────────────── */
  document.addEventListener('paste', function (e) {
    if (!adm.classList.contains('open')) return;
    var items = Array.from((e.clipboardData || e.originalEvent.clipboardData).items);
    var imgFiles = items.filter(function (i) { return i.type.startsWith('image/'); })
                        .map(function (i) { return i.getAsFile(); });
    if (!imgFiles.length) return;
    var isMain = activeZone === 'photo-zone-main';
    readFilesInto(
      isMain ? pendingMainPhotos : pendingExtraPhotos,
      imgFiles,
      isMain ? renderMainThumbs : renderExtraThumbs
    );
  });

  /* ── Save / Update ───────────────────── */
  document.getElementById('adm-save').addEventListener('click', function () {
    if (pendingUploads > 0) return;

    var title    = document.getElementById('af-title').value.trim();
    var desc     = document.getElementById('af-desc').value.trim();
    var tags     = document.getElementById('af-tags').value.trim();
    var figma    = document.getElementById('af-figma').value.trim();
    var year     = document.getElementById('af-year').value.trim();
    var duration = document.getElementById('af-duration').value.trim();
    var role     = document.getElementById('af-role').value.trim();
    var tools    = document.getElementById('af-tools').value.trim();
    var goals    = document.getElementById('af-goals').value.trim();
    var workflow = document.getElementById('af-workflow').value.trim();
    var outcomes = document.getElementById('af-outcomes').value.trim();
    if (!title) { document.getElementById('af-title').focus(); return; }
    /* Pasted JSON counts even if "Load into form" was never pressed. */
    if (!loadCsJson()) return;

    var protoUrl = document.getElementById('af-proto-url').value.trim();
    var fields = {
      title: title, desc: desc || title, tags: tags || 'Design',
      figmaUrl: figma, protoUrl: protoUrl,
      year: year, duration: duration, role: role, tools: tools,
      goals: goals, workflow: workflow, outcomes: outcomes,
      photos: pendingMainPhotos.slice(), extraPhotos: pendingExtraPhotos.slice(),
      csLabel: document.getElementById('af-cs-label').value.trim(),
      caseStudy: csClone(csEdit).map(function (c) {
        return {
          title: (c.title || '').trim(), body: (c.body || '').trim(), media: c.media || '',
          pins: (c.pins || []).filter(function (pin) { return (pin.text || '').trim(); })
                              .map(function (pin) { return { x: pin.x, y: pin.y, text: pin.text.trim() }; })
        };
      }).filter(function (c) { return c.title || c.body || c.media; })
    };

    var custom = loadCustomProjects();
    if (editingId) {
      var idx = custom.findIndex(function (p) { return p.id === editingId; });
      if (idx >= 0) Object.assign(custom[idx], fields);
    } else {
      custom.push(Object.assign({ id: 'custom_' + Date.now() }, fields));
    }

    var btn = document.getElementById('adm-save');
    var prevText = btn.textContent;
    btn.disabled = true; btn.style.opacity = '0.6';
    btn.textContent = 'Saving…';

    saveCustomProjects(custom).then(function (ok) {
      btn.disabled = false; btn.style.opacity = '';
      btn.textContent = prevText;
      if (!ok) return;
      var goTo = editingId ? P.current() : loadCustomProjects().length - 1;
      clearForm();
      P.refresh(goTo);
      renderAdmList();
    });
  });

  function clearForm() {
    editingId = null;
    ['af-title','af-desc','af-tags','af-figma','af-proto-url',
     'af-year','af-duration','af-role','af-tools',
     'af-goals','af-workflow','af-outcomes','af-cs-label','cs-ed-json'].forEach(function (id) {
      document.getElementById(id).value = '';
    });
    csEdit = [];
    document.getElementById('cs-ed-json-msg').textContent = '';
    document.getElementById('proto-file-chip').style.display = 'none';
    document.getElementById('proto-zone-label').style.display = '';
    pendingMainPhotos.length = 0; pendingExtraPhotos.length = 0;
    renderMainThumbs(); renderExtraThumbs();
    document.getElementById('adm-form-title').textContent    = 'Add New Project';
    document.getElementById('adm-edit-banner').style.display = 'none';
    document.getElementById('adm-save').textContent          = 'Add Project';
  }

  document.getElementById('adm-edit-discard').addEventListener('click', clearForm);

  /* ── Backup: Export projects.json (Import removed — server is source of truth) ── */
  /* ── Import: replace the whole list from a JSON file (same shape as Export) ── */
  var stImport = document.getElementById('st-import');
  var stImportFile = document.getElementById('st-import-file');
  stImport.addEventListener('click', function () { stImportFile.click(); });
  stImportFile.addEventListener('change', function () {
    var f = stImportFile.files[0];
    stImportFile.value = '';
    if (!f) return;
    f.text().then(function (txt) {
      var arr = JSON.parse(txt);
      if (!Array.isArray(arr) || !arr.every(function (p) { return p && p.id && p.title; })) {
        throw new Error('expected a list of projects, each with an id and a title');
      }
      var msg = 'Replace all ' + loadCustomProjects().length + ' projects with the ' + arr.length +
        ' in "' + f.name + '"?\n\n' + arr.map(function (p, i) { return (i + 1) + '. ' + p.title; }).join('\n');
      if (!confirm(msg)) return;
      return saveCustomProjects(arr).then(function (ok) {
        if (!ok) return;
        clearForm();
        P.refresh(0);
        renderAdmList();
      });
    }).catch(function (e) { alert('Import failed: ' + (e && e.message || e)); });
  });

  var stExport = document.getElementById('st-export');
  if (stExport) stExport.addEventListener('click', function () {
    var data = loadCustomProjects();
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'projects.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });

  window.__pfAdmin = { open: function () { if (getAdminPw()) openAdm(); else openPw(); } };
  P.ready.then(function () { renderAdmList(); window.__pfAdmin.open(); });
})();
