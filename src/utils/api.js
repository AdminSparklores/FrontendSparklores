// src/api.js
export const BASE_URL = 'http://192.168.1.6:8000';

// Helper function to store auth data
const storeAuthData = (data) => {
  // Decode the JWT to get the expiration time
  const decodedToken = JSON.parse(atob(data.access.split('.')[1]));
  const expiresAt = decodedToken.exp * 1000; // Convert to milliseconds
  
  localStorage.setItem('authData', JSON.stringify({
    token: data.access,
    refreshToken: data.refresh, // Store refresh token if needed
    email: data.user.email,
    user: { id: data.user.id }, // Store the user object with ID
    expiresAt: expiresAt
  }));
};

// Helper function to get auth data
export const getAuthData = () => {
  const authData = localStorage.getItem('authData');
  return authData ? JSON.parse(authData) : null;
};

// Helper function to check if user is logged in
export const isLoggedIn = () => {
  const authData = getAuthData();
  if (!authData) return false;
  
  // If expiresAt is missing, assume token is valid
  if (!authData.expiresAt) return true;
  
  return authData.expiresAt > new Date().getTime();
};


export const requestOTP = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/request-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to request OTP');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (email, code) => {
  console.log('Verifying OTP for:', email, code);
  try {
    const response = await fetch(`${BASE_URL}/auth/verify-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    console.log('Verify OTP response:', data); // Add this line

    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify OTP');
    }
    
    // Store the authentication data
    storeAuthData(data);
    console.log('Auth data stored:', getAuthData()); // Add this line

    return data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

// Add logout function
export const logout = () => {
  localStorage.removeItem('authData');
};


export const fetchCart = async () => {
  const authData = getAuthData();
  if (!authData) throw new Error('Not authenticated');

  const response = await fetch(`${BASE_URL}/api/cart/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`
    }
  });

  if (!response.ok) {
    // Add details to the error message:
    const errorText = await response.text();
    throw new Error(`Failed to fetch cart: [${response.status}] ${errorText}`);
  }

  return await response.json();
};

export const fetchProduct = async (productId) => {
  const response = await fetch(`${BASE_URL}/api/products/${productId}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }

  const product = await response.json();
  return {
    ...product,
    price: parseFloat(product.price),
    discount: parseFloat(product.discount || 0) // Default to 0 if no discount
  };
};

export const fetchCharm = async (charmId) => {
  const response = await fetch(`${BASE_URL}/api/charms/${charmId}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch charm');
  }

  return await response.json();
};


// Modified updateCartItemQuantity to support increment/decrement
export const updateCartItemQuantity = async (itemId, quantity, increment = false) => {
  const authData = getAuthData();
  if (!authData) throw new Error('Not authenticated');

  // Fetch the cart to get the current item
  const cartResponse = await fetch(`${BASE_URL}/api/cart/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`
    }
  });
  if (!cartResponse.ok) {
    throw new Error('Failed to fetch cart');
  }
  const cartData = await cartResponse.json();
  const cartItems = cartData.items || [];
  const item = cartItems.find(i => i.id === itemId);

  if (!item) {
    throw new Error('Item not found in cart');
  }

  let requestBody = { quantity };
  if (increment) {
    requestBody.quantity = item.quantity + quantity;
  }

  // Always include product/gift_set/charms in PATCH
  if (item.product && item.product.id) {
    requestBody.product = item.product.id;
  }
  if (item.gift_set && item.gift_set.id) {
    requestBody.gift_set = item.gift_set.id;
  }
  if (item.charms && Array.isArray(item.charms) && item.charms.length > 0) {
    // The charms field should be a list of charm IDs
    requestBody.charms = item.charms.map(charm => (charm.id ? charm.id : charm));
  }

  // DEBUG: Log what you send
  console.log("PATCH cart update body:", requestBody);

  const response = await fetch(`${BASE_URL}/api/cart/${itemId}/update_item/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    let errorText = "";
    try { errorText = await response.text(); } catch {}
    console.error("Failed to update cart item quantity. Status:", response.status, "Body:", errorText, "Request:", requestBody);
    throw new Error(`Failed to update cart item quantity. ${errorText}`);
  }

  const updatedItem = await response.json();
  return updatedItem;
};

