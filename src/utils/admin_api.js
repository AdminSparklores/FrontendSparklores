import { BASE_URL, getAuthData, } from "./api.js";

const BASE = `${BASE_URL}/api`

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    // console.error("API Error:", { 
    //   status: response.status,
    //   statusText: response.statusText,
    //   url: response.url,
    //   error 
    // });
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
// export const getOrders = () => {
//   const authData = getAuthData();
//   if (!authData || !authData.token) {
//     return Promise.reject({ status: 401, detail: "Not authenticated" });
//   }

//   return fetch(`${BASE}/admin/orders-table/`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${authData.token}`
//     }
//   }).then(handleResponse);
// };

// ORDERS - Updated to support date filtering
export const getOrders = (startDate = null, endDate = null) => {
  const authData = getAuthData();
  if (!authData || !authData.token) {
    return Promise.reject({ status: 401, detail: "Not authenticated" });
  }

  // Build query parameters
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const url = `${BASE}/admin/orders-table/${params.toString() ? `?${params.toString()}` : ''}`;

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`
    }
  }).then(handleResponse);
};


// Create labels and print documents (for selected orders)
// admin_api.js - Updated createLabels()

// admin_api.js
// admin_api.js - Updated createLabels()
export const createLabels = async (orders) => {
  const authData = getAuthData();
  if (!authData || !authData.token) {
    return Promise.reject({ status: 401, detail: "Not authenticated" });
  }

  const labelPromises = orders.map(order => {
    return fetch(`${BASE}/jnt/print/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.token}`
      },
      body: JSON.stringify({ billcode: order.billcode }),
    }).then(async (response) => {
      // console.log("📬 Raw response URL:", `${BASE}/jnt/print/`);
      // console.log("📤 Sent payload:", { billcode: order.billcode });
      // console.log("📥 Response status:", response.status);
      const text = await response.text();
      // console.log("📄 Raw response text:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON response from server");
      }

      if (!response.ok) {
        const reason = data.responseitems?.[0]?.reason || data.error || "Unknown error";
        return { error: `HTTP ${response.status}: ${reason}` };
      }

      const responseItem = data.responseitems?.[0];
      if (!responseItem) {
        return { error: "No response from shipping provider" };
      }

      if (responseItem.success === "true" && responseItem.rotaprinturl) {
        return { url: responseItem.rotaprinturl };
      } else {
        // Handle different error codes with user-friendly messages
        let errorMessage = responseItem.reason || "Unknown error";
        
        // Map JNT error codes to friendly messages
        const errorMap = {
          "S28": "Shipment already processed or canceled in JNT system",
          "S10": "Billcode not found in JNT system",
          "S99": "System error at JNT",
          // Add more error codes as needed
        };
        
        if (errorMap[responseItem.reason]) {
          errorMessage = errorMap[responseItem.reason];
        }
        
        return { error: errorMessage };
      }
    }).catch(error => {
      // console.error("Label creation error for billcode:", order.billcode, error);
      return { error: error.message || "Network error" };
    });
  });

  return Promise.all(labelPromises);
};

// NEW: Create merged PDF labels using order_ids
export const createMergedLabels = (orderIds) => {
  const authData = getAuthData();
  if (!authData || !authData.token) {
    return Promise.reject({ status: 401, detail: "Not authenticated" });
  }

  return fetch(`${BASE}/orders/create_labels/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authData.token}`
    },
    body: JSON.stringify({ order_ids: orderIds }),
  })
  .then(async (response) => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Expecting a PDF blob
    return response.blob();
  })
  .then(blob => {
    // console.log("✅ Successfully received merged PDF blob");
    return blob;
  })
  .catch(error => {
    // console.error("Failed to create merged labels:", error);
    throw new Error(`Create labels failed: ${error.message}`);
  });
};

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


// JNT Cancel API - Enhanced with proper error handling and logging
// JNT Cancel API - Fixed to match actual expected format
export const cancelJntOrder = async (orderId, reason) => {
  const authData = getAuthData();
  if (!authData || !authData.token) {
    // console.error('Authentication error: No auth token found');
    throw new Error("Not authenticated");
  }

  // Ensure orderid is sent as string
  const payload = {
    detail: {
      orderid: String(orderId),
      reason: reason || "Canceled by user"
    }
  };

  try {
    // console.log('Sending JNT cancel request:', payload);

    const response = await fetch(`${BASE}/jnt/cancel/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      // console.error("Failed to parse JSON response:", await response.text());
      throw new Error("Invalid response from server");
    }

    // console.log('JNT cancel response:', result);

    if (!result.success) {
      const errorMsg = result.desc || result.detail?.[0]?.reason || "Unknown error";
      // console.error('JNT API error:', errorMsg);
      throw new Error(errorMsg);
    }

    // ✅ Fix: Compare as strings
    const orderResult = result.detail?.find(d => d.orderid === String(orderId));
    if (!orderResult) {
      throw new Error(`Order ${orderId} not found in response`);
    }

    if (orderResult.status !== "Sukses") {
      const reason = orderResult.reason || "Cancellation failed";
      // console.error('Order cancellation failed:', reason);
      throw new Error(reason);
    }

    return result;
  } catch (error) {
    if (error.name === "TypeError" || error.message.includes("fetch")) {
      // console.error("Network error:", error);
      throw new Error("Network error: Unable to reach the server. Please check your connection.");
    }
    throw error;
  }
};