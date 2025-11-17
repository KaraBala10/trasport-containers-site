"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-primary-dark">
                Dashboard
              </h1>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Welcome, {user?.first_name || user?.username}!
                </h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Link
                  href="/create-shipment"
                  className="bg-primary-yellow text-primary-dark p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-bold mb-2">Create Shipment</h3>
                  <p className="text-gray-700">Create a new shipment request</p>
                </Link>

                <Link
                  href="/tracking"
                  className="bg-white border-2 border-primary-dark p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-bold mb-2">Track Shipment</h3>
                  <p className="text-gray-700">Track your existing shipments</p>
                </Link>

                <Link
                  href="/quote"
                  className="bg-white border-2 border-primary-dark p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-bold mb-2">Get Quote</h3>
                  <p className="text-gray-700">Request a shipping quote</p>
                </Link>

                <Link
                  href="/profile"
                  className="bg-white border-2 border-primary-dark p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-bold mb-2">Profile</h3>
                  <p className="text-gray-700">Manage your account settings</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
