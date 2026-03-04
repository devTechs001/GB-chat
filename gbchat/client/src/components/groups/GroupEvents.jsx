/**
 * GroupEvents Component
 * Features:
 * - Create and manage group events
 * - RSVP tracking
 * - Event reminders
 * - Calendar integration
 * - Event chat
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  BellIcon,
  VideoCameraIcon,
  LinkIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Avatar from '../common/Avatar'
import Button from '../common/Button'
import Input from '../common/Input'
import Modal from '../common/Modal'
import TextArea from '../common/TextArea'
import clsx from 'clsx'

const GroupEvents = ({ groupId, events = [], onCreateEvent, onRSVP, onDeleteEvent }) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date())
  const pastEvents = events.filter(e => new Date(e.date) < new Date())

  return (
    <>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-500" />
            Events
          </h3>
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Event
          </Button>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.slice(0, 3).map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onClick={() => setSelectedEvent(event)}
                onRSVP={(status) => onRSVP?.(event._id, status)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No upcoming events</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-3"
              onClick={() => setShowCreateModal(true)}
            >
              Create your first event
            </Button>
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedEvent(pastEvents[0])}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              View {pastEvents.length} past {pastEvents.length === 1 ? 'event' : 'events'}
            </button>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          groupId={groupId}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(eventData) => {
            onCreateEvent?.(eventData)
            setShowCreateModal(false)
          }}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRSVP={(status) => {
            onRSVP?.(selectedEvent._id, status)
            setSelectedEvent({ ...selectedEvent, rsvp: status })
          }}
          onDelete={() => {
            onDeleteEvent?.(selectedEvent._id)
            setSelectedEvent(null)
          }}
        />
      )}
    </>
  )
}

const EventCard = ({ event, onClick, onRSVP }) => {
  const isSoon = new Date(event.date) - new Date() < 24 * 60 * 60 * 1000
  const rsvpCount = {
    going: event.rsvps?.filter(r => r.status === 'going').length || 0,
    maybe: event.rsvps?.filter(r => r.status === 'maybe').length || 0,
    notGoing: event.rsvps?.filter(r => r.status === 'not-going').length || 0,
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="p-4 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl cursor-pointer border border-primary-100 dark:border-primary-800"
    >
      <div className="flex items-start gap-4">
        {/* Date Badge */}
        <div className="flex-shrink-0 w-16 h-16 bg-white dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center shadow-sm">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            {new Date(event.date).toLocaleString('default', { month: 'short' })}
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {new Date(event.date).getDate()}
          </span>
        </div>

        {/* Event Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
            {event.title}
          </h4>
          
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span>
                {new Date(event.date).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {isSoon && (
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-medium animate-pulse">
                  Soon
                </span>
              )}
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RSVP Summary */}
      <div className="mt-3 flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <CheckCircleSolidIcon className="w-3 h-3" />
          {rsvpCount.going}
        </span>
        <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
          <QuestionMarkCircleIcon className="w-3 h-3" />
          {rsvpCount.maybe}
        </span>
        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <XCircleIcon className="w-3 h-3" />
          {rsvpCount.notGoing}
        </span>
      </div>
    </motion.div>
  )
}

