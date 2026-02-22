import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

function generateShareCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function useList(user) {
  const [listId, setListId] = useState(() => localStorage.getItem('grocery-listId'))
  const [listData, setListData] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Listen to the list document
  useEffect(() => {
    if (!listId) {
      setLoading(false)
      return
    }
    const unsubscribe = onSnapshot(doc(db, 'lists', listId), (snap) => {
      if (snap.exists()) {
        setListData({ id: snap.id, ...snap.data() })
      } else {
        // List was deleted
        setListData(null)
        setListId(null)
        localStorage.removeItem('grocery-listId')
      }
    })
    return unsubscribe
  }, [listId])

  // Listen to items subcollection
  useEffect(() => {
    if (!listId) {
      setItems([])
      setLoading(false)
      return
    }
    const unsubscribe = onSnapshot(
      collection(db, 'lists', listId, 'items'),
      (snapshot) => {
        const newItems = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        // Sort newest first
        newItems.sort((a, b) => {
          const aTime = a.addedAt?.toMillis?.() || a.addedAt || 0
          const bTime = b.addedAt?.toMillis?.() || b.addedAt || 0
          return bTime - aTime
        })
        setItems(newItems)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [listId])

  const createList = useCallback(
    async (name = 'Our Groceries') => {
      const shareCode = generateShareCode()
      const listRef = doc(collection(db, 'lists'))
      await setDoc(listRef, {
        name,
        createdBy: user.uid,
        members: [user.uid],
        memberProfiles: {
          [user.uid]: {
            name: user.displayName || 'Me',
            emoji: '🧑',
          },
        },
        shareCode,
        createdAt: serverTimestamp(),
      })
      setListId(listRef.id)
      localStorage.setItem('grocery-listId', listRef.id)
      return { listId: listRef.id, shareCode }
    },
    [user]
  )

  const joinList = useCallback(
    async (shareCode) => {
      const q = query(collection(db, 'lists'), where('shareCode', '==', shareCode.toUpperCase()))
      const snapshot = await getDocs(q)
      if (snapshot.empty) {
        throw new Error('No list found with that code')
      }
      const listDoc = snapshot.docs[0]
      await updateDoc(listDoc.ref, {
        members: arrayUnion(user.uid),
        [`memberProfiles.${user.uid}`]: {
          name: user.displayName || 'Me',
          emoji: '👩',
        },
      })
      setListId(listDoc.id)
      localStorage.setItem('grocery-listId', listDoc.id)
    },
    [user]
  )

  const addItem = useCallback(
    async ({ name, category, quantity }) => {
      if (!listId) return
      const itemRef = doc(collection(db, 'lists', listId, 'items'))
      await setDoc(itemRef, {
        name,
        category,
        quantity,
        checked: false,
        assignedTo: null,
        note: '',
        addedBy: user.uid,
        addedAt: serverTimestamp(),
      })
    },
    [listId, user]
  )

  const updateItem = useCallback(
    async (itemId, updates) => {
      if (!listId) return
      await updateDoc(doc(db, 'lists', listId, 'items', itemId), updates)
    },
    [listId]
  )

  const toggleItem = useCallback(
    async (itemId, currentChecked) => {
      if (!listId) return
      await updateDoc(doc(db, 'lists', listId, 'items', itemId), {
        checked: !currentChecked,
      })
    },
    [listId]
  )

  const assignItem = useCallback(
    async (itemId, currentAssigned, userId) => {
      if (!listId) return
      await updateDoc(doc(db, 'lists', listId, 'items', itemId), {
        assignedTo: currentAssigned === userId ? null : userId,
      })
    },
    [listId]
  )

  const deleteItem = useCallback(
    async (itemId) => {
      if (!listId) return
      await deleteDoc(doc(db, 'lists', listId, 'items', itemId))
    },
    [listId]
  )

  const setItemNote = useCallback(
    async (itemId, note) => {
      if (!listId) return
      await updateDoc(doc(db, 'lists', listId, 'items', itemId), { note })
    },
    [listId]
  )

  const clearCompleted = useCallback(async () => {
    if (!listId) return
    const checkedItems = items.filter((i) => i.checked)
    await Promise.all(
      checkedItems.map((item) => deleteDoc(doc(db, 'lists', listId, 'items', item.id)))
    )
  }, [listId, items])

  const leaveList = useCallback(() => {
    setListId(null)
    setListData(null)
    setItems([])
    localStorage.removeItem('grocery-listId')
  }, [])

  return {
    listId,
    listData,
    items,
    loading,
    createList,
    joinList,
    addItem,
    updateItem,
    toggleItem,
    assignItem,
    deleteItem,
    setItemNote,
    clearCompleted,
    leaveList,
  }
}
