import { useState, useEffect, useCallback, useRef } from "react";

const CATEGORIES = [
  { id: "produce", label: "Produce", icon: "🥬", color: "#4ade80" },
  { id: "dairy", label: "Dairy", icon: "🥛", color: "#93c5fd" },
  { id: "meat", label: "Meat & Fish", icon: "🥩", color: "#f87171" },
  { id: "bakery", label: "Bakery", icon: "🍞", color: "#fbbf24" },
  { id: "pantry", label: "Pantry", icon: "🫙", color: "#fb923c" },
  { id: "frozen", label: "Frozen", icon: "🧊", color: "#67e8f9" },
  { id: "drinks", label: "Drinks", icon: "🥤", color: "#c084fc" },
  { id: "snacks", label: "Snacks", icon: "🍿", color: "#f9a8d4" },
  { id: "household", label: "Household", icon: "🧹", color: "#a78bfa" },
  { id: "other", label: "Other", icon: "📦", color: "#94a3b8" },
];

const USERS = [
  { id: "marcus", name: "Marcus", emoji: "🧑", color: "#6366f1" },
  { id: "wife", name: "Wife", emoji: "👩", color: "#ec4899" },
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Storage helpers
const STORAGE_KEY = "grocery-list-v1";
const FAVORITES_KEY = "grocery-favorites-v1";

async function loadList() {
  try {
    const result = await window.storage.get(STORAGE_KEY, true);
    return result ? JSON.parse(result.value) : { items: [], lastUpdated: null };
  } catch {
    return { items: [], lastUpdated: null };
  }
}

async function saveList(data) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify({ ...data, lastUpdated: Date.now() }), true);
  } catch (e) {
    console.error("Save failed:", e);
  }
}

async function loadFavorites() {
  try {
    const result = await window.storage.get(FAVORITES_KEY, true);
    return result ? JSON.parse(result.value) : [];
  } catch {
    return [];
  }
}

async function saveFavorites(favs) {
  try {
    await window.storage.set(FAVORITES_KEY, JSON.stringify(favs), true);
  } catch (e) {
    console.error("Save favorites failed:", e);
  }
}

// Components
function CategoryPill({ cat, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 20,
        border: selected ? `2px solid ${cat.color}` : "2px solid transparent",
        background: selected ? `${cat.color}22` : "#1e1e2e",
        color: selected ? cat.color : "#94a3b8",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      <span>{cat.icon}</span>
      <span>{cat.label}</span>
    </button>
  );
}

function AssignButton({ user, assigned, onClick }) {
  const isAssigned = assigned === user.id;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        border: isAssigned ? `2px solid ${user.color}` : "2px solid #333",
        background: isAssigned ? `${user.color}33` : "transparent",
        fontSize: 14,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        padding: 0,
      }}
      title={`Assign to ${user.name}`}
    >
      {user.emoji}
    </button>
  );
}