const CreateEventModal = ({ groupId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    isOnline: false,
    onlineLink: '',
    sendReminder: true,
  })

  const handleSubmit = () => {
    if (!formData.title || !formData.date || !formData.time) return

    onSubmit({
      groupId,
      title: formData.title,
      description: formData.description,
      date: new Date(`${formData.date}T${formData.time}`).toISOString(),
      location: formData.isOnline ? (formData.onlineLink || 'Online') : formData.location,
      isOnline: formData.isOnline,
      onlineLink: formData.onlineLink,
      sendReminder: formData.sendReminder,
    })
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create Event"
      size="lg"
    >
      <div className="space-y-4">
        {/* Title */}
        <Input
          label="Event Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="What's the event?"
          maxLength={100}
        />

        {/* Description */}
        <TextArea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Tell members about the event..."
          rows={3}
          maxLength={500}
        />

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
          <Input
            label="Time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
        </div>

        {/* Event Type */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              This is an online event
            </span>
            <input
              type="checkbox"
              checked={formData.isOnline}
              onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })}
              className="toggle-switch"
            />
          </label>

          {formData.isOnline ? (
            <Input
              label="Meeting Link"
              value={formData.onlineLink}
              onChange={(e) => setFormData({ ...formData, onlineLink: e.target.value })}
              placeholder="Zoom, Google Meet, etc."
              icon={<LinkIcon className="w-4 h-4" />}
            />
          ) : (
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Where is the event?"
              icon={<MapPinIcon className="w-4 h-4" />}
            />
          )}
        </div>

        {/* Reminder */}
        <label className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl cursor-pointer">
          <BellIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Send reminder
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Notify members 1 hour before the event
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.sendReminder}
            onChange={(e) => setFormData({ ...formData, sendReminder: e.target.checked })}
            className="toggle-switch"
          />
        </label>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.title || !formData.date || !formData.time}
            fullWidth
          >
            Create Event
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const EventDetailModal = ({ event, onClose, onRSVP, onDelete }) => {
  const [activeTab, setActiveTab] = useState('details')
  
  const rsvps = {
    going: event.rsvps?.filter(r => r.status === 'going') || [],
    maybe: event.rsvps?.filter(r => r.status === 'maybe') || [],
    notGoing: event.rsvps?.filter(r => r.status === 'not-going') || [],
  }

  const userRSVP = event.rsvp
  const isCreator = event.isCreator

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Event Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="p-4 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {event.title}
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span>
                {new Date(event.date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* RSVP Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={userRSVP === 'going' ? 'primary' : 'secondary'}
            icon={<CheckCircleIcon className="w-4 h-4" />}
            onClick={() => onRSVP('going')}
            className={userRSVP === 'going' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            Going
          </Button>
          <Button
            variant={userRSVP === 'maybe' ? 'primary' : 'secondary'}
            icon={<QuestionMarkCircleIcon className="w-4 h-4" />}
            onClick={() => onRSVP('maybe')}
            className={userRSVP === 'maybe' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          >
            Maybe
          </Button>
          <Button
            variant={userRSVP === 'not-going' ? 'primary' : 'secondary'}
            icon={<XCircleIcon className="w-4 h-4" />}
            onClick={() => onRSVP('not-going')}
            className={userRSVP === 'not-going' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            Can't Go
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {['details', 'attendees'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2 text-sm font-medium capitalize transition-colors relative',
                activeTab === tab
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            {event.description && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  About this event
                </h4>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}
            
            {event.onlineLink && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                  <VideoCameraIcon className="w-5 h-5" />
                  <span className="font-medium">Join Online</span>
                </div>
                <a
                  href={event.onlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  {event.onlineLink}
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendees' && (
          <div className="space-y-4">
            {['going', 'maybe', 'notGoing'].map((status) => {
              const attendees = rsvps[status]
              if (attendees.length === 0) return null

              return (
                <div key={status}>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize flex items-center gap-2">
                    {status === 'going' && <CheckCircleSolidIcon className="w-4 h-4 text-green-500" />}
                    {status === 'maybe' && <QuestionMarkCircleIcon className="w-4 h-4 text-yellow-500" />}
                    {status === 'notGoing' && <XCircleIcon className="w-4 h-4 text-red-500" />}
                    {status.replace(/([A-Z])/g, ' $1').trim()} ({attendees.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {attendees.map((attendee) => (
                      <div
                        key={attendee._id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full"
                      >
                        <Avatar src={attendee.avatar} alt={attendee.name} size="xs" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {attendee.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {event.rsvps?.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No responses yet
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {isCreator && (
            <Button
              variant="danger"
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default GroupEvents
