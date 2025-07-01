  export const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);

    return date.toLocaleString("en-IN", {
      weekday: "short",        // Optional: "Tue"
      year: "numeric",
      month: "long",           // "June"
      day: "numeric",          // "24"
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,            // AM/PM format
      timeZone: "Asia/Kolkata" // IST
    });
  };