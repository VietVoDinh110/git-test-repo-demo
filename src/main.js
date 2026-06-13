import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const app = document.querySelector("#app");

function money(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function renderShell(content) {
  app.innerHTML = `
    <section class="page">
      <header class="hero">
        <p class="eyebrow">Supabase + Vercel</p>
        <h1>Mini Shop Demo</h1>
        <p>Danh sach san pham duoc lay truc tiep tu database Supabase.</p>
      </header>
      ${content}
    </section>
  `;
}

function renderSetupWarning() {
  renderShell(`
    <section class="panel warning">
      <h2>Chua cau hinh bien moi truong</h2>
      <p>Hay them VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY tren Vercel.</p>
    </section>
  `);
}

function renderError(message) {
  renderShell(`
    <section class="panel warning">
      <h2>Khong tai duoc du lieu</h2>
      <p>${message}</p>
    </section>
  `);
}

function renderProducts(categories, products) {
  const categoryNameById = new Map(
    categories.map((category) => [category.id, category.name])
  );

  const cards = products
    .map((product) => {
      const categoryName = categoryNameById.get(product.category_id) || "Khac";
      return `
        <article class="product-card">
          <img src="${product.image_url}" alt="${product.name}" loading="lazy" />
          <div class="product-body">
            <span>${categoryName}</span>
            <h2>${product.name}</h2>
            <p>${product.description || ""}</p>
            <strong>${money(product.price)}</strong>
          </div>
        </article>
      `;
    })
    .join("");

  renderShell(`
    <section class="summary">
      <div>
        <strong>${categories.length}</strong>
        <span>danh muc</span>
      </div>
      <div>
        <strong>${products.length}</strong>
        <span>san pham mau</span>
      </div>
      <div>
        <strong>200</strong>
        <span>ket noi Supabase</span>
      </div>
    </section>
    <section class="grid">${cards}</section>
  `);
}

async function loadData() {
  if (!supabaseUrl || !supabaseAnonKey) {
    renderSetupWarning();
    return;
  }

  renderShell(`<section class="panel"><p>Dang tai du lieu tu Supabase...</p></section>`);

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("categories").select("id,name").order("id"),
    supabase.from("products").select("*").order("id"),
  ]);

  if (categoriesResult.error || productsResult.error) {
    renderError(categoriesResult.error?.message || productsResult.error?.message);
    return;
  }

  renderProducts(categoriesResult.data || [], productsResult.data || []);
}

loadData();
