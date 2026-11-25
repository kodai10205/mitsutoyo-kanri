/* 共有（Firebase）とファイル保存の接続部分。
   config.js が空のときは、端末内だけで動作します。 */
(function () {
  var cfg = window.FIREBASE_CONFIG || {};
  var fs = null, au = null, rdy = null;

  var downloads = {
    save: async function (o) {
      var b = o.data instanceof Blob ? o.data : new Blob([o.data]);
      var f = new File([b], o.filename, { type: b.type || 'application/octet-stream' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) {
        try { await navigator.share({ files: [f], title: o.filename }); return; }
        catch (e) { if (e && e.name === 'AbortError') return; }
      }
      var u = URL.createObjectURL(b), a = document.createElement('a');
      a.href = u; a.download = o.filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 5000);
    }
  };

  var claude = {
    signOut: null,
    use: async function (name) {
      if (name === 'downloads') return downloads;
      if (name === 'db') return dbReady();
      throw new Error('unsupported: ' + name);
    }
  };
  window.claude = claude;

  if (cfg.apiKey && cfg.projectId && window.firebase) {
    try {
      firebase.initializeApp(cfg);
      fs = firebase.firestore(); au = firebase.auth();
      try { fs.settings({ ignoreUndefinedProperties: true }); } catch (e) {}
      try { fs.enablePersistence({ synchronizeTabs: true }).catch(function () {}); } catch (e) {}
      claude.signOut = function () { return au.signOut().then(function () { location.reload(); }); };
    } catch (e) { fs = null; au = null; }
  }

  function api() {
    var root = fs.collection('teams').doc(String(window.TEAM_ID || 'main'));
    return {
      collection: function (n) {
        return { onSnapshot: function (ok, err) {
          return root.collection(n).onSnapshot(function (s) {
            ok({ docs: s.docs, fromCache: s.metadata.fromCache });
          }, err || function () {});
        } };
      },
      doc: function (path) {
        var i = path.indexOf('/');
        var r = root.collection(path.slice(0, i)).doc(path.slice(i + 1));
        return { set: function (d) { return r.set(d); }, 'delete': function () { return r['delete'](); } };
      }
    };
  }

  function dbReady() {
    if (!fs) return Promise.resolve(null);
    if (!rdy) rdy = new Promise(function (res) {
      var ui = null;
      au.onAuthStateChanged(function (u) {
        if (u) { if (ui) { ui.remove(); ui = null; } res(api()); }
        else if (!ui) ui = loginUI();
      });
    });
    return rdy;
  }

  function loginUI() {
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;inset:0;background:#0e7c9a;display:flex;align-items:center;justify-content:center;z-index:99;padding:20px;font-family:"Hiragino Sans","Yu Gothic UI","Noto Sans JP",system-ui,sans-serif';
    var inp = 'width:100%;padding:12px;margin-bottom:10px;border:1px solid #d3dce1;border-radius:8px;font-size:16px;box-sizing:border-box';
    d.innerHTML = '<div style="background:#fff;color:#14242e;border-radius:16px;padding:22px;width:100%;max-width:340px">' +
      '<div style="font-size:20px;font-weight:700;margin-bottom:4px">MITSUTOYO管理</div>' +
      '<div style="font-size:13px;color:#5b6b75;margin-bottom:16px">メールアドレスとパスワードでログインしてください</div>' +
      '<input id="lg-m" type="email" autocomplete="username" placeholder="メールアドレス" style="' + inp + '">' +
      '<input id="lg-p" type="password" autocomplete="current-password" placeholder="パスワード" style="' + inp + '">' +
      '<button id="lg-b" style="width:100%;padding:12px;border:0;border-radius:8px;background:#0e7c9a;color:#fff;font-size:16px;font-weight:700">ログイン</button>' +
      '<div id="lg-e" style="color:#c8372d;font-size:13px;margin-top:10px;min-height:1em"></div></div>';
    document.body.appendChild(d);
    function go() {
      var m = d.querySelector('#lg-m').value.trim(), p = d.querySelector('#lg-p').value, e = d.querySelector('#lg-e');
      if (!m || !p) { e.textContent = 'メールアドレスとパスワードを入力してください'; return; }
      e.textContent = '';
      au.signInWithEmailAndPassword(m, p).catch(function () { e.textContent = 'ログインできませんでした。メールアドレスかパスワードを確認してください'; });
    }
    d.querySelector('#lg-b').addEventListener('click', go);
    d.querySelector('#lg-p').addEventListener('keydown', function (ev) { if (ev.key === 'Enter') go(); });
    return d;
  }
})();
