import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { ProductProvider } from './src/context/ProductContext';
import { UserProvider } from './src/context/UserContext';

export default function App() {
  return (
    <UserProvider>
      <ProductProvider>
        <RootNavigator />
      </ProductProvider>
    </UserProvider>
  );
}
