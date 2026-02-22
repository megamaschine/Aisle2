import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  increment,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useFavorites(listId) {
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    if (!listId) {
      setFavorites([])
      return
    }
    const unsubscribe = onSnapshot(
      collection(db, 'lists', listId, 'favorites'),
      (snapshot) => {
        const favs = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.count || 0) - (a.count || 0))
        setFavorites(favs)
      }
    )
    return unsubscribe
  }, [listId])

  const trackFavorite = useCallback(
    async (name, category) => {
      if (!listId) return
      // Use a deterministic ID based on the lowercase name
      const favId = name.toLowerCase().replace(/[^a-z0-9]/g, '_')
      const favRef = doc(db, 'lists', listId, 'favorites', favId)
      await setDoc(
        favRef,
        {
          name,
          category,
          count: increment(1),
        },
        { merge: true }
      )
    },
    [listId]
  )

  return { favorites, trackFavorite }
}
