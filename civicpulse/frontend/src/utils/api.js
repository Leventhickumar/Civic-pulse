export function getApiErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail[0]?.msg || fallback;
  }
  return detail || fallback;
}
