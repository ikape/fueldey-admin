'use server';

import { revalidatePath } from 'next/cache';
import { api } from './api';

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

export async function approveWithdrawalAction(transactionId: string) {
  await api.post(`/wallet/admin/withdrawals/${transactionId}/approve`);
  revalidatePath('/dashboard/wallet');
}

export async function rejectWithdrawalAction(transactionId: string, reason: string) {
  await api.post(`/wallet/admin/withdrawals/${transactionId}/reject`, { reason: reason || undefined });
  revalidatePath('/dashboard/wallet');
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
