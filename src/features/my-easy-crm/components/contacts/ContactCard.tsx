// =============================================
// MyEasyCRM - Contact Card Component
// =============================================

import {
  Mail,
  Phone,
  Building2,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';
import type { Contact } from '../../types';
import { formatPhone, getInitials } from '../../utils/formatters';

interface ContactCardProps {
  contact: Contact;
  onView?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  onLogActivity?: (contact: Contact) => void;
}

export function ContactCard({
  contact,
  onView,
  onEdit,
  onDelete,
  onLogActivity,
}: ContactCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Avatar and Info */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {getInitials(contact.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600"
              onClick={() => onView?.(contact)}
            >
              {contact.name}
            </h3>
            {contact.role && (
              <p className="text-sm text-gray-500 truncate">{contact.role}</p>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                {onView && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onView(contact);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalhes
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(contact);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                )}
                {onLogActivity && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onLogActivity(contact);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Registrar atividade
                  </button>
                )}
                {onDelete && (
                  <>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(contact);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-4 space-y-2">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400" />
            <a href={`mailto:${contact.email}`} className="hover:text-blue-600 truncate">
              {contact.email}
            </a>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
              {formatPhone(contact.phone)}
            </a>
          </div>
        )}
        {contact.company && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="truncate">{contact.company.name}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {contact.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
            >
              {tag}
            </span>
          ))}
          {contact.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
              +{contact.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
