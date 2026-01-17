import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { womenAPI } from '../../utils/api';

const EmergencyContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ contact_name: '', contact_phone: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            const data = await womenAPI.getEmergencyContacts();
            setContacts(data.contacts || []);
        } catch (error) {
            console.error('Failed to load contacts:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await womenAPI.updateEmergencyContact(editingId, formData);
            } else {
                await womenAPI.createEmergencyContact(formData);
            }
            setFormData({ contact_name: '', contact_phone: '' });
            setShowForm(false);
            setEditingId(null);
            loadContacts();
        } catch (error) {
            console.error('Failed to save contact:', error);
            alert('Failed to save contact');
        }
    };

    const handleEdit = (contact) => {
        setFormData({ contact_name: contact.contact_name, contact_phone: contact.contact_phone });
        setEditingId(contact.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this contact?')) {
            try {
                await womenAPI.deleteEmergencyContact(id);
                loadContacts();
            } catch (error) {
                console.error('Failed to delete contact:', error);
            }
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-content container">
                <div className="flex-between mb-lg">
                    <h1>Emergency Contacts</h1>
                    <Link to="/woman" className="btn btn-secondary">← Back to Home</Link>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card mb-xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.08) 0%, rgba(0, 153, 255, 0.04) 100%)',
                        borderLeft: '4px solid var(--info)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                        <div style={{ fontSize: '2rem' }}>💡</div>
                        <p style={{ color: 'var(--gray-700)', fontWeight: '500', margin: 0 }}>
                            Add trusted contacts who will receive emergency alerts when you trigger SOS. At least one contact is required to use the SOS feature.
                        </p>
                    </div>
                </motion.div>

                {!showForm && (
                    <motion.button 
                        onClick={() => setShowForm(true)} 
                        className="btn btn-primary mb-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ fontSize: 'var(--font-size-lg)' }}
                    >
                        ➕ Add New Contact
                    </motion.button>
                )}

                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card mb-xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%)',
                            borderLeft: '4px solid var(--success)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                            <div style={{ fontSize: '2rem' }}>📝</div>
                            <h3 style={{ margin: 0 }}>{editingId ? 'Edit Contact' : 'Add New Contact'}</h3>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                                    👤 Contact Name
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.contact_name}
                                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                    placeholder="Enter contact name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                                    📱 Phone Number
                                </label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={formData.contact_phone}
                                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>

                            <div className="flex" style={{ gap: 'var(--space-md)' }}>
                                <button type="submit" className="btn btn-success" style={{ flex: 1 }}>💾 Save Contact</button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        setFormData({ contact_name: '', contact_phone: '' });
                                    }}
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                >
                                    ❌ Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div className="grid grid-2">
                    {contacts.map((contact, index) => (
                        <motion.div
                            key={contact.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.03, y: -4 }}
                            className="glass-card hover-lift"
                            style={{
                                background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.06) 0%, rgba(0, 153, 255, 0.03) 100%)',
                                borderLeft: '4px solid var(--primary)'
                            }}
                        >
                            <div className="flex-between">
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                                        <span style={{ fontSize: '1.5rem' }}>👤</span>
                                        <h4 style={{ margin: 0, color: 'var(--primary)' }}>{contact.contact_name}</h4>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginLeft: '2rem' }}>
                                        <span style={{ fontSize: '1rem' }}>📱</span>
                                        <p style={{ color: 'var(--gray-700)', fontWeight: '500', margin: 0 }}>{contact.contact_phone}</p>
                                    </div>
                                </div>
                                <div className="flex" style={{ gap: 'var(--space-sm)' }}>
                                    <button onClick={() => handleEdit(contact)} className="btn btn-sm btn-secondary">✏️ Edit</button>
                                    <button onClick={() => handleDelete(contact.id)} className="btn btn-sm btn-danger">🗑️ Delete</button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {contacts.length === 0 && !showForm && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card text-center" 
                        style={{ 
                            padding: 'var(--space-2xl)',
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)',
                            borderLeft: '4px solid var(--warning)'
                        }}
                    >
                        <p style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>📇</p>
                        <h3 style={{ color: 'var(--warning)' }}>No Emergency Contacts</h3>
                        <p style={{ color: 'var(--gray-700)', marginTop: 'var(--space-md)', fontWeight: '500' }}>
                            Add emergency contacts to enable SOS alerts
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default EmergencyContacts;
