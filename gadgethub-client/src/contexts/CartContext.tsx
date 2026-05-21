// Cart Context - Global shopping cart state management
// EXACTLY matching your backend CartController and CartItem structure
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, AddToCartRequest, UpdateCartItemRequest } from '../types';
import { CartService } from '../services/cartService';
import { ProductService } from '../services/productService';
import { useCustomer } from './CustomerContext';

interface CartState {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

interface CartContextType extends CartState {
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  cartItems: [],
  isLoading: false,
  error: null,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_CART_ITEMS':
      return { ...state, cartItems: action.payload, error: null, isLoading: false };
    case 'ADD_ITEM':
      // Check if item already exists
      const existingItemIndex = state.cartItems.findIndex(
        item => item.productId === action.payload.productId
      );
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...state.cartItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity
        };
        return { ...state, cartItems: updatedItems };
      } else {
        // Add new item
        return { ...state, cartItems: [...state.cartItems, action.payload] };
      }
    case 'UPDATE_ITEM':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.productId !== action.payload),
      };
    case 'CLEAR_CART':
      return { ...state, cartItems: [] };
    default:
      return state;
  }
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { customer } = useCustomer();

  // Load cart from API - matching your backend GET /api/cart/{customerId}
  const loadCart = async () => {
    if (!customer) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await CartService.getCart(customer.id);
      
      if (response.success && response.data) {
        // Enrich cart items with complete product data if missing
        const enrichedCartItems = await enrichCartItemsWithProductData(response.data);
        dispatch({ type: 'SET_CART_ITEMS', payload: enrichedCartItems });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to load cart' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error loading cart' });
    }
  };

  // Enrich cart items with complete product data
  const enrichCartItemsWithProductData = async (cartItems: CartItem[]): Promise<CartItem[]> => {
    const enrichedItems = await Promise.all(
      cartItems.map(async (cartItem) => {
        // If product data is missing or incomplete, fetch it
        if (!cartItem.product || !cartItem.product.imageUrl || !cartItem.product.name) {
          try {
            const productResponse = await ProductService.getProductById(cartItem.productId);
            if (productResponse.success && productResponse.data) {
              return {
                ...cartItem,
                product: productResponse.data
              };
            }
          } catch (error) {
            console.warn(`Failed to fetch product data for product ${cartItem.productId}:`, error);
          }
        }
        return cartItem;
      })
    );
    return enrichedItems;
  };

  // Add to cart via API - matching your backend POST /api/cart/{customerId}/add
  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!customer) {
      console.error('Authentication required for cart operations');
      throw new Error('Please login to add items to cart');
    }

    try {
      const request: AddToCartRequest = { productId, quantity };
      const response = await CartService.addToCart(customer.id, request);
      
      if (response.success) {
        // Reload cart to get updated state
        await loadCart();
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  // Update cart item via API - matching your backend PUT /api/cart/{customerId}/update
  const updateCartItem = async (productId: string, quantity: number) => {
    if (!customer) {
      throw new Error('Please login to update cart items');
    }

    try {
      const request: UpdateCartItemRequest = { productId, quantity };
      const response = await CartService.updateCartItem(customer.id, request);
      
      if (response.success) {
        // Update local state
        dispatch({ type: 'UPDATE_ITEM', payload: { productId, quantity } });
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  };

  // Remove from cart via API - matching your backend DELETE /api/cart/{customerId}/remove/{productId}
  const removeFromCart = async (productId: string) => {
    if (!customer) {
      throw new Error('Please login to remove cart items');
    }

    try {
      // Call the DELETE endpoint
      const response = await CartService.removeFromCart(customer.id, productId);
      
      if (response.success) {
        // Update local state
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  };

  // Clear cart via API - matching your backend DELETE /api/cart/{customerId}/clear
  const clearCart = async () => {
    if (!customer) {
      throw new Error('Please login to clear cart');
    }

    try {
      // Call the DELETE all endpoint
      const response = await CartService.clearCart(customer.id);
      
      if (response.success) {
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const getCartTotal = (): number => {
    return state.cartItems.reduce((total, item) => {
      // Note: Backend doesn't store price in CartItem
      // Would need to fetch current product price or calculate elsewhere
      return total + (item.quantity * 0); // Placeholder - needs product price
    }, 0);
  };

  const getCartItemCount = (): number => {
    return state.cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Load cart when customer changes
  useEffect(() => {
    if (customer) {
      loadCart();
    }
  }, [customer]);

  const value: CartContextType = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    getCartTotal,
    getCartItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 