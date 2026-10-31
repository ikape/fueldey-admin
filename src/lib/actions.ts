'use server';

import { revalidatePath } from 'next/cache';
import { api, ApiError } from './api';
import type { ActionResult } from './actionResult';
import { isValidRejectionReason, MIN_REJECTION_REASON_LENGTH, type KycDecisionResult } from './kyc';

export async function suspendUserAction(userId: string, reason: string) {
  await api.patch(`/users/admin/${userId}/suspend`, { reason: reason || undefined });
  revalidatePath('/dashboard/commuters');
  revalidatePath('/dashboard/vendors');
  revalidatePath(`/dashboard/users/${userId}`);
}

export async function reactivateUserAction(userId: string) {
  await api.patch(`/users/admin/${userId}/reactivate`);
  revalidatePath('/dashboard/commuters');
  revalidatePath('/dashboard/vendors');
  revalidatePath(`/dashboard/users/${userId}`);
}

export async function deleteUserAction(userId: string, reason: string) {
  await api.patch(`/users/admin/${userId}/delete`, { reason: reason || undefined });
  revalidatePath('/dashboard/commuters');
  revalidatePath('/dashboard/vendors');
  revalidatePath(`/dashboard/users/${userId}`);
}

async function decideUserKyc(userId: string, decision: 'approve' | 'reject', body?: { reason: string }): Promise<KycDecisionResult> {
  try {
    await api.patch(`/users/admin/${userId}/kyc/${decision}`, body);
  } catch (error) {
    // Only the backend's own refusals are expected; anything else (including the login redirect
    // api.ts throws on an expired session) must keep propagating.
    if (error instanceof ApiError) return { ok: false, error: error.message };
    throw error;
  }
  // The decision shows up in the queue, both user lists, the user page, the overview's pending
  // count and the sidebar badge — all under the dashboard layout.
  revalidatePath('/dashboard', 'layout');
  return { ok: true };
}

export async function approveUserKycAction(userId: string): Promise<KycDecisionResult> {
  return decideUserKyc(userId, 'approve');
}

export async function rejectUserKycAction(userId: string, reason: string): Promise<KycDecisionResult> {
  if (!isValidRejectionReason(reason)) {
    return { ok: false, error: `Give the user a reason (at least ${MIN_REJECTION_REASON_LENGTH} characters) so they know what to fix.` };
  }
  return decideUserKyc(userId, 'reject', { reason: reason.trim() });
}

export async function approveDocumentAction(documentId: string) {
  await api.post(`/documents/${documentId}/approve`);
  revalidatePath('/dashboard/kyc');
}

export async function rejectDocumentAction(documentId: string, reason: string) {
  await api.post(`/documents/${documentId}/reject`, { reason });
  revalidatePath('/dashboard/kyc');
}

export async function updateStationStatusAction(stationId: string, data: { isOpen?: boolean; isActive?: boolean }) {
  await api.put(`/stations/admin/${stationId}/status`, data);
  revalidatePath('/dashboard/stations');
  revalidatePath(`/dashboard/stations/${stationId}`);
}

export async function deleteStationAction(stationId: string) {
  await api.delete(`/stations/admin/${stationId}`);
  revalidatePath('/dashboard/stations');
}

async function decideWithdrawal(transactionId: string, decision: 'approve' | 'reject', body?: { reason: string }): Promise<ActionResult> {
  try {
    await api.post(`/wallet/admin/withdrawals/${transactionId}/${decision}`, body);
  } catch (error) {
    // Only the backend's own refusals are expected (already processed, Paystack said no, ...); anything
    // else, including the login redirect api.ts throws on an expired session, keeps propagating.
    if (error instanceof ApiError) return { ok: false, error: error.message };
    throw error;
  }
  // The queue, the overview figures, the vendor's wallet and the sidebar all change.
  revalidatePath('/dashboard', 'layout');
  return { ok: true };
}

export async function approveWithdrawalAction(transactionId: string): Promise<ActionResult> {
  return decideWithdrawal(transactionId, 'approve');
}

export async function rejectWithdrawalAction(transactionId: string, reason: string): Promise<ActionResult> {
  // The vendor is told why; an empty "no" teaches them nothing.
  if (!isValidRejectionReason(reason)) {
    return { ok: false, error: `Give the vendor a reason (at least ${MIN_REJECTION_REASON_LENGTH} characters).` };
  }
  return decideWithdrawal(transactionId, 'reject', { reason: reason.trim() });
}

export async function deleteReviewAction(reviewId: string) {
  await api.delete(`/reviews/admin/${reviewId}`);
  revalidatePath('/dashboard/reviews');
}

export async function createLegalDocumentAction(data: {
  type: string;
  target?: string;
  title: string;
  content: string;
  version: string;
}) {
  await api.post('/legal', data);
  revalidatePath('/dashboard/legal');
}

export async function updateLegalDocumentAction(id: string, data: Partial<{ title: string; content: string; version: string; isActive: boolean }>) {
  await api.put(`/legal/${id}`, data);
  revalidatePath('/dashboard/legal');
}

export async function deactivateLegalDocumentAction(id: string) {
  await api.delete(`/legal/${id}`);
  revalidatePath('/dashboard/legal');
}
