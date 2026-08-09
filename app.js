import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


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


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const productsRef = collection(db, "products");


function productCard(product) {

  const image = product.image ||
    "https://via.placeholder.com/500x400?text=Flipkart+Product";

  const price = product.price
    ? `₹${product.price}`
    : "";

  return `
    <div class="card">

      <img
        src="${image}"
        alt="${escapeHTML(product.name)}"
      >

      <div class="card-content">

        <h3>${escapeHTML(product.name)}</h3>

        ${
          price
          ? `<div class="price">${escapeHTML(price)}</div>`
          : ""
        }

        <a
          class="buy"
          href="${product.link}"
          target="_blank"
          rel="nofollow sponsored noopener"
        >
          Buy on Flipkart
        </a>

      </div>

    </div>
  `;
}


function adminCard(product) {

  return `
    <div class="admin-card">

      <b>${escapeHTML(product.name)}</b>

      <br>

      <small>${escapeHTML(product.link)}</small>

      <button
        class="delete"
        data-id="${product.id}"
      >
        Delete
      </button>

    </div>
  `;
}


function escapeHTML(value = "") {

  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


const productsContainer =
  document.getElementById("products");

const adminContainer =
  document.getElementById("adminProducts");


onSnapshot(productsRef, (snapshot) => {

  const products = [];

  snapshot.forEach((item) => {

    products.push({
      id: item.id,
      ...item.data()
    });

  });


  products.sort((a, b) => {

    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;

    return bTime - aTime;

  });


  if (productsContainer) {

    productsContainer.innerHTML =
      products.length
      ? products.map(productCard).join("")
      : `<p class="loading">No products yet.</p>`;

  }


  if (adminContainer) {

    adminContainer.innerHTML =
      products.length
      ? products.map(adminCard).join("")
      : `<p>No products added.</p>`;

  }

});


const addBtn =
  document.getElementById("addBtn");


if (addBtn) {

  addBtn.addEventListener("click", async () => {

    const link =
      document.getElementById("productLink").value.trim();

    const name =
      document.getElementById("productName").value.trim();

    const image =
      document.getElementById("productImage").value.trim();

    const price =
      document.getElementById("productPrice").value.trim();

    const message =
      document.getElementById("message");


    if (!link) {

      message.textContent =
        "Flipkart link paste karo.";

      return;

    }


    if (!name) {

      message.textContent =
        "Product name bhi daalo.";

      return;

    }


    try {

      await addDoc(productsRef, {

        link,
        name,
        image,
        price,
        createdAt: serverTimestamp()

      });


      document.getElementById("productLink").value = "";
      document.getElementById("productName").value = "";
      document.getElementById("productImage").value = "";
      document.getElementById("productPrice").value = "";

      message.textContent =
        "✅ Product save ho gaya.";

    }

    catch (error) {

      console.error(error);

      message.textContent =
        "❌ Product save nahi hua.";

    }

  });

}


document.addEventListener("click", async (event) => {

  if (!event.target.classList.contains("delete")) {
    return;
  }

  const id = event.target.dataset.id;

  if (!confirm("Product delete karna hai?")) {
    return;
  }

  try {

    await deleteDoc(
      doc(db, "products", id)
    );

  }

  catch (error) {

    console.error(error);

    alert("Delete nahi hua.");

  }

});
