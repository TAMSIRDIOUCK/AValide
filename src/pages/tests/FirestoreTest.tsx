import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const FirestoreTest = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(items);
      } catch (error) {
        console.error('Erreur Firestore :', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Produits depuis Firestore</h2>
      {products.length === 0 ? (
        <p>Aucun produit trouvé.</p>
      ) : (
        <ul className="space-y-2">
          {products.map((p) => (
            <li key={p.id} className="border p-2 rounded">
              <strong>{p.title}</strong> – {p.price} FCFA
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FirestoreTest;
