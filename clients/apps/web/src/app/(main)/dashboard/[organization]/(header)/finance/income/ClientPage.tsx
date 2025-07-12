'use client'

import AccountBalance from '@/components/Payouts/AccountBalance'
import AccountBanner from '@/components/Transactions/AccountBanner'
import TransactionsList from '@/components/Transactions/TransactionsList'
import { useNetRevenueSummary, useOrganizationAccount, useSearchTransactions } from '@/hooks/queries'
import {
  DataTablePaginationState,
  DataTableSortingState,
  getAPIParams,
  serializeSearchParams,
} from '@/utils/datatable'
import { schemas } from '@polar-sh/client'
import { usePathname, useRouter } from 'next/navigation'

export default function ClientPage({
  pagination,
  sorting,
  organization,
}: {
  pagination: DataTablePaginationState
  sorting: DataTableSortingState
  organization: schemas['Organization']
}) {
  const router = useRouter()
  const pathname = usePathname()

  const setPagination = (
    updaterOrValue:
      | DataTablePaginationState
      | ((old: DataTablePaginationState) => DataTablePaginationState),
  ) => {
    const updatedPagination =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(pagination)
        : updaterOrValue

    router.push(
      `${pathname}?${serializeSearchParams(updatedPagination, sorting)}`,
    )
  }

  const setSorting = (
    updaterOrValue:
      | DataTableSortingState
      | ((old: DataTableSortingState) => DataTableSortingState),
  ) => {
    const updatedSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue

    router.push(
      `${pathname}?${serializeSearchParams(pagination, updatedSorting)}`,
    )
  }

  const { data: account, isLoading: accountIsLoading } = useOrganizationAccount(
    organization.id,
  )

  const { data: netRevenueSummary, isLoading: netRevenueSummaryIsLoading } = useNetRevenueSummary(
    account?.id ?? "",
  )

  const balancesHook = useSearchTransactions({
    account_id: account?.id,
    type: 'balance',
    exclude_platform_fees: true,
    ...getAPIParams(pagination, sorting),
  })
  const balances = balancesHook.data?.items || []
  const balancesCount = balancesHook.data?.pagination.max_page ?? 1

  return (
    <div className="flex flex-col gap-y-6">
      <AccountBanner organization={organization} />
      {netRevenueSummary && (
        <div>
          <h2>Net Revenue: {netRevenueSummary.net_revenue}</h2>
          <p>Gross Revenue: {netRevenueSummary.gross_revenue}</p>
          <p>Refunds: {netRevenueSummary.refunds}</p>
          <p>Payment Fees: {netRevenueSummary.payment_fees}</p>
          <p>Payout Fees: {netRevenueSummary.payout_fees}</p>
        </div>
      )}
      {account && (
        <AccountBalance
          account={account}
          onWithdrawSuccess={() =>
            router.push(`/dashboard/${organization.slug}/finance/payouts`)
          }
        />
      )}
      <TransactionsList
        transactions={balances}
        pageCount={balancesCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={accountIsLoading || balancesHook.isLoading}
      />
    </div>
  )
}
