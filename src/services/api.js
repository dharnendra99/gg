import { supabase } from '../supabase';

// ======================= AUTHENTICATION =======================
// Handled directly via supabase.auth in the components but kept for signature compatibility
export const signup = async (data) => {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { name: data.name, phone: data.phone, role: data.role || 'staff' } }
  });
  if (error) throw error;
  
  // Insert into our custom public.users table
  if (authData.user) {
    const { error: profileError } = await supabase.from('users').insert([{
      id: authData.user.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role || 'staff'
    }]);
    if (profileError) throw profileError;
  }
  
  return { data: { message: "User registered successfully" } };
};

export const login = async (data) => {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  if (error) throw error;
  
  // Fetch user profile data
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle();
    
  if (profileError) throw profileError;
  
  return { data: { user: { ...authData.user, ...userProfile }, token: authData.session.access_token } };
};

export const forgotPassword = async (data) => {
  const { error } = await supabase.auth.resetPasswordForEmail(data.email);
  if (error) throw error;
  return { data: { message: "Password reset instructions sent" } };
};

export const resetPassword = async (data) => {
  const { error } = await supabase.auth.updateUser({ password: data.newPassword });
  if (error) throw error;
  return { data: { message: "Password updated successfully" } };
};

export const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if(error) throw error;
}

// ======================= PRODUCTS =======================
export const getProducts = async (params = {}) => {
  let query = supabase.from('products').select(`*, category:categories(name)`);
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return { data };
};

export const getProduct = async (id) => {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return { data };
};

export const createProduct = async (data) => {
  const { initial_stock, location_id, ...productData } = data;
  
  // Clean empty strings for foreign keys
  if (productData.category_id === '') productData.category_id = null;

  const { data: resData, error } = await supabase.from('products').insert([productData]).select();
  if (error) throw error;
  
  const newProductId = resData[0].id;
  
  if (initial_stock > 0 && location_id) {
    // Insert initial stock
    const { error: stockError } = await supabase.from('stock').insert([{
      product_id: newProductId,
      location_id: location_id,
      quantity: initial_stock
    }]);
    
    if (!stockError) {
      // Add ledger entry for initial stock
      await supabase.from('stock_ledger').insert([{
        product_id: newProductId,
        location_id: location_id,
        operation_type: 'adjustment', // Or another appropriate type
        quantity_change: initial_stock,
        balance_after: initial_stock,
        notes: "Initial stock upon product creation"
      }]);
    }
  }
  
  return { data: { message: "Product created successfully", id: newProductId } };
};

export const updateProduct = async (data) => {
  const { id, initial_stock, location_id, ...updateData } = data;
  
  if (updateData.category_id === '') updateData.category_id = null;

  const { error } = await supabase.from('products').update(updateData).eq('id', id);
  if (error) throw error;
  return { data: { message: "Product updated successfully" } };
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return { data: { message: "Product deleted successfully" } };
};

// ======================= CATEGORIES =======================
export const getCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return { data };
};

export const createCategory = async (data) => {
  const { data: resData, error } = await supabase.from('categories').insert([data]).select();
  if (error) throw error;
  return { data: { message: "Category created successfully", id: resData[0].id } };
};

export const updateCategory = async (data) => {
  const { id, ...updateData } = data;
  const { error } = await supabase.from('categories').update(updateData).eq('id', id);
  if (error) throw error;
  return { data: { message: "Category updated successfully" } };
};

export const deleteCategory = async (id) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  return { data: { message: "Category deleted successfully" } };
};

// ======================= RECEIPTS =======================
export const getReceipts = async (params = {}) => {
  const { data, error } = await supabase.from('receipts').select(`*, warehouse:warehouses(name)`);
  if (error) throw error;
  return { data };
};

export const getReceipt = async (id) => {
  const { data, error } = await supabase.from('receipts').select(`*, items:receipt_items(*, product:products(name, sku))`).eq('id', id).single();
  if (error) throw error;
  return { data };
};

