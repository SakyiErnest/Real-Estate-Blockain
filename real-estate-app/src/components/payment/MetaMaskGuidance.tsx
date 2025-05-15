'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowPathIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface MetaMaskGuidanceProps {
  onRefresh: () => void;
}

export default function MetaMaskGuidance({ onRefresh }: MetaMaskGuidanceProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Small delay to show the refreshing state
    setTimeout(() => {
      onRefresh();
      setIsRefreshing(false);
    }, 1000);
  };

  const getBrowserInfo = () => {
    if (typeof window === 'undefined') return null;
    
    const userAgent = navigator.userAgent;
    
    if (userAgent.indexOf("Chrome") > -1) {
      return {
        name: "Chrome",
        icon: "🌐",
        url: "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
      };
    } else if (userAgent.indexOf("Firefox") > -1) {
      return {
        name: "Firefox",
        icon: "🦊",
        url: "https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/"
      };
    } else if (userAgent.indexOf("Edge") > -1) {
      return {
        name: "Edge",
        icon: "🌐",
        url: "https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm"
      };
    } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
      return {
        name: "Safari",
        icon: "🧭",
        url: "https://metamask.io/download/"
      };
    } else {
      return {
        name: "your browser",
        icon: "🌐",
        url: "https://metamask.io/download/"
      };
    }
  };

  const browserInfo = getBrowserInfo();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 mb-4 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="64" height="64" viewBox="0 0 318 318" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M274.1 35.5L174.6 109.4L193 65.8L274.1 35.5Z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M44.4 35.5L143.1 110.1L125.6 65.8L44.4 35.5Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M238.3 206.8L211.8 247.4L268.5 263L284.8 207.7L238.3 206.8Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M33.9 207.7L50.1 263L106.8 247.4L80.3 206.8L33.9 207.7Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M103.6 138.2L87.8 162.1L144.1 164.6L142.1 104.1L103.6 138.2Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M214.9 138.2L175.9 103.4L174.6 164.6L230.8 162.1L214.9 138.2Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M106.8 247.4L140.6 230.9L111.4 208.1L106.8 247.4Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M177.9 230.9L211.8 247.4L207.1 208.1L177.9 230.9Z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900">MetaMask Extension Required</h3>
        <p className="mt-2 text-sm text-gray-600">
          To connect your wallet and make cryptocurrency payments, you need to install the MetaMask extension.
        </p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-md p-4">
          <h4 className="font-medium text-gray-900 mb-2">How to Install MetaMask</h4>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
            <li>Click the link below to go to the MetaMask download page for {browserInfo?.name}</li>
            <li>Click "Add to {browserInfo?.name}" on the extension page</li>
            <li>Follow the installation instructions</li>
            <li>Create a new wallet or import an existing one</li>
            <li>Return to this page and click "Refresh" below</li>
          </ol>
        </div>

        <div className="flex flex-col space-y-3">
          <a 
            href={browserInfo?.url || "https://metamask.io/download/"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            {browserInfo?.icon} Install MetaMask for {browserInfo?.name}
            <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
          </a>
          
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isRefreshing ? (
              <>
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" />
                Refreshing...
              </>
            ) : (
              <>
                <ArrowPathIcon className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
                I've Installed MetaMask - Refresh
              </>
            )}
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>
            MetaMask is a secure wallet for blockchain applications. It allows you to store and manage your cryptocurrency, 
            as well as interact with decentralized applications like our real estate marketplace.
          </p>
        </div>
      </div>
    </div>
  );
}
