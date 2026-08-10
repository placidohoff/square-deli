import React, { useEffect, useState } from 'react';
import EditItemCard from '../components/EditItemCard';
import EditItemCardCharlie from '../components/EditItemCardCharlie';
import LoginComponent from '../components/LoginComponent';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminMobileMenu from '../components/admin/AdminMobileMenu';
import AdminHeader from '../components/admin/AdminHeader';
import AdminCategoryPills from '../components/admin/AdminCategoryPills';
import AddItemForm from '../components/admin/AddItemForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { DELI_API_ROOT } from '../Constants';
import { getAuthToken, setAuthToken, clearAuthToken } from '../utils/authToken';
import { ADMIN_CATEGORIES } from '../utils/adminCategories';

const API_URL = DELI_API_ROOT + '/api/MenuItems/grouped';

function Edit() {
    // Keyed by group name (sandwiches, chickenWings, ...) — same shape
    // GET /api/MenuItems/grouped returns, so it can be used directly.
    const [groupedItems, setGroupedItems] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedKey, setSelectedKey] = useState('sandwiches');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [isMenuLoading, setIsMenuLoading] = useState(true);

    // If a token from a previous login is still saved, skip straight to the
    // admin view instead of making them log in again every time they visit
    // /edit. It's not verified against the server here — an expired/invalid
    // token just means the next PUT/POST/DELETE will fail with 401 (handled
    // in each component by logging out again).
    useEffect(() => {
        if (getAuthToken()) {
            setIsLoggedIn(true);
        }
    }, []);

    // showSpinner is only true for the initial mount fetch — refetches
    // triggered by create/delete/move should update the grid in place,
    // not flash the whole admin-main back to a loading screen.
    const loadMenuData = ({ showSpinner } = {}) => {
        if (showSpinner) setIsMenuLoading(true);

        fetch(API_URL)
            .then(res => res.json())
            .then(data => setGroupedItems(data))
            .catch(err => console.error('Error fetching menu data:', err))
            .finally(() => setIsMenuLoading(false));
    };

    useEffect(() => {
        loadMenuData({ showSpinner: true });
    }, []);

    const handleLogin = async (e, form) => {
        e.preventDefault();

        const { username, password } = form;

        try {
            const res = await fetch(`${DELI_API_ROOT}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const { error } = await res.json().catch(() => ({}));
                alert(error || 'Invalid credentials!');
                return;
            }

            const { token } = await res.json();
            setAuthToken(token);
            setIsLoggedIn(true);
        } catch (err) {
            console.error(err);
            alert('Login failed. Please check your connection and try again.');
        }
    };

    const handleLogout = () => {
        clearAuthToken();
        setIsLoggedIn(false);
    };

    const handleItemDeleted = (deletedId) => {
        setGroupedItems((prev) => ({
            ...prev,
            [selectedKey]: (prev[selectedKey] || []).filter((item) => item.id !== deletedId),
        }));
    };

    const handleItemCreated = () => {
        setIsAddingItem(false);
        loadMenuData();
    };

    const counts = Object.fromEntries(
        ADMIN_CATEGORIES.map(({ key }) => [key, (groupedItems[key] || []).length])
    );

    const selectedCategory = ADMIN_CATEGORIES.find((c) => c.key === selectedKey);
    const items = groupedItems[selectedKey] || [];
    const filteredItems = searchQuery
        ? items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : items;

    const AdminPage = () => (
        <div className="admin-layout">
            <AdminSidebar
                selectedKey={selectedKey}
                onSelect={(key) => { setSelectedKey(key); setSearchQuery(''); setIsAddingItem(false); }}
                onLogout={handleLogout}
            />

            <AdminMobileMenu onLogout={handleLogout} />

            <main className="admin-main">
                {isMenuLoading ? (
                    <LoadingSpinner label="Loading menu..." />
                ) : (
                    <>
                        <AdminHeader
                            selectedKey={selectedKey}
                            itemCount={filteredItems.length}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onAddClick={() => setIsAddingItem(true)}
                        />

                        <AdminCategoryPills
                            counts={counts}
                            selectedKey={selectedKey}
                            onSelect={(key) => { setSelectedKey(key); setSearchQuery(''); setIsAddingItem(false); }}
                        />

                        {isAddingItem && (
                            <AddItemForm
                                categoryValue={selectedCategory?.categoryValue}
                                onCreated={handleItemCreated}
                                onCancel={() => setIsAddingItem(false)}
                            />
                        )}

                        <div className="admin-item-grid">
                            {filteredItems.map((item) => {
                                // isFirst/isLast reflect the item's position within its
                                // full category list, not the (possibly search-filtered)
                                // list actually on screen — reordering is about the
                                // category's real stored order, so the up/down buttons
                                // shouldn't behave differently just because a search is
                                // active and hiding some of the items around it.
                                const indexInCategory = items.findIndex((i) => i.id === item.id);
                                const isFirst = indexInCategory === 0;
                                const isLast = indexInCategory === items.length - 1;

                                const props = { key: item.id, item, isFirst, isLast, onDeleted: handleItemDeleted, onMoved: loadMenuData };

                                return selectedKey === 'sandwiches'
                                    ? <EditItemCard {...props} />
                                    : <EditItemCardCharlie {...props} />;
                            })}
                        </div>
                    </>
                )}
            </main>
        </div>
    );

    return (
        <>
            {isLoggedIn ? <AdminPage /> : <LoginComponent handleLogin={handleLogin} />}
        </>
    );
}

export default Edit;