export const createReceipt = async (data) => {
  const { items, ...receiptData } = data;
  const { data: newReceipt, error: receiptError } = await supabase.from('receipts').insert([receiptData]).select().single();
  if (receiptError) throw receiptError;
  
  if (items && items.length > 0) {
      const itemsToInsert = items.map(item => ({ ...item, receipt_id: newReceipt.id }));
      const { error: itemsError } = await supabase.from('receipt_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
  }
  
  return { data: { message: "Receipt created successfully", id: newReceipt.id } };
};

export const updateReceipt = async (data) => {
  const { id, items, ...updateData } = data;
  const { error } = await supabase.from('receipts').update(updateData).eq('id', id);
  if (error) throw error;
  
  // Note: For simplicity, we assume robust item updates are either done separately or 
  // via a full delete-and-reinsert method. This mock follows the simplest approach.
  
  return { data: { message: "Receipt updated successfully" } };
};

export const validateReceipt = async (data) => {
  const { id } = data;
  
  // 1. Mark as done
  const { error: updateError } = await supabase.from('receipts').update({ status: 'done' }).eq('id', id);
  if (updateError) throw updateError;
  
  // 2. Fetch receipt details and items to update stock (Mocked logic for Client Side to DB execution)
  const { data: receiptDetails } = await supabase.from('receipts').select('location_id').eq('id', id).single();
  const { data: items } = await supabase.from('receipt_items').select('*').eq('receipt_id', id);
  
  // For each item, add to stock. (Normally done via a DB trigger or Stored Procedure for ACID safety)
  if(items) {
      for(let item of items) {
          // Check if stock exists
          const { data: existingStock } = await supabase.from('stock').select('*').eq('product_id', item.product_id).eq('location_id', receiptDetails.location_id).maybeSingle();
          if(existingStock) {
              await supabase.from('stock').update({ quantity: existingStock.quantity + item.received_qty }).eq('id', existingStock.id);
          } else {
              await supabase.from('stock').insert([{ product_id: item.product_id, location_id: receiptDetails.location_id, quantity: item.received_qty }]);
          }
           // Add Ledger Entry
          await supabase.from('stock_ledger').insert([{
             product_id: item.product_id,
             location_id: receiptDetails.location_id,
             operation_type: 'receipt',
             quantity_change: item.received_qty,
             balance_after: existingStock ? existingStock.quantity + item.received_qty : item.received_qty,
             reference_id: id
          }]);
      }
  }

  return { data: { message: "Receipt validated and stock updated" } };
};

// ======================= DELIVERIES =======================
export const getDeliveries = async (params = {}) => {
  const { data, error } = await supabase.from('deliveries').select(`*, warehouse:warehouses(name)`);
  if (error) throw error;
  return { data };
};

export const getDelivery = async (id) => {
  const { data, error } = await supabase.from('deliveries').select(`*, items:delivery_items(*, product:products(name, sku))`).eq('id', id).single();
  if (error) throw error;
  return { data };
};

export const createDelivery = async (data) => {
  const { items, ...deliveryData } = data;
  const { data: newDelivery, error } = await supabase.from('deliveries').insert([deliveryData]).select().single();
  if (error) throw error;
  
  if (items && items.length > 0) {
      const itemsToInsert = items.map(item => ({ ...item, delivery_id: newDelivery.id }));
      const { error: itemsError } = await supabase.from('delivery_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
  }
  return { data: { message: "Delivery created successfully", id: newDelivery.id } };
};

export const updateDelivery = async (data) => {
  const { id, items, ...updateData } = data;
  const { error } = await supabase.from('deliveries').update(updateData).eq('id', id);
  if (error) throw error;
  return { data: { message: "Delivery updated successfully" } };
};

export const validateDelivery = async (data) => {
   const { id } = data;
   const { error: updateError } = await supabase.from('deliveries').update({ status: 'done' }).eq('id', id);
   if (updateError) throw updateError;
   
   const { data: deliveryDetails } = await supabase.from('deliveries').select('location_id').eq('id', id).single();
   const { data: items } = await supabase.from('delivery_items').select('*').eq('delivery_id', id);
   
   if(items) {
       for(let item of items) {
           const { data: existingStock } = await supabase.from('stock').select('*').eq('product_id', item.product_id).eq('location_id', deliveryDetails.location_id).single();
           if(existingStock) {
               await supabase.from('stock').update({ quantity: existingStock.quantity - item.delivered_qty }).eq('id', existingStock.id);
               await supabase.from('stock_ledger').insert([{
                    product_id: item.product_id,
                    location_id: deliveryDetails.location_id,
                    operation_type: 'delivery',
                    quantity_change: -item.delivered_qty,
                    balance_after: existingStock.quantity - item.delivered_qty,
                    reference_id: id
                 }]);
           }
       }
   }
   return { data: { message: "Delivery validated and stock updated" } };
};

// ======================= TRANSFERS =======================
export const getTransfers = async (params = {}) => {
  const { data, error } = await supabase.from('transfers').select(`*`);
  if (error) throw error;
  return { data };
};

export const getTransfer = async (id) => {
  const { data, error } = await supabase.from('transfers').select(`*, items:transfer_items(*, product:products(name, sku))`).eq('id', id).single();
  if (error) throw error;
  return { data };
};

export const createTransfer = async (data) => {
  const { items, ...transferData } = data;
  const { data: newTransfer, error } = await supabase.from('transfers').insert([transferData]).select().single();
  if (error) throw error;
  
  if (items && items.length > 0) {
      const itemsToInsert = items.map(item => ({ ...item, transfer_id: newTransfer.id }));
      const { error: itemsError } = await supabase.from('transfer_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
  }
  return { data: { message: "Transfer created successfully", id: newTransfer.id } };
};

export const validateTransfer = async (data) => {
   const { id } = data;
   const { error: updateError } = await supabase.from('transfers').update({ status: 'done' }).eq('id', id);
   if (updateError) throw updateError;
   
   const { data: transferDetails } = await supabase.from('transfers').select('from_location_id, to_location_id').eq('id', id).single();
   const { data: items } = await supabase.from('transfer_items').select('*').eq('transfer_id', id);
   
   if(items) {
       for(let item of items) {
           // Decrement from source
           const { data: sourceStock } = await supabase.from('stock').select('*').eq('product_id', item.product_id).eq('location_id', transferDetails.from_location_id).single();
           if(sourceStock) {
               await supabase.from('stock').update({ quantity: sourceStock.quantity - item.quantity }).eq('id', sourceStock.id);
           }
           // Increment to destination
           const { data: destStock } = await supabase.from('stock').select('*').eq('product_id', item.product_id).eq('location_id', transferDetails.to_location_id).maybeSingle();
           if(destStock) {
               await supabase.from('stock').update({ quantity: destStock.quantity + item.quantity }).eq('id', destStock.id);
           } else {
               await supabase.from('stock').insert([{ product_id: item.product_id, location_id: transferDetails.to_location_id, quantity: item.quantity }]);
           }
       }
   }
   return { data: { message: "Transfer validated" } };
};

// ======================= ADJUSTMENTS =======================
export const getAdjustments = async (params = {}) => {
  const { data, error } = await supabase.from('adjustments').select(`*`);
  if (error) throw error;
  return { data };
};

export const getAdjustment = async (id) => {
  const { data, error } = await supabase.from('adjustments').select(`*, items:adjustment_items(*, product:products(name, sku))`).eq('id', id).single();
  if (error) throw error;
  return { data };
};

export const createAdjustment = async (data) => {
  const { items, ...adjData } = data;
  const { data: newAdj, error } = await supabase.from('adjustments').insert([adjData]).select().single();
  if (error) throw error;
  
  if (items && items.length > 0) {
      const itemsToInsert = items.map(item => ({ ...item, adjustment_id: newAdj.id }));
      const { error: itemsError } = await supabase.from('adjustment_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
  }
  return { data: { message: "Adjustment created successfully", id: newAdj.id } };
};

export const validateAdjustment = async (data) => {
   const { id } = data;
   const { error: updateError } = await supabase.from('adjustments').update({ status: 'done' }).eq('id', id);
   if (updateError) throw updateError;
   
   const { data: adjDetails } = await supabase.from('adjustments').select('location_id').eq('id', id).single();
   const { data: items } = await supabase.from('adjustment_items').select('*').eq('adjustment_id', id);
   
   if(items) {
       for(let item of items) {
           const { data: existingStock } = await supabase.from('stock').select('*').eq('product_id', item.product_id).eq('location_id', adjDetails.location_id).maybeSingle();
           if(existingStock) {
               await supabase.from('stock').update({ quantity: item.counted_qty }).eq('id', existingStock.id);
           } else {
                await supabase.from('stock').insert([{ product_id: item.product_id, location_id: adjDetails.location_id, quantity: item.counted_qty }]);
           }
       }
   }
   return { data: { message: "Adjustment validated" } };
};

// ======================= STOCK & LEDGER =======================
export const getStockLedger = async (params = {}) => {
  const { data, error } = await supabase.from('stock_ledger').select(`*, product:products(name, sku), location:locations(name)`);
  if (error) throw error;
  return { data };
};

export const getStockByProduct = async (productId) => {
  const { data, error } = await supabase.from('stock').select(`*, location:locations(name, warehouse:warehouses(name))`).eq('product_id', productId);
  if (error) throw error;
  return { data };
};

// ======================= WAREHOUSES & LOCATIONS =======================
export const getWarehouses = async () => {
  const { data, error } = await supabase.from('warehouses').select('*');
  if (error) throw error;
  return { data };
};

export const createWarehouse = async (data) => {
  const { locations, ...warehouseData } = data;
  const { data: resData, error } = await supabase.from('warehouses').insert([warehouseData]).select();
  if (error) throw error;
  
  const newWarehouseId = resData[0].id;
  
  if (locations && locations.length > 0) {
    const locationsToInsert = locations.map(loc => ({
      ...loc,
      warehouse_id: newWarehouseId
    }));
    await supabase.from('locations').insert(locationsToInsert);
  }
  
  return { data: { message: "Warehouse created successfully", id: newWarehouseId } };
};

export const updateWarehouse = async (data) => {
  const { id, ...updateData } = data;
  const { error } = await supabase.from('warehouses').update(updateData).eq('id', id);
  if (error) throw error;
  return { data: { message: "Warehouse updated successfully" } };
};

export const deleteWarehouse = async (id) => {
  const { error } = await supabase.from('warehouses').delete().eq('id', id);
  if (error) throw error;
  return { data: { message: "Warehouse deleted successfully" } };
};

export const getLocations = async (warehouseId) => {
  const { data, error } = await supabase.from('locations').select('*').eq('warehouse_id', warehouseId);
  if (error) throw error;
  return { data };
};

// ======================= DASHBOARD =======================
// We construct dashboard numbers by aggregating on the client side for this implementation plan
export const getDashboardKPIs = async () => {
    // 1. Total Products
    const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
    
    // 2. Low Stock Alerts (products where total stock < min_stock)
    const { data: products } = await supabase.from('products').select('id, min_stock');
    const { data: stockRecords } = await supabase.from('stock').select('product_id, quantity');
    
    let lowStockAlerts = 0;
    let totalStockValue = 0; // Mock calculation
    
    if (products && stockRecords) {
        const stockMap = {};
        stockRecords.forEach(r => {
            stockMap[r.product_id] = (stockMap[r.product_id] || 0) + r.quantity;
            totalStockValue += r.quantity; 
        });
        
        products.forEach(p => {
            const currentStock = stockMap[p.id] || 0;
            if (currentStock <= p.min_stock) lowStockAlerts++;
        });
    }

    // 3. Pending Receipts
    const { count: pendingReceipts } = await supabase.from('receipts').select('*', { count: 'exact', head: true }).neq('status', 'done');

    return { 
        data: { 
            total_products: totalProducts || 0,
            low_stock_alerts: lowStockAlerts,
            pending_receipts: pendingReceipts || 0,
            total_stock_value: totalStockValue // Just using quantity as mock value
        } 
    };
};

export const getRecentOperations = async (params = {}) => {
  const { data, error } = await supabase.from('stock_ledger')
    .select(`*, product:products(name)`)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return { data };
};

// ======================= PROFILE =======================
export const getProfile = async (id) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return { data };
};

export const updateProfile = async (data) => {
  const { id, ...updateData } = data;
  const { error } = await supabase.from('users').update(updateData).eq('id', id);
  if (error) throw error;
  return { data: { message: "Profile updated successfully" } };
};

export default { 
    signup, login, forgotPassword, resetPassword, logout,
    getProducts, getProduct, createProduct, updateProduct, deleteProduct,
    getCategories, createCategory, updateCategory, deleteCategory,
    getReceipts, getReceipt, createReceipt, updateReceipt, validateReceipt,
    getDeliveries, getDelivery, createDelivery, updateDelivery, validateDelivery,
    getTransfers, getTransfer, createTransfer, validateTransfer,
    getAdjustments, getAdjustment, createAdjustment, validateAdjustment,
    getStockLedger, getStockByProduct,
    getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, getLocations,
    getDashboardKPIs, getRecentOperations,
    getProfile, updateProfile
};
