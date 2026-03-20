export const markInviteAsSent = (targetUserId: number | string) => {
  const id = Number(targetUserId);
  let sent = JSON.parse(localStorage.getItem("sent_invites_tracker") || "[]");
  if (!sent.includes(id)) {
    sent.push(id);
    if (sent.length > 100) sent = sent.slice(-100);
    localStorage.setItem("sent_invites_tracker", JSON.stringify(sent));
  }
};

export const hasSentInvite = (targetUserId: number | string): boolean => {
  const sent = JSON.parse(localStorage.getItem("sent_invites_tracker") || "[]");
  return sent.includes(Number(targetUserId));
};

export const clearSentInvite = (targetUserId: number | string) => {
  const id = Number(targetUserId);
  let sent = JSON.parse(localStorage.getItem("sent_invites_tracker") || "[]");
  sent = sent.filter((item: number) => item !== id);
  localStorage.setItem("sent_invites_tracker", JSON.stringify(sent));
};
