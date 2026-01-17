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

                <div className="glass-card mb-xl">
                    <p style={{ color: 'var(--gray-600)' }}>
                        Add trusted contacts who will receive emergency alerts when you trigger SOS. At least one contact is required to use the SOS feature.
                    </p>
                </div>

                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="btn btn-primary mb-lg">
                        + Add New Contact
                    </button>
                )}

                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card mb-xl"
                    >
                        <h3>{editingId ? 'Edit Contact' : 'Add New Contact'}</h3>
                        <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-lg)' }}>
                            <div className="form-group">
                                <label className="form-label">Contact Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.contact_name}
                                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={formData.contact_phone}
                                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex" style={{ gap: 'var(--space-md)' }}>
                                <button type="submit" className="btn btn-primary">Save Contact</button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        setFormData({ contact_name: '', contact_phone: '' });
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Cancel
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
                            className="glass-card"
                        >
                            <div className="flex-between">
                                <div>
                                    <h4>{contact.contact_name}</h4>
                                    <p style={{ color: 'var(--gray-600)' }}>{contact.contact_phone}</p>
                                </div>
                                <div className="flex" style={{ gap: 'var(--space-sm)' }}>
                                    <button onClick={() => handleEdit(contact)} className="btn btn-sm btn-secondary">Edit</button>
                                    <button onClick={() => handleDelete(contact.id)} className="btn btn-sm btn-danger">Delete</button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {contacts.length === 0 && !showForm && (
                    <div className="glass-card text-center" style={{ padding: 'var(--space-2xl)' }}>
                        <p style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-md)' }}>📇</p>
                        <h3>No Emergency Contacts</h3>
                        <p style={{ color: 'var(--gray-600)', marginTop: 'var(--space-md)' }}>
                            Add emergency contacts to enable SOS alerts
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmergencyContacts;
