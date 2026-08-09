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
  doc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


/* =================================
   FIREBASE CONFIG
================================= */

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

/* =================================
   FIREBASE INITIALIZE
================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

const productsRef = collection(db, "products");


/* =================================
   ELEMENTS
================================= */

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

const imageInput =
  document.getElementById("productImage");

const imagePreview =
  document.getElementById("imagePreview");


/* =================================
   IMAGE PREVIEW
================================= */

if (imageInput) {

  imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) {

      imagePreview.style.display = "none";

      imagePreview.src = "";

      return;
    }


    if (!file.type.startsWith("image/")) {

      message.textContent =
        "❌ Sirf image select karo.";

      imageInput.value = "";

      return;
    }


    const imageURL =
      URL.createObjectURL(file);

    imagePreview.src = imageURL;

    imagePreview.style.display = "block";

  });

}


/* =================================
   LOGIN
================================= */

if (loginBtn) {

  loginBtn.addEventListener("click", async () => {

    const userEmail =
      email.value.trim();

    const userPassword =
      password.value;


    if (!userEmail || !userPassword) {

      loginMessage.textContent =
        "Email aur password dono bharo.";

      return;

    }


    loginBtn.disabled = true;

    loginBtn.textContent =
      "Logging in...";


    try {

      await signInWithEmailAndPassword(
        auth,
        userEmail,
        userPassword
      );

      loginMessage.textContent = "";

    }

    catch (error) {

      console.error(error);

      loginMessage.textContent =
        "❌ Email ya password galat hai.";

    }

    finally {

      loginBtn.disabled = false;

      loginBtn.textContent =
        "Login";

    }

  });

}


/* =================================
   AUTH STATE
================================= */

onAuthStateChanged(auth, (user) => {

  if (user) {

    loginBox.style.display = "none";

    adminPanel.style.display = "block";

    loadProducts();

  }

  else {

    loginBox.style.display = "block";

    adminPanel.style.display = "none";

  }

});


/* =================================
   LOGOUT
================================= */

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    try {

      await signOut(auth);

    }

    catch (error) {

      console.error(error);

    }

  });

}


/* =================================
   ADD PRODUCT
================================= */

const addBtn =
  document.getElementById("addBtn");


