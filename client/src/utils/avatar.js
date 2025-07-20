export function getAvatarUrl(avatarPath) {
  if (!avatarPath) return null;
  return avatarPath.startsWith('http')
    ? avatarPath
    : `http://localhost:5000${avatarPath}`;
} 