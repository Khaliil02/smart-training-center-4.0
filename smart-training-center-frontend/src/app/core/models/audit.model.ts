export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  userId: number;
  details: string;
  timestamp: string;
}
