import React, { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

const Dropdown = ({
  trigger,
  items,
  onSelect,
  position = 'right',
  className,
}) => {
  const positionClasses = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  }

  return (
    <Menu as="div" className={clsx('relative inline-block text-left', className)}>
      <Menu.Button as={Fragment}>{trigger}</Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={clsx(
            'absolute z-50 mt-2 w-56 rounded-lg',
            'bg-white dark:bg-gray-800',
            'shadow-lg ring-1 ring-black ring-opacity-5',
            'focus:outline-none',
            'divide-y divide-gray-100 dark:divide-gray-700',
            positionClasses[position]
          )}
        >
          <div className="py-1">
            {items.map((item, index) => {
              if (item.divider) {
                return <div key={index} className="border-t border-gray-200 dark:border-gray-700 my-1" />
              }

              return (
                <Menu.Item key={index}>
                  {({ active }) => (
                    <button
                      onClick={() => onSelect(item.action, item)}
                      disabled={item.disabled}
                      className={clsx(
                        'group flex w-full items-center px-4 py-2 text-sm',
                        active && !item.disabled && 'bg-gray-100 dark:bg-gray-700',
                        item.danger
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-900 dark:text-white',
                        item.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {item.icon && (
                        <item.icon
                          className={clsx(
                            'mr-3 h-5 w-5',
                            item.danger
                              ? 'text-red-500'
                              : 'text-gray-400 group-hover:text-gray-500'
                          )}
                          aria-hidden="true"
                        />
                      )}
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.selected && (
                        <CheckIcon className="w-5 h-5 text-primary-600" />
                      )}
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )}
                </Menu.Item>
              )
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default Dropdown