export const deleteCartItem = async (itemId) => {
  const authData = getAuthData();
  if (!authData) throw new Error('Not authenticated');

  const response = await fetch(`${BASE_URL}/api/cart/${itemId}/remove/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authData.token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete cart item');
  }

  return await response.json();
};


// Add to api.js
// export const addToCart = async (productId) => {
//   const authData = getAuthData();
//   if (!authData) throw new Error('Not authenticated');

//   try {
//     // First check if product already exists in cart
//     console.log('Checking if product exists in cart...'); // Debug
//     const existingItemId = await checkProductInCart(productId);
//     console.log('Existing item ID:', existingItemId); // Debug

//     if (existingItemId) {
//       console.log('Product exists, incrementing quantity...'); // Debug
//       // If exists, increment quantity
//       const result = await updateCartItemQuantity(existingItemId, 1, true);
//       console.log('Increment result:', result); // Debug
//       return result;
//     } else {
//       console.log('Product not found, adding new item...'); // Debug
//       // If doesn't exist, add new item
//       const response = await fetch(`${BASE_URL}/api/cart/add/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${authData.token}`
//         },
//         body: JSON.stringify({
//           product: productId,
//           quantity: 1,
//           charms: []
//         })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error('Add to cart error:', errorData); // Debug
//         throw new Error(errorData.message || 'Failed to add item to cart');
//       }

//       const result = await response.json();
//       console.log('Add to cart result:', result); // Debug
//       return result;
//     }
//   } catch (error) {
//     console.error('Error in addToCart:', error); // Debug
//     throw error;
//   }
// };

// Add this new function to check if product exists in cart
// export const checkProductInCart = async (productId) => {
//   const authData = getAuthData();
//   if (!authData) throw new Error('Not authenticated');

//   const response = await fetch(`${BASE_URL}/api/cart/`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${authData.token}`
//     }
//   });

//   if (!response.ok) {
//     throw new Error('Failed to fetch cart');
//   }

//   const cartData = await response.json();
//   const cartItems = Array.isArray(cartData) ? cartData : cartData.items || [];
  
//   const existingItem = cartItems.find(item => {
//     // Handle both cases where product is an object or just an ID
//     const itemProductId = typeof item.product === 'object' 
//       ? item.product.id 
//       : item.product;
//     return itemProductId == productId; // Use == for loose comparison (number vs string)
//   });
  
//   return existingItem ? existingItem.id : null;
// };

export const addToCart = async (productId, data) => {
  if (!productId && !data.gift_set && (!data.charms || data.charms.length === 0)) {
    throw new Error('No product, gift_set, or charms specified');
  }

  const authData = getAuthData();
  if (!authData) throw new Error('Not authenticated');

  // 1. Fetch current cart
  const response = await fetch(`${BASE_URL}/api/cart/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`
    }
  });

  if (!response.ok) throw new Error('Failed to fetch cart');
  const cartData = await response.json();
  const cartItems = cartData.items || [];

  // 2. Find if a matching item already exists
  const existingItem = cartItems.find(item => {
    const isSameProduct = productId && item.product == productId;
    const isSameGiftSet = data.gift_set && item.gift_set == data.gift_set;
    const isSameCharms = JSON.stringify(item.charms?.sort()) === JSON.stringify((data.charms || []).sort());

    // Match by type
    if (item.source_type === "product" && isSameProduct && isSameCharms) return true;
    if (item.source_type === "gift_set" && isSameGiftSet) return true;
    if (item.source_type === "charms_only" && isSameCharms) return true;

    return false;
  });

  // 3. If match found: PATCH to increase quantity
  if (existingItem) {
    const newQty = (existingItem.quantity || 1) + (data.quantity || 1);

    const patchResp = await fetch(`${BASE_URL}/api/cart/${existingItem.id}/update_item/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      },
      body: JSON.stringify({ quantity: newQty })
    });

    if (!patchResp.ok) {
      let msg = "Failed to update cart";
      try { msg = await patchResp.text(); } catch {}
      throw new Error(msg);
    }

    return await patchResp.json();
  }

  // 4. If no match: POST a new item
  const postData = {
    ...data,
    ...(productId ? { product: productId } : {})
  };

  const postResp = await fetch(`${BASE_URL}/api/cart/add/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`
    },
    body: JSON.stringify(postData)
  });

  if (!postResp.ok) {
    let msg = "Failed to add item to cart";
    try { msg = await postResp.text(); } catch {}
    throw new Error(msg);
  }

  return await postResp.json();
};


export const checkProductInCart = async (productId) => {
  const authData = getAuthData();
  if (!authData) throw new Error('Not authenticated');

  const response = await fetch(`${BASE_URL}/api/cart/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }

  const cartData = await response.json();
  const cartItems = Array.isArray(cartData) ? cartData : cartData.items || [];
  
  const existingItem = cartItems.find(item => {
    if (!item.product) return false;
    if (typeof item.product === 'object' && item.product !== null && 'id' in item.product) {
      return item.product.id == productId;
    }
    return item.product == productId;
  });
  
  return existingItem ? existingItem.id : null;
};

export const subscribeToNewsletter = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/api/newsletters/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 400 Bad Request with specific error message
      if (response.status === 400 && data.email) {
        return { 
          error: true,
          message: data.email[0] || "Email already subscribed",
          alreadySubscribed: true 
        };
      }
      throw new Error(data.message || 'Failed to subscribe to newsletter');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    throw error;
  }
};

// Add to src/api.js
export const fetchAllCharms = async () => {
  const response = await fetch(`${BASE_URL}/api/charms/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch charms');
  }

  const charms = await response.json();
  return charms.map(charm => ({
    ...charm,
    price: parseFloat(charm.price),
    discount: parseFloat(charm.discount || 0),
    rating: parseFloat(charm.rating || 0)
  }));
};

// Function to fetch the banner image for a specific page
export const fetchPageBanner = async (page) => {
  try {
    const response = await fetch(`${BASE_URL}/api/page-banners/`);
    if (!response.ok) {
      throw new Error("Failed to fetch page banners");
    }
    const data = await response.json();

    // Find the banner for the specified page
    const pageBanner = data.find(banner => banner.page === page);
    if (pageBanner) {
      return pageBanner.image_url; // Return the image URL
    } else {
      throw new Error(`No banner found for page: ${page}`);
    }
  } catch (error) {
    console.error("Error fetching page banner:", error);
    throw error; // Rethrow the error for handling in the component
  }
};

// Function to fetch the most recent 6 images from the photo gallery
export const fetchRecentGalleryImages = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/photo-gallery/`);
    if (!response.ok) {
      throw new Error("Failed to fetch photo gallery images");
    }
    const data = await response.json();

    // Get the most recent 6 images
    const recentImages = data.slice(-6); // Assuming the API returns images in chronological order
    return recentImages; // Return the array of recent images
  } catch (error) {
    console.error("Error fetching recent gallery images:", error);
    throw error; // Rethrow the error for handling in the component
  }
};
