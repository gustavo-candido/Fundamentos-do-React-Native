import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.clear();
      const storageProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );
      if (storageProducts) setProducts(JSON.parse(storageProducts));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const alreadyOnChart = products.some(item => item.id === product.id);
      if (alreadyOnChart) return;

      setProducts([...products, { ...product, quantity: 1 }]);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newState = products.map(item => {
        if (item.id === id) {
          const addedItem = { ...item };
          addedItem.quantity += 1;
          return addedItem;
        }
        return item;
      });

      setProducts(newState);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newState = products.map(item => {
        if (item.id === id) {
          const addedItem = { ...item };
          if (addedItem.quantity) addedItem.quantity -= 1;
          return addedItem;
        }
        return item;
      });

      const filterState = newState.filter(product => product.quantity !== 0);

      setProducts(filterState);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
