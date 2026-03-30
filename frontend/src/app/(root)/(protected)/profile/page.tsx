'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Calendar, CheckCircle, Clock, LogOut, Mail, Shield, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}>
            <Button variant="ghost" size="sm" className="mb-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-semibold overflow-hidden flex-shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <div className="flex items-center gap-2 mb-2">
                <Shield className={`w-4 h-4 ${user.role === "ADMIN" ? "text-amber-600" : "text-blue-600"}`} />
                <span className="text-sm font-semibold capitalize">
                  {user.role === "ADMIN" ? "Administrator" : "User"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {user.emailVerified ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Verified</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-600 font-medium">Not Verified</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <p className="px-4 py-3 bg-muted rounded-lg text-foreground">{user.email}</p>
            </div>

            {/* User ID */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                <User className="w-4 h-4" />
                User ID
              </label>
              <p className="px-4 py-3 bg-muted rounded-lg text-foreground font-mono text-xs break-all">
                {user.id}
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-2 block">Status</label>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.status || "ACTIVE"}
                </span>
              </div>
            </div>

            {/* Subscription Status */}
            {user.isSubscribed && (
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  Subscription
                </label>
                <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    ✓ You have an active subscription
                  </p>
                  {user.subscriptionEndsAt && (
                    <p className="text-xs text-blue-700 mt-1">
                      Expires: {formatDate(user.subscriptionEndsAt)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Account Created */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                Account Created
              </label>
              <p className="px-4 py-3 bg-muted rounded-lg text-foreground">
                {formatDate(user.createdAt)}
              </p>
            </div>

            {/* Email Verification Status */}
            {!user.emailVerified && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                <p className="text-sm font-medium mb-2">Email Not Verified</p>
                <p className="text-xs mb-3">
                  Please verify your email address to unlock all features.
                </p>
                <Link href="/verify-email">
                  <Button size="sm" variant="outline" className="bg-white">
                    Verify Email Now
                  </Button>
                </Link>
              </div>
            )}

            {/* Password Change Prompt */}
            {user.needPasswordChange && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
                <p className="text-sm font-medium mb-2">Change Password Required</p>
                <p className="text-xs mb-3">
                  For security reasons, you need to change your password.
                </p>
                <Link href="/change-password">
                  <Button size="sm" variant="outline" className="bg-white">
                    Change Password
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-border">
            <Link href="/change-password" className="flex-1">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
