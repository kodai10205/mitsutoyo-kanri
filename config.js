/* ===== 共有（端末間で同じデータを使う）の設定 =====
   Firebase を設定すると、複数の端末・複数人で同じデータを共有できます。
   空のままなら、この端末のブラウザだけに保存します。
   設定のしかたは README.md を見てください。 */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCmbMp_IklimcFeqWs24hfuFV1aGi0VRGY",
  authDomain: "mitsutoyo-kanri.firebaseapp.com",
  projectId: "mitsutoyo-kanri",
  storageBucket: "mitsutoyo-kanri.firebasestorage.app",
  messagingSenderId: "172229296379",
  appId: "1:172229296379:web:267a373fa143576076b05e"
};
/* 同じ会社・同じチームで共有するときの名前（通常は変更不要） */
window.TEAM_ID = "main";
