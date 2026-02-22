import { useAuth } from './hooks/useAuth'
import { useList } from './hooks/useList'
import { useFavorites } from './hooks/useFavorites'
import LoginScreen from './components/LoginScreen'
import ListSetup from './components/ListSetup'
import GroceryApp from './components/GroceryApp'

export default function App() {
  const { user, loading: authLoading, signInWithGoogle, logOut } = useAuth()
  const {
    listId,
    listData,
    items,
    loading: listLoading,
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
  } = useList(user)
  const { favorites, trackFavorite } = useFavorites(listId)

  if (authLoading) {
    return (
      <div style={styles.loadingScreen}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
        <div style={styles.loadingText}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onSignIn={signInWithGoogle} />
  }

  if (!listId || !listData) {
    return (
      <ListSetup
        user={user}
        loading={listLoading}
        onCreateList={createList}
        onJoinList={joinList}
        onSignOut={logOut}
      />
    )
  }

  return (
    <GroceryApp
      user={user}
      listData={listData}
      items={items}
      favorites={favorites}
      onAddItem={addItem}
      onUpdateItem={updateItem}
      onToggleItem={toggleItem}
      onAssignItem={assignItem}
      onDeleteItem={deleteItem}
      onSetNote={setItemNote}
      onClearCompleted={clearCompleted}
      onTrackFavorite={trackFavorite}
      onLeaveList={leaveList}
      onSignOut={logOut}
    />
  )
}

const styles = {
  loadingScreen: {
    minHeight: '100vh',
    background: '#0f0f1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif",
  },
  loadingText: {
    color: '#6366f1',
    fontSize: 18,
  },
}
