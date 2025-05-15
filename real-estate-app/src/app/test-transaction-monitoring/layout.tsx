'use client';

import Link from 'next/link';
import { HomeIcon, CreditCardIcon, ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function TestTransactionMonitoringLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <nav className="bg-indigo-600">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Link href="/" className="flex items-center">
                                    <HomeIcon className="h-8 w-8 text-white" />
                                    <span className="ml-2 text-white text-lg font-semibold">Real Estate App</span>
                                </Link>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <Link
                                        href="/test-payment-experience"
                                        className="text-gray-300 hover:bg-indigo-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                                    >
                                        <ArrowLeftIcon className="inline-block h-4 w-4 mr-1" />
                                        Payment Experience
                                    </Link>
                                    <Link
                                        href="/test-transaction-ui"
                                        className="text-gray-300 hover:bg-indigo-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                                    >
                                        <CreditCardIcon className="inline-block h-4 w-4 mr-1" />
                                        Transaction UI
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-4 flex items-center md:ml-6">
                                <span className="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-indigo-400/30">
                                    <DocumentTextIcon className="h-3 w-3 mr-1" />
                                    Transaction Monitoring
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main>{children}</main>
        </div>
    );
}
