import React from 'react'
import { useNavigate } from 'react-router-dom'
import { UsersIcon } from '@heroicons/react/24/outline'
import ContactList from '../components/contacts/ContactList'
import PageHeader from '../components/layout/PageHeader'
import useChatStore from '../store/useChatStore'
import toast from 'react-hot-toast'

/**
 * ContactsPage — address book backed by /api/contacts.
 * Opening a contact starts (or resumes) a real conversation via POST /api/chats.
 */
const ContactsPage = () => {
  const navigate = useNavigate()
  const createChat = useChatStore((state) => state.createChat)
  const setActiveChat = useChatStore((state) => state.setActiveChat)

  const handleCreateChat = async (contact) => {
    // Contacts may or may not have a linked GBChat user id
    const targetId = contact.contactUserId || contact.userId || contact._id
    const chat = await createChat(targetId)
    if (chat) {
      setActiveChat(chat)
      navigate(`/chats?chat=${chat._id}`)
    } else {
      toast.error('Could not start a conversation with this contact')
    }
  }

  return (
    <div className="page-shell app-canvas">
      <PageHeader title="Contacts" icon={UsersIcon} subtitle="Your address book" />
      <div className="page-scroll">
        <ContactList
          onContactSelect={(contact) => navigate(`/profile/${contact.contactUserId || contact._id}`)}
          onCreateChat={handleCreateChat}
        />
      </div>
    </div>
  )
}

export default ContactsPage
