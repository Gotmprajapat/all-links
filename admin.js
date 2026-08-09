import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================
   FIREBASE CONFIG
========================= */

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiG9rMuPURjLhJDE3HorL0QrL7qE86h5c",
  authDomain: "drozioostore.firebaseapp.com",
  databaseURL: "https://drozioostore-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "drozioostore",
  storageBucket: "drozioostore.firebasestorage.app",
  messagingSenderId: "930907642567",
  appId: "1:930907642567:web:460334236bea24d3b1bce2",
  measurementId: "G-SJF910VQZ2"
};


/* =========================
   FIREBASE
========================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const productsRef = collection(db, "products");


/* =========================
   ELEMENTS
========================= */

const loginBox =
  document.getElementById("loginBox");

const adminPanel =
  document.getElementById("adminPanel");

const email =
  document.getElementById("email");

const password =
  document.getElementById("password");

const loginBtn =
  document.getElementById("loginBtn");

const logoutBtn =
  document.getElementById("logoutBtn");

const loginMessage =
  document.getElementById("loginMessage");

const message =
  document.getElementById("message");

const adminProducts =
  document.getElementById("adminProducts");


/* =========================
   LOGIN
========================= */

loginBtn.addEventListener("click", async () => {

  const userEmail = email.value.trim();

  const userPassword = password.value;

  if (!userEmail || !userPassword) {

    loginMessage.textContent =
      "Email aur password dono bharo.";

    return;
  }


  try {

    await signInWithEmailAndPassword(
      auth,
      userEmail,
      userPassword
    );

    loginMessage.textContent = "";

  } catch (error) {

    console.error(error);

    loginMessage.textContent =
      "❌ Email ya password galat hai.";

  }

});


/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(auth, (user) => {

  if (user) {

    loginBox.style.display = "none";

    adminPanel.style.display = "block";

    loadProducts();

  } else {

    loginBox.style.display = "block";

    adminPanel.style.display = "none";

  }

});


/* =========================
   LOGOUT
========================= */

logoutBtn.addEventListener("click", async () => {

  await signOut(auth);

});


/* =========================
   ADD PRODUCT
========================= */

document
  .getElementById("addBtn")
  .addEventListener("click", async () => {

    const name =
      document.getElementById("productName")
        .value.trim();

    const image =
      document.getElementById("productImage")
        .value.trim();

    const price =
      document.getElementById("productPrice")
        .value.trim();

    const oldPrice =
      document.getElementById("productOldPrice")
        .value.trim();

    const description =
      document.getElementById("productDescription")
        .value.trim();

    const link =
      document.getElementById("productLink")
        .value.trim();


    if (!name) {

      message.textContent =
        "❌ Product name bharo.";

      return;
    }

    if (!image) {

      message.textContent =
        "❌ Product image URL bharo.";

      return;
    }

    if (!price) {

      message.textContent =
        "❌ Price bharo.";

      return;
    }

    if (!link) {

      message.textContent =
        "❌ Flipkart affiliate link bharo.";

      return;
    }


    try {

      await addDoc(productsRef, {

        name: name,

        image: image,

        price: price,

        oldPrice: oldPrice,

        description: description,

        link: link,

        createdAt: serverTimestamp()

      });


      clearForm();

      message.textContent =
        "✅ Product successfully save ho gaya.";

    } catch (error) {

      console.error(error);

      message.textContent =
        "❌ Product save nahi hua.";

    }

  });


/* =========================
   LOAD PRODUCTS
========================= */

function loadProducts() {

  onSnapshot(productsRef, (snapshot) => {

    let products = [];

    snapshot.forEach((item) => {

      products.push({

        id: item.id,

        ...item.data()

      });

    });


    products.sort((a, b) => {

      const aTime =
        a.createdAt?.seconds || 0;

      const bTime =
        b.createdAt?.seconds || 0;

      return bTime - aTime;

    });


    if (products.length === 0) {

      adminProducts.innerHTML =
        "<p>No products added yet.</p>";

      return;

    }


    adminProducts.innerHTML =
      products
        .map(productAdminCard)
        .join("");


    document
      .querySelectorAll(".deleteProduct")
      .forEach((button) => {

        button.addEventListener(
          "click",
          deleteProduct
        );

      });

  });

}


/* =========================
   ADMIN PRODUCT CARD
========================= */

function productAdminCard(product) {

  return `

    <div class="admin-card">

      <img
        src="${escapeHTML(product.image || "")}"
        style="
          width:100%;
          max-width:150px;
          height:120px;
          object-fit:contain;
          display:block;
          margin-bottom:10px;
        "
      >

      <h3>
        ${escapeHTML(product.name)}
      </h3>

      <p>
        Price: ₹${escapeHTML(product.price || "")}
      </p>

      ${
        product.oldPrice
        ? `<p>
            Old Price:
            ₹${escapeHTML(product.oldPrice)}
           </p>`
        : ""
      }

      <p>
        ${escapeHTML(product.description || "")}
      </p>

      <button
        class="deleteProduct delete"
        data-id="${product.id}"
      >
        🗑️ Delete
      </button>

    </div>

  `;

}


/* =========================
   DELETE
========================= */

async function deleteProduct(event) {

  const id =
    event.currentTarget.dataset.id;


  const confirmDelete =
    confirm(
      "Kya tum ye product delete karna chahte ho?"
    );


  if (!confirmDelete) return;


  try {

    await deleteDoc(
      doc(db, "products", id)
    );

    message.textContent =
      "✅ Product delete ho gaya.";

  } catch (error) {

    console.error(error);

    message.textContent =
      "❌ Delete nahi hua.";

  }

}


/* =========================
   CLEAR FORM
========================= */

function clearForm() {

  document.getElementById("productName").value = "";

  document.getElementById("productImage").value = "";

  document.getElementById("productPrice").value = "";

  document.getElementById("productOldPrice").value = "";

  document.getElementById("productDescription").value = "";

  document.getElementById("productLink").value = "";

}


/* =========================
   SECURITY
========================= */

function escapeHTML(value = "") {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}
