let _pendingId: number | null = null;

export const sharedPostStore = {
  set(id: number) { _pendingId = id; },
  consume(): number | null {
    const id = _pendingId;
    _pendingId = null;
    return id;
  },
};
