/**
 * ChannelMonetization Component
 * Features:
 * - Subscription tiers management
 * - Payment tracking
 * - Revenue analytics
 * - Exclusive content for subscribers
 * - Payout management
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  StarIcon,
  TrophyIcon,
  SparklesIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  LockClosedIcon,
  GiftIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Button from '../common/Button'
import Input from '../common/Input'
import Modal from '../common/Modal'
import clsx from 'clsx'

const ChannelMonetization = ({ channel, onManageTiers, onWithdraw }) => {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data - replace with real API data
  const monetization = {
    balance: {
      available: 2450.75,
      pending: 380.50,
      total: 15680.25,
    },
    revenue: {
      thisMonth: 1250.00,
      lastMonth: 980.00,
      growth: 27.5,
    },
    subscribers: {
      total: 450,
      byTier: {
        free: 320,
        premium: 95,
        vip: 35,
      },
      growth: 15.2,
    },
    tiers: [
      {
        id: 1,
        name: 'Free',
        price: 0,
        subscribers: 320,
        benefits: ['Access to public posts', 'Basic community access'],
        icon: StarIcon,
        color: 'gray',
      },
      {
        id: 2,
        name: 'Premium',
        price: 4.99,
        subscribers: 95,
        benefits: ['Exclusive content', 'Early access', 'Premium badge', 'Direct messaging'],
        icon: TrophyIcon,
        color: 'purple',
      },
      {
        id: 3,
        name: 'VIP',
        price: 9.99,
        subscribers: 35,
        benefits: ['All Premium benefits', '1-on-1 calls', 'Custom emoji', 'Priority support'],
        icon: SparklesIcon,
        color: 'yellow',
      },
    ],
    recentTransactions: [
      { id: 1, type: 'subscription', user: 'John D.', amount: 4.99, date: '2024-01-15' },
      { id: 2, type: 'subscription', user: 'Sarah M.', amount: 9.99, date: '2024-01-15' },
      { id: 3, type: 'tip', user: 'Mike R.', amount: 5.00, date: '2024-01-14' },
      { id: 4, type: 'subscription', user: 'Emma W.', amount: 4.99, date: '2024-01-14' },
      { id: 5, type: 'withdrawal', amount: -500.00, date: '2024-01-10', status: 'completed' },
    ],
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <CurrencyDollarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Monetization
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your channel revenue
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={<BanknotesIcon className="w-4 h-4" />}
          onClick={() => onWithdraw?.()}
        >
          Withdraw
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        {['overview', 'tiers', 'transactions', 'payouts'].map((tab) => (
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
      {activeTab === 'overview' && <OverviewTab monetization={monetization} />}
      {activeTab === 'tiers' && <TiersTab tiers={monetization.tiers} onManage={onManageTiers} />}
      {activeTab === 'transactions' && <TransactionsTab transactions={monetization.recentTransactions} />}
      {activeTab === 'payouts' && <PayoutsTab monetization={monetization} />}
    </div>
  )
}

const OverviewTab = ({ monetization }) => {
  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <BanknotesIcon className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-90">Available Balance</span>
          </div>
          <p className="text-3xl font-bold mb-1">
            ${monetization.balance.available.toFixed(2)}
          </p>
          <p className="text-xs opacity-75">Ready to withdraw</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-90">Pending</span>
          </div>
          <p className="text-3xl font-bold mb-1">
            ${monetization.balance.pending.toFixed(2)}
          </p>
          <p className="text-xs opacity-75">Processing</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <ChartBarIcon className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-90">Total Earned</span>
          </div>
          <p className="text-3xl font-bold mb-1">
            ${monetization.balance.total.toFixed(2)}
          </p>
          <p className="text-xs opacity-75">All time</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Revenue Overview
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">This Month</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${monetization.revenue.thisMonth.toFixed(2)}
            </span>
            <span className={clsx(
              'flex items-center gap-1 text-sm font-medium',
              monetization.revenue.growth > 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {monetization.revenue.growth > 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              {monetization.revenue.growth > 0 ? '+' : ''}{monetization.revenue.growth}%
            </span>
          </div>
        </div>
        
        <div className="h-32 flex items-end justify-between gap-2">
          {[45, 62, 58, 75, 82, 68, 90, 85, 95, 100, 88, 92].map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-md transition-all hover:from-primary-600 hover:to-primary-500"
              style={{ height: `${value}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
        </div>
      </div>

      {/* Subscriber Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        {monetization.tiers.map((tier) => {
          const Icon = tier.icon
          const colorClasses = {
            gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
          }

          return (
            <div
              key={tier.id}
              className={clsx('p-4 rounded-xl flex items-center gap-4', colorClasses[tier.color])}
            >
              <div className={clsx(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                tier.price > 0 ? 'bg-white dark:bg-gray-800' : ''
              )}>
                <Icon className={clsx(
                  'w-6 h-6',
                  tier.price > 0 ? 'text-primary-500' : ''
                )} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {tier.name}
                  </h4>
                  {tier.price > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ${tier.price}/mo
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-75">
                  {tier.subscribers} subscribers
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${(tier.price * tier.subscribers).toFixed(2)}
                </p>
                <p className="text-xs opacity-75">/month</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const TiersTab = ({ tiers, onManage }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Subscription Tiers
        </h3>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusIcon className="w-4 h-4" />}
          onClick={() => onManage?.()}
        >
          Add Tier
        </Button>
      </div>

      <div className="space-y-3">
        {tiers.map((tier) => {
          const Icon = tier.icon
          
          return (
            <div
              key={tier.id}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {tier.name}
                      </h4>
                      {tier.price > 0 && (
                        <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs font-medium">
                          ${tier.price}/month
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {tier.subscribers} subscribers
                    </p>
                    <ul className="space-y-1">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary-500 rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onManage?.(tier)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  {tier.price > 0 && (
                    <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const TransactionsTab = ({ transactions }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Recent Transactions
      </h3>

      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className={clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                transaction.type === 'withdrawal'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              )}>
                {transaction.type === 'withdrawal' ? (
                  <BanknotesIcon className="w-5 h-5" />
                ) : transaction.type === 'tip' ? (
                  <GiftIcon className="w-5 h-5" />
                ) : (
                  <CreditCardIcon className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {transaction.type}
                  {transaction.user && ` from ${transaction.user}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={clsx(
                'font-bold',
                transaction.amount < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              )}>
                {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
              </p>
              {transaction.status && (
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {transaction.status}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const PayoutsTab = ({ monetization }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('')

  return (
    <div className="space-y-6">
      {/* Withdraw Card */}
      <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
        <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm opacity-90 mb-1">Available Balance</p>
            <p className="text-3xl font-bold">${monetization.balance.available.toFixed(2)}</p>
          </div>
          
          <div>
            <label className="block text-sm opacity-90 mb-2">
              Withdrawal Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">$</span>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-white/20 backdrop-blur-sm rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 text-lg font-medium"
                max={monetization.balance.available}
              />
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full bg-white text-green-600 hover:bg-white/90"
            disabled={!withdrawAmount || parseFloat(withdrawAmount) > monetization.balance.available}
          >
            Request Withdrawal
          </Button>

          <p className="text-xs opacity-75 text-center">
            Minimum withdrawal: $10.00 • Processing time: 2-5 business days
          </p>
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Payment Methods
        </h3>
        <div className="space-y-3">
          <div className="p-4 border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCardIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Bank Account</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">•••• 4242</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                Default
              </span>
            </div>
          </div>

          <button className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">Add Payment Method</span>
          </button>
        </div>
      </div>

      {/* Payout History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Payout History
        </h3>
        <div className="space-y-2">
          {[
            { amount: 500, date: '2024-01-10', status: 'completed' },
            { amount: 350, date: '2023-12-15', status: 'completed' },
            { amount: 420, date: '2023-11-20', status: 'completed' },
          ].map((payout, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  ${payout.amount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(payout.date).toLocaleDateString()}
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full capitalize">
                {payout.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Helper icon
const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default ChannelMonetization