if (addBtn) {

  addBtn.addEventListener("click", async () => {

    const name =
      document
        .getElementById("productName")
        .value
        .trim();


    const imageFile =
      document
        .getElementById("productImage")
        .files[0];


    const price =
      document
        .getElementById("productPrice")
        .value
        .trim();


    const oldPrice =
      document
        .getElementById("productOldPrice")
        .value
        .trim();


    const description =
      document
        .getElementById("productDescription")
        .value
        .trim();


    const link =
      document
        .getElementById("productLink")
        .value
        .trim();


    /* =========================
       VALIDATION
    ========================= */

    if (!name) {

      message.textContent =
        "❌ Product name bharo.";

      return;

    }


    if (!imageFile) {

      message.textContent =
        "❌ Product ki photo select karo.";

      return;

    }


    if (!imageFile.type.startsWith("image/")) {

      message.textContent =
        "❌ Sirf image file select karo.";

      return;

    }


    if (imageFile.size > 5 * 1024 * 1024) {

      message.textContent =
        "❌ Image 5MB se chhoti honi chahiye.";

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


    /* =========================
       CHECK LOGIN
    ========================= */

    const user = auth.currentUser;

    if (!user) {

      message.textContent =
        "❌ Pehle login karo.";

      return;

    }


    /* =========================
       BUTTON LOADING
    ========================= */

    addBtn.disabled = true;

    addBtn.textContent =
      "Uploading...";


    try {

      /* =========================
         UPLOAD IMAGE
      ========================= */

      const safeFileName =
        imageFile.name
          .replace(/[^a-zA-Z0-9._-]/g, "_");


      const fileName =
        `products/${Date.now()}_${safeFileName}`;


      const storageRef =
        ref(storage, fileName);


      await uploadBytes(
        storageRef,
        imageFile
      );


      /* =========================
         GET IMAGE URL
      ========================= */

      const imageURL =
        await getDownloadURL(storageRef);


      /* =========================
         SAVE PRODUCT
      ========================= */

      await addDoc(productsRef, {

        name: name,

        image: imageURL,

        price: price,

        oldPrice: oldPrice,

        description: description,

        link: link,

        createdAt: serverTimestamp(),

        createdBy: user.uid

      });


      /* =========================
         CLEAR FORM
      ========================= */

      clearForm();


      message.textContent =
        "✅ Product successfully add ho gaya.";

    }

    catch (error) {

      console.error(error);

      message.textContent =
        "❌ Product add nahi hua: " +
        error.message;

    }

    finally {

      addBtn.disabled = false;

      addBtn.textContent =
        "➕ Add Product";

    }

  });

}


/* =================================
   LOAD PRODUCTS
================================= */

let productsListenerStarted = false;


function loadProducts() {

  if (productsListenerStarted) {
    return;
  }

  productsListenerStarted = true;


  onSnapshot(

    productsRef,

    (snapshot) => {

      let products = [];


      snapshot.forEach((item) => {

        products.push({

          id: item.id,

          ...item.data()

        });

      });


      /* =========================
         NEWEST FIRST
      ========================= */

      products.sort((a, b) => {

        const aTime =
          a.createdAt?.seconds || 0;

        const bTime =
          b.createdAt?.seconds || 0;

        return bTime - aTime;

      });


      /* =========================
         EMPTY
      ========================= */

      if (products.length === 0) {

        adminProducts.innerHTML =
          "<p>No products added yet.</p>";

        return;

      }


      /* =========================
         DISPLAY
      ========================= */

      adminProducts.innerHTML =
        products
          .map(productAdminCard)
          .join("");


      /* =========================
         DELETE BUTTONS
      ========================= */

      document
        .querySelectorAll(".deleteProduct")
        .forEach((button) => {

          button.addEventListener(
            "click",
            deleteProduct
          );

        });

    },

    (error) => {

      console.error(error);

      adminProducts.innerHTML =
        "<p>❌ Products load nahi hue.</p>";

    }

  );

}


/* =================================
   ADMIN PRODUCT CARD
================================= */

function productAdminCard(product) {

  return `

    <div class="admin-card">

      <img
        src="${escapeHTML(product.image || "")}"
        alt="${escapeHTML(product.name || "Product")}"
        style="
          width:100%;
          max-width:150px;
          height:120px;
          object-fit:contain;
          display:block;
          margin-bottom:10px;
          border-radius:10px;
        "
      >

      <h3>
        ${escapeHTML(product.name || "")}
      </h3>

      <p>
        Price:
        ₹${escapeHTML(product.price || "")}
      </p>


      ${
        product.oldPrice
          ? `
            <p>
              Old Price:
              ₹${escapeHTML(product.oldPrice)}
            </p>
          `
          : ""
      }


      ${
        product.description
          ? `
            <p>
              ${escapeHTML(product.description)}
            </p>
          `
          : ""
      }


      <button
        class="deleteProduct delete"
        data-id="${escapeHTML(product.id)}"
      >
        🗑️ Delete
      </button>

    </div>

  `;

}


/* =================================
   DELETE PRODUCT
================================= */

async function deleteProduct(event) {

  const id =
    event.currentTarget.dataset.id;


  const confirmDelete =
    confirm(
      "Kya tum ye product delete karna chahte ho?"
    );


  if (!confirmDelete) {
    return;
  }


  try {

    await deleteDoc(
      doc(db, "products", id)
    );


    message.textContent =
      "✅ Product delete ho gaya.";

  }

  catch (error) {

    console.error(error);

    message.textContent =
      "❌ Product delete nahi hua.";

  }

}


/* =================================
   CLEAR FORM
================================= */

function clearForm() {

  document
    .getElementById("productName")
    .value = "";


  document
    .getElementById("productImage")
    .value = "";


  document
    .getElementById("productPrice")
    .value = "";


  document
    .getElementById("productOldPrice")
    .value = "";


  document
    .getElementById("productDescription")
    .value = "";


  document
    .getElementById("productLink")
    .value = "";


  if (imagePreview) {

    imagePreview.src = "";

    imagePreview.style.display =
      "none";

  }

}


/* =================================
   HTML SECURITY
================================= */

function escapeHTML(value = "") {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

        }
