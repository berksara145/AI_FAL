import { useState, useCallback } from "react";

/**
 * Hook to manage pending actions that should execute after streaming completes
 * Uses callback-based approach instead of polling
 */
export const useStreamingAction = () => {
  const [pendingActions, setPendingActions] = useState<Map<string, () => void>>(new Map());

  const setPendingAction = useCallback((messageId: string, action: () => void) => {
    setPendingActions((prev) => {
      const newMap = new Map(prev);
      newMap.set(messageId, action);
      return newMap;
    });
  }, []);

  const executeAction = useCallback((messageId: string) => {
    const action = pendingActions.get(messageId);
    if (action) {
      setPendingActions((prev) => {
        const newMap = new Map(prev);
        newMap.delete(messageId);
        return newMap;
      });
      // Small delay to ensure UI has updated
      setTimeout(() => {
        action();
      }, 100);
    }
  }, [pendingActions]);

  return { setPendingAction, executeAction };
};
