/* ===== 共有（端末間で同じデータを使う）の設定 =====
   Firebase を設定すると、複数の端末・複数人で同じデータを共有できます。
   空のままなら、この端末のブラウザだけに保存します。
   設定のしかたは README.md を見てください。 */
window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
/* 同じ会社・同じチームで共有するときの名前（通常は変更不要） */
window.TEAM_ID = "main";