function GroceryItem({ item, onToggle, onAssign, onDelete, onNote }) {
  const [showActions, setShowActions] = useState(false);
  const cat = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[9];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        background: item.checked ? "#1a1a2a" : "#1e1e30",
        borderRadius: 14,
        borderLeft: `4px solid ${item.checked ? "#333" : cat.color}`,
        opacity: item.checked ? 0.55 : 1,
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={() => setShowActions(!showActions)}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          border: item.checked ? "none" : `2px solid ${cat.color}55`,
          background: item.checked ? cat.color : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.2s",
          padding: 0,
        }}
      >
        {item.checked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Item info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: item.checked ? "#555" : "#e2e8f0",
            textDecoration: item.checked ? "line-through" : "none",
            letterSpacing: 0.2,
          }}
        >
          {item.name}
          {item.quantity > 1 && (
            <span style={{ color: cat.color, fontWeight: 700, marginLeft: 6, fontSize: 13 }}>×{item.quantity}</span>
          )}
        </div>
        {item.note && (
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, fontStyle: "italic" }}>
            {item.note}
          </div>
        )}
      </div>

      {/* Assigned user badge */}
      {item.assignedTo && (
        <span style={{ fontSize: 16 }}>
          {USERS.find((u) => u.id === item.assignedTo)?.emoji}
        </span>
      )}

      {/* Category badge */}
      <span style={{ fontSize: 16 }}>{cat.icon}</span>

      {/* Expanded actions */}
      {showActions && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 10,
            background: "#252540",
            borderRadius: "0 0 14px 14px",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ fontSize: 11, color: "#64748b", marginRight: 4 }}>Assign:</span>
          {USERS.map((u) => (
            <AssignButton key={u.id} user={u} assigned={item.assignedTo} onClick={() => onAssign(u.id)} />
          ))}
          <button
            onClick={() => {
              const note = prompt("Add a note:", item.note || "");
              if (note !== null) onNote(note);
            }}
            style={{
              marginLeft: "auto",
              padding: "4px 10px",
              borderRadius: 8,
              border: "1px solid #444",
              background: "transparent",
              color: "#94a3b8",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            📝 Note
          </button>
          <button
            onClick={onDelete}
            style={{
              padding: "4px 10px",
              borderRadius: 8,
              border: "1px solid #f8717144",
              background: "transparent",
              color: "#f87171",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}

function AddItemForm({ onAdd, favorites }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("other");
  const [quantity, setQuantity] = useState(1);
  const [showFavorites, setShowFavorites] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (name.length > 0 && favorites.length > 0) {
      const filtered = favorites
        .filter((f) => f.name.toLowerCase().includes(name.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [name, favorites]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), category, quantity });
    setName("");
    setQuantity(1);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div style={{ padding: "16px 16px 8px" }}>
      {/* Input row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Add item..."
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: "2px solid #2a2a40",
              background: "#13131f",
              color: "#e2e8f0",
              fontSize: 15,
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={() => name === "" && setShowFavorites(true)}
            onBlur={() => setTimeout(() => { setShowFavorites(false); setSuggestions([]); }, 200)}
          />
          {/* Autocomplete suggestions */}
          {suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#252540",
                borderRadius: "0 0 12px 12px",
                zIndex: 20,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                overflow: "hidden",
              }}
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={() => {
                    setName(s.name);
                    setCategory(s.category);
                    setSuggestions([]);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "10px 16px",
                    background: "transparent",
                    border: "none",
                    color: "#e2e8f0",
                    fontSize: 14,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <span>{CATEGORIES.find((c) => c.id === s.category)?.icon}</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#13131f", borderRadius: 12, border: "2px solid #2a2a40", padding: "0 8px" }}>
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 18, cursor: "pointer", padding: "4px", fontFamily: "inherit" }}
          >
            −
          </button>
          <span style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 18, cursor: "pointer", padding: "4px", fontFamily: "inherit" }}
          >
            +
          </button>
        </div>

        {/* Add button */}
        <button
          onClick={handleSubmit}
          style={{
            padding: "0 20px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            fontSize: 20,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "transform 0.15s",
          }}
        >
          +
        </button>
      </div>

      {/* Category selector */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 8,
          scrollbarWidth: "none",
        }}
      >
        {CATEGORIES.map((cat) => (
          <CategoryPill key={cat.id} cat={cat} selected={category === cat.id} onClick={() => setCategory(cat.id)} />
        ))}
      </div>

      {/* Quick-add favorites */}
      {showFavorites && favorites.length > 0 && name === "" && (
        <div style={{ marginTop: 4, marginBottom: 4 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
            ⭐ Frequently added
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {favorites.slice(0, 8).map((f, i) => (
              <button
                key={i}
                onMouseDown={() => {
                  setName(f.name);
                  setCategory(f.category);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 10,
                  border: "1px solid #2a2a40",
                  background: "#1a1a2e",
                  color: "#cbd5e1",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {CATEGORIES.find((c) => c.id === f.category)?.icon} {f.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main App
export default function GroceryApp() {
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, marcus, wife
  const [view, setView] = useState("active"); // active, completed
  const pollRef = useRef(null);

  // Load initial data
  useEffect(() => {
    async function init() {
      const [listData, favsData] = await Promise.all([loadList(), loadFavorites()]);
      setItems(listData.items || []);
      setFavorites(favsData || []);
      setLoading(false);
    }
    init();
  }, []);

  // Poll for sync every 5 seconds
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      const data = await loadList();
      if (data.items) setItems(data.items);
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  const persist = useCallback(
    async (newItems) => {
      setItems(newItems);
      await saveList({ items: newItems });
    },
    []
  );

  const addItem = useCallback(
    async ({ name, category, quantity }) => {
      const newItem = {
        id: generateId(),
        name,
        category,
        quantity,
        checked: false,
        assignedTo: null,
        note: "",
        addedAt: Date.now(),
      };
      const newItems = [newItem, ...items];
      await persist(newItems);

      // Update favorites
      const existingFav = favorites.find((f) => f.name.toLowerCase() === name.toLowerCase());
      let newFavs;
      if (existingFav) {
        newFavs = favorites.map((f) =>
          f.name.toLowerCase() === name.toLowerCase() ? { ...f, count: f.count + 1 } : f
        ).sort((a, b) => b.count - a.count);
      } else {
        newFavs = [...favorites, { name, category, count: 1 }].sort((a, b) => b.count - a.count);
      }
      setFavorites(newFavs);
      await saveFavorites(newFavs);
    },
    [items, favorites, persist]
  );

  const toggleItem = useCallback(
    async (id) => {
      const newItems = items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      await persist(newItems);
    },
    [items, persist]
  );

  const assignItem = useCallback(
    async (id, userId) => {
      const newItems = items.map((item) =>
        item.id === id ? { ...item, assignedTo: item.assignedTo === userId ? null : userId } : item
      );
      await persist(newItems);
    },
    [items, persist]
  );

  const deleteItem = useCallback(
    async (id) => {
      const newItems = items.filter((item) => item.id !== id);
      await persist(newItems);
    },
    [items, persist]
  );

  const setNote = useCallback(
    async (id, note) => {
      const newItems = items.map((item) =>
        item.id === id ? { ...item, note } : item
      );
      await persist(newItems);
    },
    [items, persist]
  );

  const clearCompleted = useCallback(async () => {
    const newItems = items.filter((item) => !item.checked);
    await persist(newItems);
  }, [items, persist]);

  // Filtered and grouped items
  const filteredItems = items.filter((item) => {
    if (filter !== "all" && item.assignedTo !== filter) return false;
    if (view === "active" && item.checked) return false;
    if (view === "completed" && !item.checked) return false;
    return true;
  });

  const groupedItems = CATEGORIES.map((cat) => ({
    ...cat,
    items: filteredItems.filter((item) => item.category === cat.id),
  })).filter((g) => g.items.length > 0);

  const totalItems = items.filter((i) => !i.checked).length;
  const checkedItems = items.filter((i) => i.checked).length;
  const progress = items.length > 0 ? (checkedItems / items.length) * 100 : 0;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ color: "#6366f1", fontSize: 18 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        fontFamily: "'DM Sans', sans-serif",
        color: "#e2e8f0",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
        paddingBottom: 20,
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)",
          padding: "24px 20px 16px",
          borderBottom: "1px solid #1e1e30",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 700,
                margin: 0,
                background: "linear-gradient(135deg, #e2e8f0, #94a3b8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🛒 GrocerySync
            </h1>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
              {totalItems} items left · {checkedItems} done
            </p>
          </div>
          {checkedItems > 0 && (
            <button
              onClick={clearCompleted}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid #333",
                background: "transparent",
                color: "#94a3b8",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Clear done ✓
            </button>
          )}
        </div>

        {/* Progress bar */}
        {items.length > 0 && (
          <div style={{ height: 4, background: "#1e1e30", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: progress === 100
                  ? "linear-gradient(90deg, #4ade80, #22c55e)"
                  : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                borderRadius: 4,
                transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "all", label: "All" },
            { id: "marcus", label: "🧑 Marcus" },
            { id: "wife", label: "👩 Wife" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 10,
                border: "none",
                background: filter === f.id ? "#6366f1" : "#1e1e30",
                color: filter === f.id ? "#fff" : "#94a3b8",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {f.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setView(view === "active" ? "completed" : "active")}
            style={{
              padding: "6px 14px",
              borderRadius: 10,
              border: "1px solid #2a2a40",
              background: "transparent",
              color: "#94a3b8",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {view === "active" ? "Show done" : "Show active"}
          </button>
        </div>
      </div>

      {/* Add item form */}
      <AddItemForm onAdd={addItem} favorites={favorites} />

      {/* Items grouped by category */}
      <div style={{ padding: "0 16px" }}>
        {groupedItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#475569" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {view === "active" ? "🎉" : "📋"}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {view === "active"
                ? items.length === 0
                  ? "Add your first item above!"
                  : "All done! Great job!"
                : "No completed items yet"}
            </div>
          </div>
        )}

        {groupedItems.map((group) => (
          <div key={group.id} style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                padding: "4px 0",
              }}
            >
              <span style={{ fontSize: 14 }}>{group.icon}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: group.color,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                {group.label}
              </span>
              <span style={{ fontSize: 11, color: "#475569" }}>({group.items.length})</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {group.items.map((item) => (
                <GroceryItem
                  key={item.id}
                  item={item}
                  onToggle={() => toggleItem(item.id)}
                  onAssign={(userId) => assignItem(item.id, userId)}
                  onDelete={() => deleteItem(item.id)}
                  onNote={(note) => setNote(item.id, note)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sync indicator */}
      <div
        style={{
          position: "fixed",
          bottom: 12,
          right: 12,
          fontSize: 10,
          color: "#334155",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
        Syncing
      </div>
    </div>
  );
}
