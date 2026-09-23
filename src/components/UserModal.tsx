import React, { useState } from 'react';
import { X, Check, User, Mail, Globe, Tag, Sparkles } from 'lucide-react';
import { brazeService } from '../services/brazeService';
import type { CurrentUserAttributes } from '../types/braze';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUserAttributes;
  onUserUpdated: (user: CurrentUserAttributes) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
}) => {
  const [userId, setUserId] = useState(currentUser.userId);
  const [email, setEmail] = useState(currentUser.email);
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [country, setCountry] = useState(currentUser.country || 'ES');
  const [customKey, setCustomKey] = useState('account_tier');
  const [customVal, setCustomVal] = useState('enterprise');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CurrentUserAttributes = {
      userId: userId.trim() || 'anonymous_user',
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      country: country.trim(),
      customAttributes: {
        ...currentUser.customAttributes,
        ...(customKey.trim() ? { [customKey.trim()]: customVal.trim() } : {}),
      },
    };

    brazeService.changeUser(updated);
    onUserUpdated(updated);
    onClose();
  };

  const handlePreloadBrazeUser = () => {
    setUserId('alvaro_barroso');
    setEmail('alvaro.barroso@braze.com');
    setFirstName('Alvaro');
    setLastName('Barroso');
    setCountry('ES');
    setCustomKey('account_tier');
    setCustomVal('enterprise');
  };

  const handlePreloadVipUser = () => {
    setUserId('vip_shopper_01');
    setEmail('shopper.vip@example.com');
    setFirstName('Elena');
    setLastName('Vargas');
    setCountry('US');
    setCustomKey('loyalty_status');
    setCustomVal('platinum');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Braze User Attribution</h3>
              <p className="text-xs text-slate-500">Sync attributes via braze.changeUser() &amp; getUser()</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={handlePreloadBrazeUser}
            className="px-2.5 py-1 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
          >
            Alvaro Barroso (Braze)
          </button>
          <button
            type="button"
            onClick={handlePreloadVipUser}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors"
          >
            Elena (VIP Shopper)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              External User ID (braze.changeUser)
            </label>
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
              placeholder="e.g. user_12345"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                placeholder="Alvaro"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                placeholder="Barroso"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Country Code</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                placeholder="ES, US, GB"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Custom Attribute (setCustomUserAttribute)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="Attribute Key"
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
              <input
                type="text"
                value={customVal}
                onChange={(e) => setCustomVal(e.target.value)}
                placeholder="Attribute Value"
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Sync to Braze SDK</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
