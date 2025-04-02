'use client';

import { useEffect } from 'react';
// Import the function to define the custom elements from the ionicons loader
import { defineCustomElements } from 'ionicons/dist/loader';

export default function IoniconsSetup() {
  useEffect(() => {
    // Define the ionicons custom elements (runs only on the client)
    // This makes the <ion-icon> tag available
    defineCustomElements(window);
  }, []);

  return null; // This component doesn't render anything visible
}
