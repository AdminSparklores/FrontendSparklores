import { BASE_URL, getAuthData } from "./api.js";

const BASE = `${BASE_URL}/api`

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("API Error:", { 
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      error 
    });
    throw { status: response.status, ...error };
  }
  if (response.status === 204) return {};
  return response.json();
}

// PRODUCTS
export const getProducts = () =>
  fetch(`${BASE}/products/`).then(handleResponse);

export const addProduct = (data, isFormData = false) =>
  fetch(`${BASE}/products/`, {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  }).then(handleResponse);

export const updateProduct = (id, data, isFormData = false) =>
  fetch(`${BASE}/products/${id}/`, {
    method: "PATCH",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  }).then(handleResponse);

export const deleteProduct = (id) =>
  fetch(`${BASE}/products/${id}/`, {
    method: "DELETE",
  }).then(handleResponse);

// Product Images
export const addProductImage = (productId, file) => {
  const formData = new FormData();
  formData.append("product", productId);
  formData.append("image", file);
  return fetch(`${BASE}/product-images/`, {
    method: "POST",
    body: formData,
  }).then(handleResponse);
};

export const deleteProductImage = (imageId) =>
  fetch(`${BASE}/product-images/${imageId}/`, {
    method: "DELETE",
  }).then(handleResponse);

// GIFT SETS
export const getGiftSets = () =>
  fetch(`${BASE}/gift-sets/`).then(handleResponse);

export const addGiftSet = (data, isFormData = false) =>
  fetch(`${BASE}/gift-sets/`, {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  }).then(handleResponse);

export const updateGiftSet = (id, data, isFormData = false) =>
  fetch(`${BASE}/gift-sets/${id}/`, {
    method: "PATCH",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  }).then(handleResponse);

export const deleteGiftSet = (id) =>
  fetch(`${BASE}/gift-sets/${id}/`, {
    method: "DELETE",
  }).then(handleResponse);

// CHARMS (for reference)
export const getCharms = () =>
  fetch(`${BASE}/charms/`).then(handleResponse);

export const addCharm = (data, isFormData = false) =>
  fetch(`${BASE}/charms/`, {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  }).then(handleResponse);

export const updateCharm = (id, data, isFormData = false) =>
  fetch(`${BASE}/charms/${id}/`, {
    method: "PATCH",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  }).then(handleResponse);

export const deleteCharm = (id) =>
  fetch(`${BASE}/charms/${id}/`, {
    method: "DELETE",
  }).then(handleResponse);

// ORDERS
export const getOrders = () => {
  const authData = getAuthData();
  if (!authData || !authData.token) {
    return Promise.reject({ status: 401, detail: "Not authenticated" });
  }

  return fetch(`${BASE}/admin/orders-table/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`
    }
  }).then(handleResponse);
};


// Create labels and print documents (for selected orders)
export const createLabels = (orderIds) => {
  const authData = getAuthData();
  if (!authData || !authData.token) {
    return Promise.reject({ status: 401, detail: "Not authenticated" });
  }

  return fetch(`${BASE}/orders/create_labels/`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      'Authorization': `Bearer ${authData.token}`
    },
    body: JSON.stringify({ order_ids: orderIds }),
  }).then(response => {
    if (response.ok) {
      console.log('Success for create labels, this is the response: ', response,);
      return response.blob(); // Assuming it returns a PDF
    }

    return handleResponse(response);
  });
}

// Add this to admin_api.js
// export const updateOrderStatus = (orderId, status) => {
//   const authData = getAuthData();
//   if (!authData || !authData.token) {
//     return Promise.reject({ status: 401, detail: "Not authenticated" });
//   }

//   return fetch(`${BASE}/orders/${orderId}/`, {
//     method: "PATCH",
//     headers: { 
//       "Content-Type": "application/json",
//       'Authorization': `Bearer ${authData.token}`
//     },
//     body: JSON.stringify({ fulfillment_status: status }),
//   }).then(handleResponse);
// }

