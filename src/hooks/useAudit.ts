'use client';

import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api/audit';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

export function useAuditLog() {
  return useQuery({
    queryKey: QUERY_KEYS.administration.audit.all,
    queryFn: () => auditApi.list(),
  });
}
