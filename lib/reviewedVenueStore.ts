let _pendingVenueId: number | null = null;

export const reviewedVenueStore = {
  set(id: number) { _pendingVenueId = id; },
  consume(): number | null {
    const id = _pendingVenueId;
    _pendingVenueId = null;
    return id;
  },
};
